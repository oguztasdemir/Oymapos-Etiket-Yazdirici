# -*- coding: utf-8 -*-
"""
🗄️ SQLite Veritabanı Servisi (WAL Modu, ACID Uyumlu, Thread-Safe, Gelişmiş Türkçe Arama, Yeni Ürün & Fiyat Takibi)
"""
import os
import sqlite3
import threading
import datetime
from typing import List, Dict, Optional, Any
from contextlib import contextmanager
from backend.config import DB_PATH

_DB_LOCK = threading.RLock()

def fix_turkish_corrupted_chars(text: str) -> str:
    """Bozuk karakterleri (\ufffd, null byte veya kodlama artıkları) düzeltir."""
    if not text:
        return ""
    s = str(text).replace('\x00', '').strip()
    word_map = {
        'L\ufffdTRE': 'LİTRE',
        'BO\ufffdAZ\ufffd': 'BOĞAZİÇİ',
        'EK\ufffd': 'EKŞİ',
        'V\ufffdV\ufffdDENT': 'VIVIDENT',
        'T\ufffdRK\ufffdYE': 'TÜRKİYE',
        'D\ufffd\ufffdER': 'DİĞER',
        'D\ufffdER': 'DİĞER',
        'F\ufffdST\ufffdK': 'FISTIK',
        'KAR\ufffd\ufffd\ufffdK': 'KARIŞIK',
        '\ufffdEKER': 'ŞEKER',
        'ZEYT\ufffdN': 'ZEYTİN',
        'B\ufffdSK\ufffdV\ufffd': 'BİSKÜVİ',
        '\ufffd\ufffdKOLATA': 'ÇİKOLATA',
        'G\ufffdFRET': 'GOFRET',
        'S\ufffdT': 'SÜT',
        'PEYN\ufffdR': 'PEYNİR',
        'YO\ufffdURT': 'YOĞURT',
        'EKMEK': 'EKMEK',
        '\ufffd-': '-',
        '-\ufffd': '-',
        '\ufffd': ''
    }
    for k, v in word_map.items():
        s = s.replace(k, v)
    return s

def fold_turkish_text(text: str) -> str:
    """Türkçe karakterleri normalize ederek 'ı/i', 'ş/s', 'ğ/g' vb. harfleri eşleştirir."""
    if not text:
        return ""
    tr_map = {
        'I': 'i', 'İ': 'i', 'ı': 'i',
        'Ş': 's', 'ş': 's',
        'Ğ': 'g', 'ğ': 'g',
        'Ü': 'u', 'ü': 'u',
        'Ö': 'o', 'ö': 'o',
        'Ç': 'c', 'ç': 'c'
    }
    s = str(text)
    for k, v in tr_map.items():
        s = s.replace(k, v)
    return s.lower()

def clean_barcode_text(val) -> str:
    """Excel veya formlardan gelen barkoddaki .0 veya boşluk artıklarını temizler."""
    if val is None:
        return ""
    s = str(val).strip()
    if s.endswith('.0'):
        s = s[:-2]
    return s.strip()

def parse_price(val) -> float:
    """Her türlü fiyat formatını (Türkçe 1.250,50 veya Uluslararası 1,250.50) temiz float'a çevirir."""
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace('TL', '').replace('tl', '').replace('₺', '').strip()
    if ',' in s and '.' in s:
        last_comma = s.rfind(',')
        last_dot = s.rfind('.')
        if last_comma > last_dot:  # Örn: 1.250,50 (Türkçe format)
            s = s.replace('.', '').replace(',', '.')
        else:  # Örn: 1,250.50 (Uluslararası format)
            s = s.replace(',', '')
    elif ',' in s:
        s = s.replace(',', '.')
    try:
        return round(float(s), 2)
    except Exception:
        return 0.0

