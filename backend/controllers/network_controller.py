# -*- coding: utf-8 -*-
"""
📶 Network Controller
Ağ bilgisi, bağlı cihazlar ve QR kod uç noktaları
"""
import time
from typing import Dict, Any
from fastapi import APIRouter, Request

from backend.utils.network_utils import get_local_ip, generate_qr_base64
from backend.utils.response_utils import success_response

router = APIRouter(prefix="/api/network", tags=["Network"])

CONNECTED_DEVICES: Dict[str, Dict[str, Any]] = {}
DEVICE_INCOMING_DATA: Dict[str, Dict[str, Any]] = {}

@router.get("/info")
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

@router.post("/register-device")
async def register_device(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    
    dev_id = body.get("device_id") or request.client.host
    dev_name = body.get("device_name") or f"Terminal ({request.client.host})"
    dev_type = body.get("device_type") or "sync_client"
    
    CONNECTED_DEVICES[dev_id] = {
        "id": dev_id,
        "name": dev_name,
        "ip": request.client.host,
        "type": dev_type,
        "last_seen": time.time(),
        "last_seen_str": time.strftime("%H:%M:%S"),
        "has_data": dev_id in DEVICE_INCOMING_DATA
    }
    return success_response(data={"device_id": dev_id}, message="Cihaz kaydedildi")

@router.get("/devices")
async def get_connected_devices():
    now = time.time()
    active_devices = []
    for d_id, d in list(CONNECTED_DEVICES.items()):
        d_copy = dict(d)
        d_copy["is_online"] = (now - d["last_seen"] < 120)
        d_copy["has_data"] = d_id in DEVICE_INCOMING_DATA
        if d_id in DEVICE_INCOMING_DATA:
            dev_data = DEVICE_INCOMING_DATA[d_id]
            d_copy["data_summary"] = {
                "total_products": len(dev_data.get("items", [])),
                "price_changes": len(dev_data.get("price_changes", [])),
                "new_products": len(dev_data.get("new_products", []))
            }
        active_devices.append(d_copy)
    return success_response(data={"devices": active_devices, "count": len(active_devices)}, message="Bağlı cihazlar listelendi")

@router.get("/devices/{device_id}/data")
async def get_device_data(device_id: str):
    if device_id not in DEVICE_INCOMING_DATA:
        return success_response(
            data={"has_data": False, "device_id": device_id, "items": []},
            message="Bu cihaza ait henüz gönderilmiş veri bulunmuyor."
        )
    
    data = DEVICE_INCOMING_DATA[device_id]
    return success_response(
        data={
            "has_data": True,
            "device_id": device_id,
            "device_name": data.get("device_name", device_id),
            "timestamp": data.get("timestamp", ""),
            "total_items": len(data.get("items", [])),
            "items": data.get("items", []),
            "price_changes": data.get("price_changes", []),
            "new_products": data.get("new_products", [])
        },
        message="Cihaz verileri başarıyla getirildi"
    )
