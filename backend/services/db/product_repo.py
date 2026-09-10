# -*- coding: utf-8 -*-
"""
📦 Product Repository
Ürün sorgulama, arama, sayım, terazi barkodu çözme ve baskı zamanı güncelleme
"""
import re
import datetime
from typing import List, Dict, Optional, Any
from backend.services.db.connection import db_session
from backend.utils.text_utils import (
    fold_turkish_text, clean_barcode_text, decode_scale_barcode, format_product_dict
)

def get_all_products(limit=None, offset=0, only_new=False, only_diff=False):
    with db_session() as conn:
        cursor = conn.cursor()
        clauses = []
        if only_new:
            clauses.append("is_new = 1")
        if only_diff:
            clauses.append("(label_price IS NOT NULL AND ABS(parse_price(price) - parse_price(label_price)) > 0.001)")
        
        where_clause = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        if limit is not None and limit > 0:
            cursor.execute(f"SELECT * FROM urunler {where_clause} ORDER BY title ASC LIMIT ? OFFSET ?;", (limit, offset))
        else:
            cursor.execute(f"SELECT * FROM urunler {where_clause} ORDER BY title ASC;")
        return [format_product_dict(r) for r in cursor.fetchall()]

def search_products(query: str, limit=None, only_new=False, only_diff=False):
    cleaned_query = query.strip()
    if not cleaned_query:
        return get_all_products(limit=limit, only_new=only_new, only_diff=only_diff)
        
    tokens = [t for t in re.split(r'[\s\-_.,/]+', cleaned_query) if t]
    
    with db_session() as conn:
        cursor = conn.cursor()
        clauses = []
        params = []
        
        if only_new:
            clauses.append("is_new = 1")
        if only_diff:
            clauses.append("(label_price IS NOT NULL AND ABS(parse_price(price) - parse_price(label_price)) > 0.001)")
            
        # Her bir arama kelimesi için şart ekle (AND mantığı)
        for token in tokens:
            norm_tok = fold_turkish_text(token)
            q_tok = f"%{norm_tok}%"
            clauses.append("""(
                barcode LIKE ? 
                OR fold_tr(COALESCE(title, '')) LIKE ? 
                OR fold_tr(COALESCE(brand, '')) LIKE ? 
                OR fold_tr(COALESCE(stock_code, '')) LIKE ?
            )""")
            params.extend([f"%{token}%", q_tok, q_tok, q_tok])
            
        where_clause = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        sql = f"SELECT * FROM urunler {where_clause} ORDER BY title ASC"
        if limit is not None and limit > 0:
            sql += " LIMIT ?;"
            params.append(limit)
        else:
            sql += ";"
            
        cursor.execute(sql, tuple(params))
        return [format_product_dict(r) for r in cursor.fetchall()]

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
    """Belirtilen barkodun tüm geçmiş fiyat değişimlerini döner."""
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
            clauses.append("(label_price IS NOT NULL AND ABS(parse_price(price) - parse_price(label_price)) > 0.001)")
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
    """Tüm ürünlerin etiket fiyatını mevcut kasa satış fiyatına eşitler."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE urunler SET label_price = price;")
        return cursor.rowcount
