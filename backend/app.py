# -*- coding: utf-8 -*-
"""
🌐 FastAPI Ana Sunucu Uygulaması (Tek Port & F5 Live-Reload Standardı)
Modüler REST API, Statik Dosya Dağıtımı ve Dinamik Partial Enjeksiyonu
"""
import sys
import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 1. Windows UTF-8 Konsol Koruması
if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from backend.config import FRONTEND_DIR
from backend.services.db_service import init_db
from backend.controllers.api_controller import router as api_router
from backend.utils.network_utils import get_local_ip
from backend.utils.response_utils import safe_log

# 2. Yaşam Döngüsü ve Canlı Yenileme Bildirimi
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    safe_log("\n[⚡ Güncellendi]\nKodda bir değişiklik algılandı ve sunucu otomatik yenilendi.\n")
    yield

# 3. FastAPI Uygulaması
app = FastAPI(
    title="Etiket ve Fiş Yazdırıcı",
    description="VegaWin PC Senkronizasyonu & Mobil Terminal Sunucusu",
    version="2.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan
)

# 4. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. F5 Anti-Caching Middleware
class AntiCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response
        except Exception as e:
            from fastapi.responses import JSONResponse
            safe_log(f"\n[⚠️ Beklenmeyen Sunucu Hatası Yakalandı]\nURL: {request.url.path} | Hata: {str(e)}\n")
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": f"Sunucu işlemi sırasında bir hata oluştu: {str(e)}", "data": None}
            )

app.add_middleware(AntiCacheMiddleware)

# 6. API Router Kaydı
app.include_router(api_router)

def render_html_page(filename: str) -> HTMLResponse:
    """HTML sayfalarını arar (frontend/) ve dinamik değerleri ve partial bileşenleri enjekte eder."""
    path = os.path.join(FRONTEND_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Dinamik Partial Include Desteği (Örn: {{ include "partials/tabs/tab_home.html" }})
        import re
        include_pattern = r'\{\{\s*include\s+["\']([^"\']+)["\']\s*\}\}'
        
        def replace_include(match):
            inc_rel_path = match.group(1).replace('/', os.sep).replace('\\', os.sep)
            inc_full_path = os.path.join(FRONTEND_DIR, inc_rel_path)
            if os.path.exists(inc_full_path):
                try:
                    with open(inc_full_path, "r", encoding="utf-8") as inc_file:
                        return inc_file.read()
                except Exception as e:
                    return f"<!-- Include Hatası ({match.group(1)}): {e} -->"
            return f"<!-- Include Dosyası Bulunamadı: {match.group(1)} -->"

        # İç içe include'ları desteklemek için iki kez geçir
        content = re.sub(include_pattern, replace_include, content)
        content = re.sub(include_pattern, replace_include, content)

        # Dinamik F5 önbellek kırma ve yerel IP enjeksiyonu
        cache_bust = str(int(time.time() * 1000))
        local_ip = get_local_ip()
        content = content.replace("{{ cache_bust }}", cache_bust)
        content = content.replace("{{ local_ip }}", local_ip)
        return HTMLResponse(content=content)
    return HTMLResponse(f"<h1>Sayfa Bulunamadı: {filename}</h1>", status_code=404)

# 7. HTML Sayfa Rotaları
@app.get("/", response_class=HTMLResponse)
async def serve_root(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    # Eğer istek Ana Bilgisayarın kendisinden (localhost / 127.0.0.1) geliyorsa Ana Yönetim Paneli açılır
    if client_ip in ["127.0.0.1", "localhost", "::1"]:
        safe_log("\n[🖥️ Ana Bilgisayar]\nYönetim ve etiket yazdırma paneli yüklendi.\n")
        return render_html_page("index.html")
    else:
        # Eğer istek diğer katılan dükkan / kasa bilgisayarından geliyorsa doğrudan Veri Gönderme Portalı açılır
        safe_log(f"\n[💻 Katılan Bilgisayar ({client_ip})]\nVeri gönderme ve aktarım portalı açıldı.\n")
        return render_html_page("sync.html")

@app.get("/admin", response_class=HTMLResponse)
async def serve_admin():
    return render_html_page("index.html")

@app.get("/sync", response_class=HTMLResponse)
@app.get("/vegawin", response_class=HTMLResponse)
@app.get("/gonder", response_class=HTMLResponse)
async def serve_sync():
    return render_html_page("sync.html")

@app.get("/mobile", response_class=HTMLResponse)
@app.get("/mobil", response_class=HTMLResponse)
async def serve_mobile():
    return render_html_page("mobile.html")

@app.get("/favicon.ico")
async def serve_favicon():
    return HTMLResponse(status_code=204)

# 8. Statik Dosyalar (/frontend -> frontend/)
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")