def format_product_dict(row: dict) -> dict:
    """Veritabanından dönen satırı standart temiz formata dönüştürür."""
    if not row:
        return {}
    d = dict(row)
    price_val = d.get('price_num') if d.get('price_num') is not None else d.get('price')
    d['price'] = parse_price(price_val)
    d['barcode'] = clean_barcode_text(d.get('barcode', ''))
    raw_title = str(d.get('title') or d.get('title1') or '').strip()
    d['title'] = fix_turkish_corrupted_chars(raw_title)
    d['brand'] = fix_turkish_corrupted_chars(str(d.get('brand') or '').strip())
    d['stock_code'] = str(d.get('stock_code') or '').strip()
    d['source_device'] = str(d.get('source_device') or 'OYMAPOS Barkod Sistemi').strip()
    d['is_new'] = bool(d.get('is_new', 0))
    d['created_at'] = str(d.get('created_at') or '').strip()
    d['updated_at'] = str(d.get('updated_at') or d.get('created_at') or '').strip()
    d['price_updated_at'] = str(d.get('price_updated_at') or d.get('updated_at') or d.get('created_at') or '').strip()
    d['last_printed_at'] = str(d.get('last_printed_at') or '').strip()
    
    # Etiket Fiyatı (Son basılan raf fiyatı)
    raw_label_p = d.get('label_price')
    if raw_label_p is not None and str(raw_label_p).strip() != '':
        d['label_price'] = parse_price(raw_label_p)
    else:
        d['label_price'] = None

    # Fiyat uyuşmazlığı kontrolü (Kasa Fiyatı != Etiket Fiyatı veya Etiket Basılmamış)
    if d['label_price'] is not None:
        d['has_price_diff'] = abs(d['price'] - d['label_price']) > 0.001
        d['price_diff_amount'] = round(d['price'] - d['label_price'], 2)
    else:
        d['has_price_diff'] = True if not d['last_printed_at'] else False
        d['price_diff_amount'] = 0.0

    return d

