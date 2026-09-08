# ⚡ 01. Tek Başlatıcı `main.py` Standartları

Bu kılavuz, projenin başlatılma yaşam döngüsünü ve neden `.bat` dosyalarının kesinlikle yasaklandığını açıklar.

---

## 🚫 1. Neden `.bat` Dosyası Kesinlikle Yasaktır?
1. **İzlenemez Süreçler:** `.bat` dosyaları Windows'ta yeni CMD pencereleri açar ve `CTRL+C` verildiğinde arkada zombie Python süreçleri bırakarak portu kilitler (`WinError 10048`).
2. **Platform Bağımlılığı:** `.bat` dosyaları Linux/macOS üzerinde çalışmaz.
3. **Akıllı Kontrol Eksikliği:** `.bat` dosyası port çakışmasını tespit edip dinamik port atayamaz veya tarayıcıyı hatasız açamaz.

---

## 🚀 2. `main.py` Neleri Otomatik Yönetir?
* **UTF-8 Konsol Koruması:** `sys.stdout.reconfigure(encoding='utf-8')` ile Türkçe karakter bozulmalarını önler.
* **Port Yönetimi:** `8000` portu doluysa otomatik `8001`'e geçer.
* **Sunucu Başlatma:** Uvicorn/FastAPI sunucusunu no-spam modunda (`access_log=False`) başlatır.
* **Otomatik Tarayıcı / GUI Açılışı:** Sunucu hazır olduğunda varsayılan tarayıcıyı veya GUI penceresini otomatik açar.
* **Zarif Kapanış:** Kullanıcı `CTRL+C` verdiğinde portu ve alt süreçleri temizler.
