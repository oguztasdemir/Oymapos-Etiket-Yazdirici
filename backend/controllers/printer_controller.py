# -*- coding: utf-8 -*-
"""
🖨️ Printer Controller
Yazıcı listeleme, ayar kaydetme, test baskısı ve yazdırma kuyruğu
"""
import time
from fastapi import APIRouter
from backend.models.schemas import PrinterSettingsRequest
from backend.services.printer_service import (
    get_installed_printers, load_settings, save_settings, print_single_label, purge_printer_queue
)
from backend.utils.response_utils import success_response, error_response

router = APIRouter(prefix="/api", tags=["Printer"])

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
