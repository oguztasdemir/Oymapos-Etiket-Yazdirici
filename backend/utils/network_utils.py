# -*- coding: utf-8 -*-
"""
🌐 Ağ ve QR Kod Yardımcıları
"""
import io
import socket
import base64
import qrcode

def get_local_ip():
    """Yerel ağ IP adresini döndürür."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def generate_qr_base64(url: str) -> str:
    """Belirtilen URL için base64 formatında PNG QR kod üretir."""
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    buf = io.BytesIO()
    img.save(buf)
    return f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
