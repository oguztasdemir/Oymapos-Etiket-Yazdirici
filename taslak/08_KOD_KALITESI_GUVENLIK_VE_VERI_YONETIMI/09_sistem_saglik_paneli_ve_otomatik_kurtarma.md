# 🛡️ 09. Sistem Sağlık Teşhisi & Otomatik Kurtarma Protokolü (Safe Boot)

> **TEMEL KURAL:** Profesyonel bir sistem çökmeleri beklemez; kendi sağlığını sürekli denetler (`Health Check`) ve veritabanı veya konfigürasyon hatası durumunda kullanıcıyı panikletmeden **otonom kurtarma modu (Safe Boot)** başlatır.

---

## 🩺 1. Standart Sistem Sağlık Uç Noktası (`GET /api/health`)

Backend (`main.py` / FastAPI) her zaman aşağıdaki hafif teşhis uç noktasını barındırır:

```python
import os
import shutil
import sqlite3
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/health")
def health_check():
    health_data = {
        "status": "healthy",
        "database": "connected",
        "disk_free_gb": round(shutil.disk_usage(".").free / (1024**3), 2),
        "timestamp": os.path.getmtime(__file__)
    }
    
    # SQLite Bütünlük Kontrolü
    try:
        conn = sqlite3.connect("data/app.db", timeout=2)
        cursor = conn.cursor()
        cursor.execute("PRAGMA quick_check;")
        res = cursor.fetchone()[0]
        conn.close()
        if res != "ok":
            health_data["database"] = "corrupted"
            health_data["status"] = "degraded"
    except Exception as e:
        health_data["database"] = f"error: {str(e)}"
        health_data["status"] = "unhealthy"
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=health_data)
        
    return health_data
```

---

## 🩹 2. Otomatik Kurtarma & Yedekten Geri Yükleme (Safe Boot)

Veritabanı başlatılırken dosya kilitli veya bozuksa sistem çökmez; otomatik snapshot'tan kendini onarır:

```python
import shutil
import sqlite3
from pathlib import Path

def init_resilient_db(db_path="data/app.db", backup_dir="data/backups"):
    db_file = Path(db_path)
    b_dir = Path(backup_dir)
    b_dir.mkdir(parents=True, exist_ok=True)
    
    # Sağlam ise periyodik hafif yedek al
    if db_file.exists():
        try:
            conn = sqlite3.connect(str(db_file), timeout=2)
            cursor = conn.cursor()
            cursor.execute("PRAGMA integrity_check;")
            check = cursor.fetchone()[0]
            conn.close()
            
            if check == "ok":
                shutil.copy2(db_file, b_dir / "latest_healthy.bak")
                return True
        except Exception:
            # Bozulma tespit edildi -> Kurtarma başlat
            print("\n[⚠️ UYARI] Veritabanı bozulması tespit edildi. Otomatik kurtarma devrede...")
            bak_file = b_dir / "latest_healthy.bak"
            if bak_file.exists():
                shutil.copy2(bak_file, db_file)
                print("[✅ KURTARILDI] En son sağlıklı yedek başarıyla geri yüklendi.\n")
                return True
    return False
```

---

## 🚦 3. Arayüzde Görsel Sağlık İndikatörü

Arayüzün alt çubuğunda (Footer veya Header) 15 saniyede bir sessizce `/api/health` sorgulayan ve sunucu durumunu gösteren mini nabız indikatörü:

```javascript
async function checkSystemHealth() {
    try {
        const res = await fetch('/api/health');
        const indicator = document.getElementById('system-status-indicator');
        if (!indicator) return;
        
        if (res.ok) {
            indicator.className = 'pulse-indicator online';
            indicator.title = 'Sistem Çevrimiçi & Veritabanı Sağlıklı';
        } else {
            indicator.className = 'pulse-indicator degraded';
            indicator.title = 'Sistem Performans Uyarısı';
        }
    } catch (e) {
        const indicator = document.getElementById('system-status-indicator');
        if (indicator) {
            indicator.className = 'pulse-indicator offline';
            indicator.title = 'Sunucu Bağlantısı Kesildi';
        }
    }
}
setInterval(checkSystemHealth, 15000);
```