def get_connection():
    """Thread-safe SQLite bağlantısı ve optimize PRAGMA ayarları."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.create_function("fold_tr", 1, fold_turkish_text)
    
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    return conn

@contextmanager
def db_session():
    """ACID güvenli veritabanı oturum bağlamı."""
    with _DB_LOCK:
        conn = get_connection()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

def init_db():
    """Veritabanı tablolarını ve eksik sütunları otomatik günceller."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # 1. Ana Tablo
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS urunler (
            barcode TEXT PRIMARY KEY,
            stock_code TEXT,
            title TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0,
            label_price REAL,
            price_updated_at TEXT,
            brand TEXT,
            unit TEXT DEFAULT 'ADET',
            source_device TEXT DEFAULT 'OYMAPOS Barkod Sistemi',
            is_new INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT,
            last_printed_at TEXT
        );
        """)
        
        # 2. Mevcut Sütunları Kontrol Et & Eksik Varsa Ekle (Migration)
        cursor.execute("PRAGMA table_info(urunler);")
        existing_cols = {r["name"] for r in cursor.fetchall()}
        
        migrations = [
            ("stock_code", "TEXT"),
            ("title", "TEXT"),
            ("price", "REAL DEFAULT 0"),
            ("label_price", "REAL"),
            ("price_updated_at", "TEXT"),
            ("brand", "TEXT"),
            ("unit", "TEXT DEFAULT 'ADET'"),
            ("source_device", "TEXT DEFAULT 'OYMAPOS Barkod Sistemi'"),
            ("is_new", "INTEGER DEFAULT 0"),
            ("created_at", "TEXT"),
            ("updated_at", "TEXT"),
            ("last_printed_at", "TEXT")
        ]
        for col_name, col_def in migrations:
            if col_name not in existing_cols:
                try:
                    cursor.execute(f"ALTER TABLE urunler ADD COLUMN {col_name} {col_def};")
                except Exception:
                    pass

        # 3. İndeksler
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_urunler_title ON urunler(title);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_urunler_brand ON urunler(brand);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_urunler_stock_code ON urunler(stock_code);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_urunler_is_new ON urunler(is_new);")

        # 4. Senkronizasyon Geçmişi
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vegawin_sync_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_file TEXT,
            device_name TEXT DEFAULT 'VegaWin PC',
            total_products INTEGER DEFAULT 0,
            updated_products INTEGER DEFAULT 0,
            new_products INTEGER DEFAULT 0,
            price_changes_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'success'
        );
        """)

        cursor.execute("PRAGMA table_info(vegawin_sync_history);")
        sync_cols = {r["name"] for r in cursor.fetchall()}
        if "device_name" not in sync_cols:
            try:
                cursor.execute("ALTER TABLE vegawin_sync_history ADD COLUMN device_name TEXT DEFAULT 'VegaWin PC';")
            except Exception:
                pass

        # 5. Fiyat Değişimleri
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vegawin_price_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sync_id INTEGER,
            barcode TEXT NOT NULL,
            title TEXT NOT NULL,
            old_price REAL DEFAULT 0,
            new_price REAL DEFAULT 0,
            diff_amount REAL DEFAULT 0,
            diff_percent REAL DEFAULT 0,
            changed_at TEXT NOT NULL,
            source_device TEXT DEFAULT 'VegaWin',
            is_printed INTEGER DEFAULT 0
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_price_changes_printed ON vegawin_price_changes(is_printed);")

        cursor.execute("PRAGMA table_info(vegawin_price_changes);")
        pc_cols = {r["name"] for r in cursor.fetchall()}
        if "source_device" not in pc_cols:
            try:
                cursor.execute("ALTER TABLE vegawin_price_changes ADD COLUMN source_device TEXT DEFAULT 'VegaWin';")
            except Exception:
                pass

        # 6. Yeni Eklenen Ürünler Takibi
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vegawin_new_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sync_id INTEGER,
            barcode TEXT NOT NULL,
            title TEXT NOT NULL,
            price REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            source_device TEXT DEFAULT 'VegaWin',
            is_printed INTEGER DEFAULT 0
        );
        """)
        cursor.execute("PRAGMA table_info(vegawin_new_products);")
        np_cols = {r["name"] for r in cursor.fetchall()}
        if "source_device" not in np_cols:
            try:
                cursor.execute("ALTER TABLE vegawin_new_products ADD COLUMN source_device TEXT DEFAULT 'VegaWin';")
            except Exception:
                pass
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_new_products_printed ON vegawin_new_products(is_printed);")

        # 7. Otomatik Keşif / İlk Kurulumda Veri İçe Aktarma
        cursor.execute("SELECT COUNT(*) as total FROM urunler;")
        if cursor.fetchone()["total"] == 0:
            auto_discover_and_import(conn)

def auto_discover_and_import(conn):
    """Eğer veritabanı boşsa, çevredeki OYMAPOS veya VegaWin veritabanlarını otomatik bulup aktarır."""
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(DB_PATH), "..", "..", "OYMAPOS Barkod Sistemi", "data", "market_sistemi.db")),
        r"C:\Users\User\Desktop\OYMAPOS Barkod Sistemi\data\market_sistemi.db",
        r"C:\OYMAPOS Barkod Sistemi\data\market_sistemi.db",
        r"D:\OYMAPOS Barkod Sistemi\data\market_sistemi.db",
    ]

    for p in possible_paths:
        if os.path.isfile(p) and p != DB_PATH:
            try:
                src_conn = sqlite3.connect(p)
                src_conn.row_factory = sqlite3.Row
                src_cursor = src_conn.cursor()
                src_cursor.execute("SELECT * FROM urunler;")
                rows = src_cursor.fetchall()
                if rows:
                    dest_cursor = conn.cursor()
                    for r in rows:
                        d = format_product_dict(r)
                        dest_cursor.execute("""
                        INSERT OR IGNORE INTO urunler (barcode, stock_code, title, price, brand, unit, source_device, is_new, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        """, (
                            d["barcode"],
                            d.get("stock_code", ""),
                            d["title"],
                            d["price"],
                            d.get("brand", ""),
                            d.get("unit", "ADET"),
                            d.get("source_device", "OYMAPOS Barkod Sistemi"),
                            0,
                            d.get("created_at", ""),
                            d.get("updated_at", "")
                        ))
                    print(f"📦 [Otomatik Keşif] {len(rows)} ürün '{p}' kaynağından içe aktarıldı.")
                src_conn.close()
                break
            except Exception as e:
                print(f"⚠️ [Otomatik Keşif] {p} okunamadı: {e}")

def get_all_products(limit=None, offset=0, only_new=False, only_diff=False):
    with db_session() as conn:
        cursor = conn.cursor()
        clauses = []
        if only_new:
            clauses.append("is_new = 1")
        if only_diff:
            clauses.append("((label_price IS NOT NULL AND ABS(price - label_price) > 0.001) OR (last_printed_at IS NULL OR last_printed_at = ''))")
        
        where_clause = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        if limit is not None and limit > 0:
            cursor.execute(f"SELECT * FROM urunler {where_clause} ORDER BY title ASC LIMIT ? OFFSET ?;", (limit, offset))
        else:
            cursor.execute(f"SELECT * FROM urunler {where_clause} ORDER BY title ASC;")
        return [format_product_dict(r) for r in cursor.fetchall()]

def search_products(query: str, limit=None, only_new=False, only_diff=False):
    normalized = fold_turkish_text(query.strip())
    q = f"%{normalized}%"
    with db_session() as conn:
        cursor = conn.cursor()
        clauses = [
            """(
                barcode LIKE ? 
                OR fold_tr(COALESCE(title, '')) LIKE ? 
                OR fold_tr(COALESCE(brand, '')) LIKE ? 
                OR fold_tr(COALESCE(stock_code, '')) LIKE ?
            )"""
        ]
        if only_new:
            clauses.append("is_new = 1")
        if only_diff:
            clauses.append("((label_price IS NOT NULL AND ABS(price - label_price) > 0.001) OR (last_printed_at IS NULL OR last_printed_at = ''))")
            
        where_clause = "WHERE " + " AND ".join(clauses)
        sql = f"SELECT * FROM urunler {where_clause} ORDER BY title ASC"
        if limit is not None and limit > 0:
            sql += " LIMIT ?;"
            cursor.execute(sql, (f"%{query.strip()}%", q, q, q, limit))
        else:
            sql += ";"
            cursor.execute(sql, (f"%{query.strip()}%", q, q, q))
        return [format_product_dict(r) for r in cursor.fetchall()]

def decode_scale_barcode(barcode: str) -> Optional[dict]:
    """27, 28, 29 ile başlayan EAN-13 terazi / manav / şarküteri barkodlarını çözümler."""
    if not barcode or len(barcode) != 13 or not barcode.isdigit():
        return None
    prefix = barcode[:2]
    if prefix not in ('27', '28', '29'):
        return None
    
    plu_raw = barcode[2:7]
    plu_clean = plu_raw.lstrip('0') or '0'
    val_int = int(barcode[7:12])
    
    # 27: Ağırlık/Gramaj (Örn: 01450 -> 1.450 kg)
    # 28: Tutar/Fiyat (Örn: 01450 -> 14.50 TL)
    is_weight = prefix == '27'
    weight_kg = round(val_int / 1000.0, 3) if is_weight else None
    embedded_price = round(val_int / 100.0, 2) if not is_weight else None

    return {
        "is_scale": True,
        "prefix": prefix,
        "plu_raw": plu_raw,
        "plu_clean": plu_clean,
        "is_weight": is_weight,
        "weight_kg": weight_kg,
        "embedded_price": embedded_price,
        "full_barcode": barcode
    }

def get_product_by_barcode(barcode: str):
    if not barcode:
        return None
    b = clean_barcode_text(barcode)
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM urunler WHERE barcode = ? LIMIT 1;", (b,))
        row = cursor.fetchone()
        if row:
            return format_product_dict(row)
        
        # Direkt bulunamadıysa, terazi barkodu mu kontrol et
        scale_info = decode_scale_barcode(b)
        if scale_info:
            plu_raw = scale_info["plu_raw"]
            plu_clean = scale_info["plu_clean"]
            
            # PLU'ya göre ana ürünü ara
            cursor.execute("""
                SELECT * FROM urunler 
                WHERE barcode = ? OR barcode = ? OR barcode = ? OR stock_code = ? OR stock_code = ?
                LIMIT 1;
            """, (plu_raw, plu_clean, f"27{plu_raw}", plu_raw, plu_clean))
            base_row = cursor.fetchone()
            if base_row:
                p = format_product_dict(base_row)
                p["is_scale_product"] = True
                p["scanned_barcode"] = b
                p["plu_code"] = plu_clean
                
                if scale_info["is_weight"] and scale_info["weight_kg"] is not None:
                    p["unit_price"] = p["price"]
                    p["weight_kg"] = scale_info["weight_kg"]
                    p["price"] = round(p["unit_price"] * scale_info["weight_kg"], 2)
                    p["scale_summary"] = f"{scale_info['weight_kg']} KG x {p['unit_price']:.2f} TL"
                elif scale_info["embedded_price"] is not None:
                    p["price"] = scale_info["embedded_price"]
                    p["scale_summary"] = f"Terazi Tutarı: {scale_info['embedded_price']:.2f} TL"
                return p

        return None

def get_product_price_history(barcode: str, limit: int = 50) -> list:
    """Belirtilen barkodun tüm geçmiş fiyat değişimlerini ve trendini döner."""
    if not barcode:
        return []
    b = clean_barcode_text(barcode)
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sync_id, barcode, title, old_price, new_price, diff_amount, diff_percent, changed_at, source_device, is_printed
            FROM vegawin_price_changes 
            WHERE barcode = ? 
            ORDER BY id DESC 
            LIMIT ?;
        """, (b, limit))
        return [dict(r) for r in cursor.fetchall()]

