# -*- coding: utf-8 -*-
"""
📄 VegaWin Parsers & File Readers
Excel (.xlsx, .xls), SQLite (.db, .sqlite), CSV, metin ve ikili SonSatisHareket dosyalarını çözümleme
"""
import os
import csv
import openpyxl
from backend.utils.text_utils import clean_barcode_text, clean_product_title, parse_price, fix_turkish_corrupted_chars, is_invalid_or_blacklisted_product

def normalize_text(text: str) -> str:
    return str(text).strip() if text is not None else ""

def parse_vegawin_file(file_path: str) -> list:
    """
    Herhangi bir VegaWin/FasterPOS veritabanı (.db, .sqlite), Excel, CSV veya metin dosyasını okur.
    Tüm olası tablo ve kolon yapılarını (STOKKART, TBLSTOK, MALZEME, URUNLER vb.) dinamik olarak çözümler.
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext in ['.sqlite', '.db', '.sqlite3', '.sdb', '.fdb']:
        import sqlite3
        try:
            conn = sqlite3.connect(f"file:{file_path}?mode=ro", uri=True)
        except Exception:
            try:
                conn = sqlite3.connect(file_path)
            except Exception:
                return []
        
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        try:
            cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [r[0] for r in cur.fetchall()]
        except Exception:
            conn.close()
            return []
        
        if not tables:
            conn.close()
            return []

        candidate_tables = []
        for t in tables:
            t_lower = t.lower()
            try:
                cur.execute(f"PRAGMA table_info([{t}]);")
                col_info = cur.fetchall()
                col_names = [c[1].lower() for c in col_info]
                
                score = 0
                if any(c in col_names for c in ['barcode', 'barkod', 'barkod1', 'ean', 'stok_kodu', 'stokkodu', 'kod', 'code']):
                    score += 2
                if any(c in col_names for c in ['title', 'urun_adi', 'malincinsi', 'stokadi', 'name', 'aciklama']):
                    score += 2
                if any(c in col_names for c in ['price', 'fiyat', 'satis_fiyati', 'satisfiyati1', 'satisfiyati', 'fiyat1', 'sfiyat']):
                    score += 2
                if 'stok' in t_lower or 'urun' in t_lower or 'kart' in t_lower or 'malzeme' in t_lower:
                    score += 1

                if score >= 2:
                    candidate_tables.append((score, t, col_info))
            except Exception:
                continue

        candidate_tables.sort(key=lambda x: x[0], reverse=True)

        if not candidate_tables:
            for t in tables:
                try:
                    cur.execute(f"PRAGMA table_info([{t}]);")
                    candidate_tables.append((1, t, cur.fetchall()))
                    break
                except Exception:
                    pass

        if not candidate_tables:
            conn.close()
            return []

        items = []
        for _, target_table, col_info in candidate_tables:
            cols = {c[1].lower(): c[1] for c in col_info}
            try:
                cur.execute(f"SELECT * FROM [{target_table}] LIMIT 15000;")
                rows = cur.fetchall()
            except Exception:
                continue

            b_key = None
            for cand in ['barcode', 'barkod', 'barkod1', 'ean', 'stok_kodu', 'stokkodu', 'kod', 'code', 'id']:
                if cand in cols:
                    b_key = cols[cand]
                    break
            
            t_key = None
            for cand in ['title', 'urun_adi', 'malincinsi', 'stokadi', 'malin_cinsi', 'stok_adi', 'name', 'aciklama', 'stokkodu']:
                if cand in cols:
                    t_key = cols[cand]
                    break

            p_key = None
            for cand in ['price', 'satis_fiyati', 'satisfiyati1', 'fiyat', 'satisfiyati', 'fiyat1', 'sfiyat', 'tutari', 'tutar']:
                if cand in cols:
                    p_key = cols[cand]
                    break

            sc_key = cols.get('stok_kodu') or cols.get('stokkodu') or cols.get('kod')
            br_key = cols.get('brand') or cols.get('marka') or cols.get('ureticisi')
            unit_key = cols.get('unit') or cols.get('birim') or cols.get('olcubirimi')

            for r in rows:
                b = clean_barcode_text(r[b_key]) if b_key and r[b_key] is not None else ""
                if not b:
                    continue
                t_raw = normalize_text(r[t_key]) if t_key and r[t_key] is not None else f"Ürün {b}"
                p = parse_price(r[p_key]) if p_key and r[p_key] is not None else 0.0
                sc = normalize_text(r[sc_key]) if sc_key and r[sc_key] is not None else ""
                brand = normalize_text(r[br_key]) if br_key and r[br_key] is not None else ""
                unit = normalize_text(r[unit_key]) if unit_key and r[unit_key] is not None else "ADET"

                clean_t = clean_product_title(t_raw)
                if is_invalid_or_blacklisted_product(b, clean_t, p):
                    continue

                items.append({
                    "barcode": b,
                    "stock_code": sc,
                    "title": clean_t,
                    "price": p,
                    "brand": brand,
                    "unit": unit
                })

            if items:
                break

        conn.close()
        return items

    elif ext in ['.xlsx', '.xlsm', '.xltx']:
        try:
            wb = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
            sheet = wb.active
            rows = list(sheet.iter_rows(values_only=True))
            wb.close()
            if not rows:
                return []
            
            header_idx = -1
            col_map = {}
            for idx, r in enumerate(rows[:10]):
                if not r: continue
                r_lower = [str(c).lower().strip() if c is not None else '' for c in r]
                b_found = any(x in r_lower for x in ['barcode', 'barkod', 'barkod1', 'ean', 'stok_kodu', 'stokkodu', 'kod'])
                t_found = any(x in r_lower for x in ['title', 'urun_adi', 'malincinsi', 'stokadi', 'stok_adi', 'malin_cinsi', 'aciklama'])
                if b_found and t_found:
                    header_idx = idx
                    for col_i, col_name in enumerate(r_lower):
                        col_map[col_name] = col_i
                    break

            if header_idx == -1:
                header_idx = 0
                r_lower = [str(c).lower().strip() if c is not None else '' for c in rows[0]]
                for col_i, col_name in enumerate(r_lower):
                    col_map[col_name] = col_i

            b_idx = None
            for cand in ['barcode', 'barkod', 'barkod1', 'ean', 'stok_kodu', 'stokkodu', 'kod']:
                if cand in col_map:
                    b_idx = col_map[cand]
                    break
            
            t_idx = None
            for cand in ['title', 'urun_adi', 'malincinsi', 'stokadi', 'stok_adi', 'malin_cinsi', 'aciklama']:
                if cand in col_map:
                    t_idx = col_map[cand]
                    break

            p_idx = None
            for cand in ['price', 'satis_fiyati', 'satisfiyati1', 'fiyat', 'satisfiyati', 'fiyat1', 'sfiyat']:
                if cand in col_map:
                    p_idx = col_map[cand]
                    break

            items = []
            for r in rows[header_idx + 1:]:
                if not r: continue
                b = clean_barcode_text(r[b_idx]) if b_idx is not None and b_idx < len(r) and r[b_idx] is not None else ""
                if not b:
                    continue
                t_raw = normalize_text(r[t_idx]) if t_idx is not None and t_idx < len(r) and r[t_idx] is not None else f"Ürün {b}"
                p = parse_price(r[p_idx]) if p_idx is not None and p_idx < len(r) and r[p_idx] is not None else 0.0

                clean_t = clean_product_title(t_raw)
                if is_invalid_or_blacklisted_product(b, clean_t, p):
                    continue

                items.append({
                    "barcode": b,
                    "stock_code": "",
                    "title": clean_t,
                    "price": p,
                    "brand": "",
                    "unit": "ADET"
                })
            return items
        except Exception:
            return []

    elif ext in ['.csv', '.txt']:
        try:
            items = []
            for enc in ['utf-8-sig', 'windows-1254', 'iso-8859-9', 'utf-8', 'cp1252']:
                try:
                    with open(file_path, mode='r', encoding=enc) as f:
                        content = f.read()
                        if content:
                            items = parse_raw_text_products(content)
                            if items:
                                break
                except Exception:
                    continue
            return items
        except Exception:
            return []

    return []

def parse_raw_text_products(raw_text: str) -> list:
    """Panodan kopyalanmış tab / noktalı virgül / virgül ayrılmış metin satırlarını çözer."""
    if not raw_text or not raw_text.strip():
        return []

    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    if not lines:
        return []

    sample = "\n".join(lines[:10])
    delimiter = '\t'
    if '\t' in sample:
        delimiter = '\t'
    elif ';' in sample:
        delimiter = ';'
    elif ',' in sample and sample.count(',') > sample.count(' '):
        delimiter = ','
    elif '|' in sample:
        delimiter = '|'

    reader = list(csv.reader(lines, delimiter=delimiter))
    if not reader:
        return []

    col_map = {}
    header_idx = -1
    for idx, r in enumerate(reader[:5]):
        r_lower = [str(c).lower().strip() for c in r]
        b_found = any(x in r_lower for x in ['barkod', 'barcode', 'ean', 'stok_kodu', 'stokkodu', 'kod', 'code'])
        t_found = any(x in r_lower for x in ['malincinsi', 'malin_cinsi', 'urun_adi', 'stokadi', 'title', 'name', 'aciklama', 'stok_adi'])
        if b_found and t_found:
            header_idx = idx
            for col_i, col_name in enumerate(r_lower):
                col_map[col_name] = col_i
            break

    b_idx, t_idx, p_idx, sc_idx, br_idx, u_idx = None, None, None, None, None, None

    if header_idx != -1:
        for cand in ['barkod', 'barcode', 'ean', 'stok_kodu', 'stokkodu', 'kod', 'code']:
            if cand in col_map: b_idx = col_map[cand]; break
        for cand in ['malincinsi', 'malin_cinsi', 'urun_adi', 'stokadi', 'title', 'name', 'aciklama', 'stok_adi']:
            if cand in col_map: t_idx = col_map[cand]; break
        for cand in ['satisfiyati', 'satisfiyati1', 'satis_fiyati', 'price', 'fiyat', 'fiyat1', 'sfiyat', 'tutari', 'tutar']:
            if cand in col_map: p_idx = col_map[cand]; break
        for cand in ['stokkodu', 'stok_kodu', 'kod', 'code']:
            if cand in col_map and col_map[cand] != b_idx: sc_idx = col_map[cand]; break
        for cand in ['marka', 'brand', 'ureticisi']:
            if cand in col_map: br_idx = col_map[cand]; break
        for cand in ['birim', 'unit', 'olcubirimi']:
            if cand in col_map: u_idx = col_map[cand]; break
        start_idx = header_idx + 1
    else:
        start_idx = 0
        first_row = reader[0]
        for col_i, val in enumerate(first_row):
            v_clean = clean_barcode_text(val)
            if (len(v_clean) in (8, 12, 13, 14) and v_clean.isdigit()) or (b_idx is None and len(v_clean) >= 6 and v_clean.isdigit()):
                b_idx = col_i
            elif any(curr in val for curr in ['₺', 'TL', 'tl', ',']) or (val.replace('.', '').replace(',', '').isdigit() and p_idx is None and b_idx != col_i):
                p_idx = col_i
            elif len(val) > 3 and t_idx is None and b_idx != col_i:
                t_idx = col_i

        if b_idx is None and len(first_row) > 0: b_idx = 0
        if t_idx is None and len(first_row) > 1: t_idx = 1
        if p_idx is None and len(first_row) > 2: p_idx = 2

    items = []
    for r in reader[start_idx:]:
        if not r: continue
        b = clean_barcode_text(r[b_idx]) if b_idx is not None and b_idx < len(r) else ""
        if not b:
            continue
        t_raw = normalize_text(r[t_idx]) if t_idx is not None and t_idx < len(r) else f"Ürün {b}"
        p = parse_price(r[p_idx]) if p_idx is not None and p_idx < len(r) else 0.0
        sc = normalize_text(r[sc_idx]) if sc_idx is not None and sc_idx < len(r) else ""
        brand = normalize_text(r[br_idx]) if br_idx is not None and br_idx < len(r) else ""
        unit = normalize_text(r[u_idx]) if u_idx is not None and u_idx < len(r) else "ADET"

        clean_t = clean_product_title(t_raw)
        if is_invalid_or_blacklisted_product(b, clean_t, p):
            continue

        items.append({
            "barcode": b,
            "stock_code": sc,
            "title": clean_t,
            "raw_system_title": t_raw,
            "price": p,
            "brand": brand,
            "unit": unit
        })

    return items

def parse_sonsatishareket_file(file_path: str) -> list:
    """VegaWin / FasterPOS SonSatisHareket ikili/metin veri dosyasını okur."""
    if not os.path.exists(file_path):
        return []
    
    items = []
    try:
        with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
            content = f.read()
            if content:
                items = parse_raw_text_products(content)
    except Exception:
        pass
    return items

def scan_vegawin_directory(dir_path: str) -> tuple:
    """Belirtilen klasörü tarayarak uygun stok ve veritabanı dosyalarını bulup çözümler."""
    if not os.path.isdir(dir_path):
        raise ValueError(f"Klasör bulunamadı: {dir_path}")

    found_files = []
    for root, _, files in os.walk(dir_path):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            f_lower = f.lower()
            full_p = os.path.join(root, f)
            if ext in ['.db', '.sqlite', '.sqlite3', '.xlsx', '.xls', '.csv'] or 'sonsatishareket' in f_lower:
                found_files.append(full_p)

    def sort_key(p):
        ext = os.path.splitext(p)[1].lower()
        fname = os.path.basename(p).lower()
        if 'market_sistemi' in fname: return 0
        if ext in ['.db', '.sqlite', '.sqlite3']: return 1
        if 'stok' in fname or 'fiyat' in fname: return 2
        if ext in ['.xlsx', '.xls']: return 3
        return 4

    found_files.sort(key=sort_key)

    for fp in found_files:
        items = parse_vegawin_file(fp)
        if items:
            return items, os.path.basename(fp)

    return [], ""
