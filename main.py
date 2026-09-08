# -*- coding: utf-8 -*-
"""
⚡ 01. Tek Başlatıcı main.py (taslak copy/03_TERMINAL_PORT_VE_SUREC_YONETIMI Standartları)
FastAPI Sunucusu, Otomatik Port Yönetimi, No-Spam Terminal, Live-Reload ve Web Zarif Kapanış
"""
import sys
import os
import time
import socket
import signal
import threading
import webbrowser
import uvicorn

# 1. Windows UTF-8 Konsol ve Karakter Koruması
if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Proje dizinini PYTHONPATH'e ekle
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.utils.network_utils import get_local_ip

def safe_print(msg: str):
    """UTF-8 güvenli konsol çıktısı."""
    try:
        print(msg)
    except Exception:
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

# 2. Otomatik Port Çakışma Çözücü
def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> int:
    """Belirtilen port doluysa bir sonraki boş portu bulur."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('0.0.0.0', port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"{start_port} ile {start_port + max_attempts} arasında boş port bulunamadı.")

# 3. Otomatik Tarayıcı Açıcı
def open_browser_delayed(url: str, delay: float = 1.0):
    def _open():
        time.sleep(delay)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=_open, daemon=True).start()

if __name__ == "__main__":
    port = find_available_port(8000)
    local_ip = get_local_ip()

    print("\n" + "=" * 60)
    print(" 🏷️  ETİKET VE FİŞ YAZDIRICI (FastAPI & Live-Reload)")
    print("=" * 60)
    print(f" 🖥️  Masaüstü Paneli  : http://localhost:{port}")
    print(f" 📱  Mobil Terminal   : http://{local_ip}:{port}/mobile")
    print(f" 🛒  VegaWin Aktarımı  : http://{local_ip}:{port}/sync")
    print("=" * 60)
    print(" [Sunucu kesintisiz modda çalışıyor. Web panelindeki 'Sunucuyu Kapat' ile kapatabilirsiniz]\n")

    # CTRL+C ile yanlışlıkla sunucunun kapatılmasını engelle (Arka planda kesintisiz çalışır)
    try:
        signal.signal(signal.SIGINT, signal.SIG_IGN)
    except Exception:
        pass

    open_browser_delayed(f"http://127.0.0.1:{port}")

    try:
        # No-Spam Terminal ve Kod Değişiminde Otomatik Canlı Yenileme (Live Reload)
        uvicorn.run(
            "backend.app:app",
            host="0.0.0.0",
            port=port,
            reload=True,
            reload_dirs=[os.path.join(BASE_DIR, "backend"), os.path.join(BASE_DIR, "frontend")],
            log_level="warning",
            access_log=False
        )
    except (KeyboardInterrupt, SystemExit):
        pass
    except Exception as e:
        safe_print(f"\n[⚠️ Bilgi] {e}")