def get_products_count(only_new=False, only_diff=False):
    with db_session() as conn:
        cursor = conn.cursor()
        clauses = []
        if only_new:
            clauses.append("is_new = 1")
        if only_diff:
            clauses.append("((label_price IS NOT NULL AND ABS(price - label_price) > 0.001) OR (last_printed_at IS NULL OR last_printed_at = ''))")
        where_clause = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        cursor.execute(f"SELECT COUNT(*) as total FROM urunler {where_clause};")
        row = cursor.fetchone()
        return row["total"] if row else 0

def get_new_products_list(unprinted_only=False, limit=200):
    with db_session() as conn:
        cursor = conn.cursor()
        if unprinted_only:
            cursor.execute("SELECT * FROM vegawin_new_products WHERE is_printed = 0 ORDER BY id DESC LIMIT ?;", (limit,))
        else:
            cursor.execute("SELECT * FROM vegawin_new_products ORDER BY id DESC LIMIT ?;", (limit,))
        return [dict(r) for r in cursor.fetchall()]

def mark_new_products_as_printed(item_ids=None):
    with db_session() as conn:
        cursor = conn.cursor()
        if item_ids:
            placeholders = ",".join("?" for _ in item_ids)
            cursor.execute(f"UPDATE vegawin_new_products SET is_printed = 1 WHERE id IN ({placeholders});", item_ids)
        else:
            cursor.execute("UPDATE vegawin_new_products SET is_printed = 1 WHERE is_printed = 0;")

def update_product_printed_time(barcode: str, printed_price=None) -> dict:
    now_str = datetime.datetime.now().strftime("%d.%m.%Y %H:%M")
    b = clean_barcode_text(barcode)
    with db_session() as conn:
        cursor = conn.cursor()
        if printed_price is not None:
            cursor.execute("UPDATE urunler SET last_printed_at = ?, label_price = ? WHERE barcode = ?;", (now_str, float(printed_price), b))
        else:
            cursor.execute("UPDATE urunler SET last_printed_at = ?, label_price = price WHERE barcode = ?;", (now_str, b))
        cursor.execute("SELECT * FROM urunler WHERE barcode = ?;", (b,))
        row = cursor.fetchone()
        return format_product_dict(row) if row else {"last_printed_at": now_str}

def sync_all_label_prices_to_pos_price() -> int:
    """Tüm ürünlerin etiket fiyatını (raf fiyatı) mevcut kasa satış fiyatına eşitler."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE urunler SET label_price = price;")
        return cursor.rowcount

