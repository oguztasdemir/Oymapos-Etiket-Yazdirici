# -*- coding: utf-8 -*-
"""
⚡ Ana Başlatıcı main.py
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
    print(f" 🖥️  Ana Bilgisayar Paneli   : http://localhost:{port}")
    print(f" 💻  Katılan Dükkan PC Linki : http://{local_ip}:{port}/sync")
    print(f" 📱  Reyon Mobil Terminali   : http://{local_ip}:{port}/mobile")
    print("=" * 60)
    print(" [Sunucu kesintisiz modda çalışıyor. Web panelindeki 'Sunucuyu Kapat' ile kapatabilirsiniz]\n")

    # CTRL+C ile yanlışlıkla sunucunun kapatılmasını engelle (Arka planda kesintisiz çalışır)
    try:
        signal.signal(signal.SIGINT, signal.SIG_IGN)
    except Exception:
        pass

    open_browser_delayed(f"http://127.0.0.1:{port}")

    try:
        is_frozen = getattr(sys, 'frozen', False)
        if is_frozen:
            from backend.app import app
            uvicorn.run(
                app,
                host="0.0.0.0",
                port=port,
                log_level="warning",
                access_log=False
            )
        else:
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


