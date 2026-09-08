# 🛑 05. Zarif Kapanış (Graceful Shutdown)

Sunucu veya masaüstü penceresi kapatıldığında arkada asılı kalan (zombie) işlemler bırakılmamalıdır.

---

## 🛠️ Temiz Kapanış Mekanizması

```python
import signal
import sys

def shutdown_handler(signum, frame):
    print("\n[🛑 Kapatılıyor] Alt süreçler ve port temizleniyor...")
    # Veritabanı bağlantılarını kapat
    # Arka plan botlarını/thread'lerini durdur
    print("[✅ Güvenle Kapatıldı] Port serbest bırakıldı.")
    sys.exit(0)

# Sinyalleri yakala
signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)
```
