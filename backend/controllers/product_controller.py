# -*- coding: utf-8 -*-
"""
📦 Product Controller
Ürün arama, CRUD, fiyat geçmişi (audit trail), etiket fiyat eşitleme, Excel/CSV dışa aktarma
"""
import io
import csv
from typing import Optional
from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse, JSONResponse

from backend.models.schemas import ProductUpdateRequest
from backend.services.db_service import (
    get_all_products, search_products, get_product_by_barcode, get_products_count,
    sync_all_label_prices_to_pos_price, get_full_product_history, revert_product_history,
    update_product_details, update_products_by_clipboard_data, update_product_printed_time
)
from backend.services.vegawin_service import parse_raw_text_products
from backend.utils.response_utils import success_response, error_response

from backend.services.db.connection import db_session
from backend.utils.text_utils import get_blacklist_data, save_blacklist_data, clean_barcode_text

router = APIRouter(prefix="/api", tags=["Products"])

@router.get("/products")
async def get_products(q: str = "", only_new: bool = False, only_diff: bool = False, limit: int = 0):
    effective_limit = limit if limit > 0 else None
    if q.strip():
        items = search_products(q.strip(), limit=effective_limit, only_new=only_new, only_diff=only_diff)
    else:
        items = get_all_products(limit=effective_limit, only_new=only_new, only_diff=only_diff)
    
    bl_data = get_blacklist_data()
    blacklist_barcodes = set(str(b).strip() for b in bl_data.get("barcodes", []) if str(b).strip())
    
    # Her ürüne kara listede olup olmadığını ekle
    for item in items:
        b_code = str(item.get("barcode", "")).strip()
        item["is_blacklisted"] = (b_code in blacklist_barcodes)

    # İlgili tüm sayaçları hesapla
    counts = {
        "total": get_products_count(),
        "diff": get_products_count(only_diff=True),
        "new": get_products_count(only_new=True),
        "blacklist": len(blacklist_barcodes)
    }

    return success_response(
        data={
            "products": items,
            "total": get_products_count(only_new=only_new, only_diff=only_diff),
            "counts": counts,
            "blacklist_barcodes": list(blacklist_barcodes)
        },
        message="Ürünler listelendi"
    )

@router.post("/products/{barcode}/toggle-blacklist")
async def toggle_product_blacklist(barcode: str):
    """Ürünü kara listeye ekler veya kara listeden çıkarır."""
    b = clean_barcode_text(barcode)
    if not b:
        return error_response(message="Geçersiz barkod.", status_code=400)
        
    bl_data = get_blacklist_data()
    barcodes = [str(x).strip() for x in bl_data.get("barcodes", []) if str(x).strip()]
    
    is_now_blacklisted = False
    if b in barcodes:
        barcodes = [x for x in barcodes if x != b]
        bl_data["barcodes"] = barcodes
        save_blacklist_data(bl_data)
        is_now_blacklisted = False
        msg = f"'{b}' barkodlu ürün kara listeden kaldırıldı."
    else:
        barcodes.append(b)
        bl_data["barcodes"] = barcodes
        save_blacklist_data(bl_data)
        is_now_blacklisted = True
        msg = f"'{b}' barkodlu ürün kara listeye eklendi."

    counts = {
        "total": get_products_count(),
        "diff": get_products_count(only_diff=True),
        "new": get_products_count(only_new=True),
        "blacklist": len(barcodes)
    }

    return success_response(
        data={
            "barcode": b,
            "is_blacklisted": is_now_blacklisted,
            "counts": counts
        },
        message=msg
    )

@router.get("/products/{barcode}")
async def get_product(barcode: str):
    prod = get_product_by_barcode(barcode)
    if not prod:
        return error_response(message="Ürün bulunamadı.", status_code=404)
    return success_response(data={"product": prod}, message="Ürün bulundu")

@router.put("/products/{barcode}")
async def update_product(barcode: str, req: ProductUpdateRequest):
    res = update_product_details(
        barcode=barcode,
        title=req.title,
        price=req.price,
        brand=req.brand,
        unit=req.unit,
        device_name=req.device_name or "Ana PC"
    )
    if not res.get("success"):
        return error_response(message=res.get("message", "Ürün güncellenemedi."), status_code=400)
    return success_response(data=res, message=res["message"])

@router.get("/products/{barcode}/history")
async def get_product_history(barcode: str):
    history = get_full_product_history(barcode)
    prod = get_product_by_barcode(barcode)
    return success_response(
        data={
            "barcode": barcode,
            "product": prod,
            "history": history,
            "count": len(history)
        },
        message="Ürün hareket ve değişiklik geçmişi listelendi"
    )

@router.post("/products/history/{history_id}/revert")
async def revert_history(history_id: int):
    res = revert_product_history(history_id)
    if not res.get("success"):
        return error_response(message=res.get("message", "Geri alma başarısız oldu."), status_code=400)
    return success_response(data=res, message=res["message"])

@router.post("/products/sync-label-prices")
async def sync_label_prices():
    count = sync_all_label_prices_to_pos_price()
    return success_response(
        data={"updated_count": count},
        message=f"{count} ürünün etiket fiyatı güncel satış fiyatına eşitlendi."
    )

@router.post("/products/{barcode}/confirm-printed")
async def confirm_product_printed(barcode: str):
    """Fiziki etiket basıldığında etiket fiyatını kasa fiyatına eşitler ve basım tarihini günceller."""
    res = update_product_printed_time(barcode)
    return success_response(
        data=res,
        message="Ürün etiket fiyatı güncellendi ve basıldı olarak onaylandı."
    )

@router.post("/products/quick-update-clipboard")
async def quick_update_clipboard_endpoint(
    raw_text: str = Form(...),
    device_name: Optional[str] = Form("Ana PC - Fiyat Güncelleme Masası")
):
    dev_name = device_name.strip() if device_name and device_name.strip() else "Ana PC - Fiyat Güncelleme Masası"

    if not raw_text or not raw_text.strip():
        return error_response(message="Lütfen güncellenecek ürün tablosunu yapıştırın (Ctrl + V).", status_code=400)

    items = parse_raw_text_products(raw_text)
    if not items:
        return error_response(message="Yapıştırılan veriden barkod ve fiyat bilgisi ayrıştırılamadı.", status_code=400)

    res = update_products_by_clipboard_data(items, device_name=dev_name)
    if res.get("success"):
        return success_response(data=res, message=res.get("message", "Fiyatlar başarıyla güncellendi."))
    return error_response(message=res.get("message", "Güncelleme başarısız oldu."), status_code=400)

@router.get("/export/products/csv")
async def export_products_csv(only_new: bool = False):
    products = get_all_products(limit=100000, only_new=only_new)
    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["Barkod", "Stok Kodu", "Ürün Adı", "Fiyat (TL)", "Yeni Ürün", "Birim", "Güncellenme Tarihi"])
    for p in products:
        writer.writerow([
            p.get("barcode", ""),
            p.get("stock_code", ""),
            p.get("title", ""),
            str(p.get("price", 0)).replace('.', ','),
            "Evet" if p.get("is_new") else "Hayır",
            p.get("unit", "ADET"),
            p.get("updated_at", "")
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=urunler_listesi.csv"}
    )

@router.get("/export/products/json")
async def export_products_json(only_new: bool = False):
    products = get_all_products(limit=100000, only_new=only_new)
    return JSONResponse(
        content=products,
        headers={"Content-Disposition": "attachment; filename=urunler_listesi.json"}
    )
