# -*- coding: utf-8 -*-
"""
🎮 API Controller (taslak copy/02_KLASOR_HIYERARSISI_VE_MODULERLIK)
REST API Uç Noktaları: Ürünler, VegaWin Stok ve Fiyat Senkronizasyonu, Yazdırma ve Sistem Kapatma
"""
import sys
import os
import io
import time
import json
import csv
import threading
import tempfile

if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, List, Dict, Any

import zipfile
import shutil

from backend.config import DB_PATH, SETTINGS_FILE, DATA_DIR
from backend.models.schemas import (
    PrinterSettingsRequest,
    PrintSingleRequest,
    PrintBatchRequest,
    MobileScanRequest
)
from backend.services.db_service import (
    get_all_products, search_products, get_product_by_barcode, get_products_count,
    get_new_products_list, mark_new_products_as_printed, update_product_printed_time,
    sync_all_label_prices_to_pos_price, get_product_price_history, init_db
)
from backend.services.printer_service import (
    get_installed_printers, print_single_label, load_settings, save_settings, purge_printer_queue
)
from backend.services.vegawin_service import (
    parse_vegawin_file, sync_vegawin_items, get_price_changes_list, mark_changes_as_printed
)
from backend.services.template_service import (
    load_all_templates, get_default_template, save_or_update_template,
    set_default_template, create_new_template, delete_template
)
from backend.utils.network_utils import get_local_ip, generate_qr_base64
from backend.utils.response_utils import safe_log, success_response, error_response

router = APIRouter(prefix="/api")

# 1. AĞ & QR BİLGİSİ
@router.get("/network/info")
async def get_network_info(request: Request):
    ip = get_local_ip()
    port = request.url.port or 8000
    mobile_url = f"http://{ip}:{port}/mobile"
    sync_url = f"http://{ip}:{port}/sync"
    qr_b64 = generate_qr_base64(mobile_url)
    return success_response(
        data={
            "ip": ip,
            "port": port,
            "mobile_url": mobile_url,
            "sync_url": sync_url,
            "qr_image": qr_b64
        },
        message="Ağ bilgisi alındı"
    )

# 2. YAZICI İŞLEMLERİ
@router.get("/printers")
async def list_printers():
    printers = get_installed_printers()
    settings = load_settings()
    return success_response(
        data={
            "printers": printers,
            "active_printer": settings.get("printer"),
            "settings": settings
        },
        message="Yazıcılar listelendi"
    )

@router.post("/printer/settings")
async def update_printer_settings(req: PrinterSettingsRequest):
    updated = save_settings(req.dict(exclude_unset=True))
    return success_response(data={"settings": updated}, message="Yazıcı ayarları güncellendi")

@router.post("/printer/test")
async def test_print():
    import time
    test_product = {
        "title": "TEST ETIKET BASKISI",
        "title1": "TEST ETIKET BASKISI",
        "price": 99.90,
        "barcode": "8690000000000",
        "brand": "OYMAPOS",
        "origin": "TURKIYE",
        "date": time.strftime("%d.%m.%Y")
    }
    success, msg = print_single_label(test_product)
    if success:
        return success_response(message=msg)
    return error_response(message=msg, status_code=500)

@router.post("/printer/purge")
async def purge_queue():
    success, msg = purge_printer_queue()
    if success:
        return success_response(message=msg)
    return error_response(message=msg, status_code=500)

# 3. ÜRÜN İŞLEMLERİ
@router.get("/products")
async def get_products(q: str = "", only_new: bool = False, only_diff: bool = False, limit: int = 0):
    effective_limit = limit if limit > 0 else None
    if q.strip():
        items = search_products(q.strip(), limit=effective_limit, only_new=only_new, only_diff=only_diff)
    else:
        items = get_all_products(limit=effective_limit, only_new=only_new, only_diff=only_diff)
    return success_response(
        data={
            "products": items,
            "total": get_products_count(only_new=only_new, only_diff=only_diff)
        },
        message="Ürünler listelendi"
    )

@router.get("/products/{barcode}")
async def get_product(barcode: str):
    prod = get_product_by_barcode(barcode)
    if not prod:
        return error_response(message="Ürün bulunamadı.", status_code=404)
    return success_response(data={"product": prod}, message="Ürün bulundu")

@router.get("/products/{barcode}/history")
async def get_product_history(barcode: str):
    history = get_product_price_history(barcode)
    return success_response(
        data={"barcode": barcode, "history": history, "count": len(history)},
        message="Fiyat geçmişi listelendi"
    )

@router.post("/products/sync-label-prices")
async def sync_label_prices():
    count = sync_all_label_prices_to_pos_price()
    return success_response(
        data={"updated_count": count},
        message=f"{count} ürünün etiket fiyatı güncel satış fiyatına eşitlendi."
    )

# 4. BASKI İŞLEMLERİ
@router.post("/print/single")
async def print_single(req: PrintSingleRequest):
    prod = None
    if req.barcode:
        prod = get_product_by_barcode(req.barcode)
    if not prod and req.title and req.price is not None:
        prod = {
            "title": req.title,
            "price": req.price,
            "barcode": req.barcode or "",
            "brand": req.brand or "",
            "date": time.strftime("%d.%m.%Y")
        }
    if not prod:
        return error_response(message="Geçersiz ürün bilgisi.", status_code=400)

    success, msg = print_single_label(prod, copies=req.copies or 1)
    if success:
        prod_data = {}
        if prod.get("barcode"):
            prod_data = update_product_printed_time(prod["barcode"], printed_price=prod.get("price"))
        return success_response(data={"product": prod_data, "last_printed_at": prod_data.get("last_printed_at")}, message=msg)
    return error_response(message=msg, status_code=500)

@router.post("/print/batch")
async def print_batch(req: PrintBatchRequest):
    if not req.products:
        return error_response(message="Yazdırılacak ürün seçilmedi.", status_code=400)
    
    printed_count = 0
    errors = []
    for item in req.products:
        prod = {
            "title": item.title,
            "price": item.price,
            "barcode": item.barcode or "",
            "brand": item.brand or "",
            "date": time.strftime("%d.%m.%Y")
        }
        success, msg = print_single_label(prod, copies=req.copies or 1)
        if success:
            printed_count += 1
            if item.barcode:
                update_product_printed_time(item.barcode)
        else:
            errors.append(f"{item.title}: {msg}")
            
    return success_response(
        data={"printed_count": printed_count, "errors": errors},
        message=f"{printed_count} adet etiket yazdırıldı."
    )

@router.post("/print/mobile_scan")
async def mobile_scan_print(req: MobileScanRequest):
    barcode = req.barcode.strip()
    prod = get_product_by_barcode(barcode)
    if not prod:
        return error_response(message=f"Barkod veritabanında bulunamadı: {barcode}", status_code=404)

    print_res = {"printed": False, "message": "Fiyat görüntülendi (Yazdırılmadı)"}
    if req.auto_print:
        success, msg = print_single_label(prod, copies=req.copies or 1)
        if success:
            update_product_printed_time(barcode)
        settings = load_settings()
        print_res = {
            "printed": success,
            "printer": settings.get("printer"),
            "message": msg
        }

    return success_response(
        data={
            "product": prod,
            "print_status": print_res
        },
        message="Barkod okundu"
    )

# 5. VEGAWIN SENKRONİZASYONU (FİYAT DEĞİŞİMİ & YENİ ÜRÜN TAKİBİ)
@router.post("/vegawin/upload")
async def upload_vegawin_file(file: UploadFile = File(...), device_name: Optional[str] = Form(None)):
    ext = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp_path = tmp.name
        content = await file.read()
        tmp.write(content)

    try:
        items = parse_vegawin_file(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    if not items:
        return error_response(message="Dosyadan geçerli ürün verisi okunamadı.", status_code=400)

    source_label = file.filename
    dev_name = device_name.strip() if device_name and device_name.strip() else "VegaWin PC"
    result = sync_vegawin_items(items, source_name=source_label, device_name=dev_name)
    return success_response(data=result, message="VegaWin stok ve fiyat senkronizasyonu tamamlandı")

@router.get("/vegawin/changes")
async def get_vegawin_changes(unprinted: bool = False):
    changes = get_price_changes_list(unprinted_only=unprinted)
    return success_response(
        data={"changes": changes, "count": len(changes)},
        message="Fiyat değişimleri listelendi"
    )

@router.get("/vegawin/new-products")
async def get_vegawin_new_products(unprinted: bool = False):
    new_items = get_new_products_list(unprinted_only=unprinted)
    return success_response(
        data={"new_products": new_items, "count": len(new_items)},
        message="Yeni eklenen ürünler listelendi"
    )

@router.post("/vegawin/print_changes")
async def print_vegawin_changes():
    changes = get_price_changes_list(unprinted_only=True)
    if not changes:
        return error_response(message="Basılacak yeni fiyat değişimi bulunamadı.", status_code=400)

    printed = 0
    for c in changes:
        prod = {
            "title": c["title"],
            "price": c["new_price"],
            "barcode": c["barcode"],
            "date": c["changed_at"].split(" ")[0] if " " in c["changed_at"] else c["changed_at"]
        }
        success, _ = print_single_label(prod)
        if success:
            printed += 1

    mark_changes_as_printed([c['id'] for c in changes])
    return success_response(
        data={"printed_count": printed},
        message=f"{printed} adet fiyat etiketi yazdırıldı."
    )

@router.post("/vegawin/print_new_products")
async def print_vegawin_new_products():
    new_prods = get_new_products_list(unprinted_only=True)
    if not new_prods:
        return error_response(message="Basılacak yeni ürün etiketi bulunamadı.", status_code=400)

    printed = 0
    for np in new_prods:
        prod = {
            "title": np["title"],
            "price": np["price"],
            "barcode": np["barcode"],
            "date": np["created_at"].split(" ")[0] if " " in np["created_at"] else np["created_at"]
        }
        success, _ = print_single_label(prod)
        if success:
            printed += 1

    mark_new_products_as_printed([np['id'] for np in new_prods])
    return success_response(
        data={"printed_count": printed},
        message=f"{printed} adet yeni ürün etiketi yazdırıldı."
    )

# 6. DIŞA AKTARMA (EXCEL / CSV / JSON)
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

@router.get("/export/changes/csv")
async def export_changes_csv():
    changes = get_price_changes_list(unprinted_only=False, limit=5000)
    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["Barkod", "Ürün Adı", "Eski Fiyat", "Yeni Fiyat", "Fark (TL)", "Fark (%)", "Değişim Tarihi", "Basıldı"])
    for c in changes:
        writer.writerow([
            c.get("barcode", ""),
            c.get("title", ""),
            str(c.get("old_price", 0)).replace('.', ','),
            str(c.get("new_price", 0)).replace('.', ','),
            str(c.get("diff_amount", 0)).replace('.', ','),
            c.get("diff_percent", 0),
            c.get("changed_at", ""),
            "Evet" if c.get("is_printed") else "Hayır"
        ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=fiyat_degisimleri.csv"}
    )

# 7. ETİKET ŞABLONLARI VE VARSAYILAN ŞABLON YÖNETİMİ
@router.get("/templates")
async def get_templates():
    templates = load_all_templates()
    default_tpl = get_default_template()
    return success_response(
        data={
            "templates": templates,
            "active_template_id": default_tpl.get("id")
        },
        message="Şablonlar listelendi"
    )

@router.post("/templates")
async def save_template(req: Request):
    body = await req.json()
    saved = save_or_update_template(body)
    return success_response(data={"template": saved}, message="Etiket şablonu kaydedildi")

@router.post("/templates/new")
async def new_template(req: Request):
    body = await req.json()
    name = body.get("name", "Yeni Özel Şablon")
    base_id = body.get("base_id")
    created = create_new_template(name=name, base_id=base_id)
    return success_response(data={"template": created}, message="Yeni şablon oluşturuldu")

@router.post("/templates/{template_id}/set-default")
async def make_default_template(template_id: str):
    try:
        updated = set_default_template(template_id)
        return success_response(data={"template": updated}, message="Varsayılan etiket şablonu güncellendi")
    except ValueError as e:
        return error_response(str(e))

@router.delete("/templates/{template_id}")
async def remove_template(template_id: str):
    try:
        delete_template(template_id)
        return success_response(message="Şablon silindi")
    except ValueError as e:
        return error_response(str(e))

# 8. SİSTEM YEDEKLEME VE GERİ YÜKLEME
@router.get("/system/backup")
async def backup_system():
    """Tüm veritabanı ve ayarları ZIP arşivi olarak indirir."""
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        if os.path.exists(DB_PATH):
            zf.write(DB_PATH, arcname="market_sistemi.db")
        if os.path.exists(SETTINGS_FILE):
            zf.write(SETTINGS_FILE, arcname="ayarlar.json")
        tpl_file = os.path.join(DATA_DIR, "etiket_sablonlari.json")
        if os.path.exists(tpl_file):
            zf.write(tpl_file, arcname="etiket_sablonlari.json")

    mem_zip.seek(0)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"oymapos_yedek_{timestamp}.zip"
    return StreamingResponse(
        mem_zip,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/system/restore")
async def restore_system(file: UploadFile = File(...)):
    """ZIP veya .db dosyasından veritabanını ve ayarları geri yükler."""
    ext = os.path.splitext(file.filename)[1].lower()
    content = await file.read()

    if ext == ".db":
        # Direkt SQLite dosyası
        with open(DB_PATH, "wb") as f:
            f.write(content)
        init_db()
        return success_response(message="SQLite veritabanı başarıyla geri yüklendi.")

    elif ext == ".zip":
        with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            with zipfile.ZipFile(tmp_path, 'r') as zf:
                for member in zf.namelist():
                    basename = os.path.basename(member)
                    if basename == "market_sistemi.db":
                        with open(DB_PATH, "wb") as f:
                            f.write(zf.read(member))
                    elif basename == "ayarlar.json":
                        with open(SETTINGS_FILE, "wb") as f:
                            f.write(zf.read(member))
                    elif basename == "etiket_sablonlari.json":
                        tpl_file = os.path.join(DATA_DIR, "etiket_sablonlari.json")
                        with open(tpl_file, "wb") as f:
                            f.write(zf.read(member))
            init_db()
            return success_response(message="Yedek arşivi (Veritabanı ve Şablonlar) başarıyla geri yüklendi.")
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
    else:
        return error_response(message="Desteklenmeyen yedek dosya türü. (.zip veya .db gereklidir)", status_code=400)

# 9. SİSTEM SAĞLIK VE MANUEL ZARİF KAPATMA
@router.get("/system/health")
async def system_health():
    return success_response(
        data={
            "status": "healthy",
            "total_products": get_products_count(),
            "ip": get_local_ip(),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        },
        message="Sistem çalışıyor"
    )

@router.post("/system/shutdown")
async def shutdown_server():
    safe_log("\n[🛑 Kapatılıyor]")
    safe_log("Kapatma komutu alındı. Alt süreçler ve port serbest bırakılıyor...")
    
    def _kill():
        time.sleep(0.5)
        safe_log("[✅ Güvenle Kapatıldı]")
        safe_log("Port serbest bırakıldı.\n")
        os._exit(0)

    threading.Thread(target=_kill, daemon=True).start()
    return success_response(message="Sunucu ve port temizlenerek kapatılıyor...")
