# 🖥️ 02. Masaüstü GUI ve Bağımsız `.EXE` Dizin Yapısı

Bu şablon, `pywebview`, `PySide6` veya `CustomTkinter` ile geliştirilen ve tek tıkla `.exe` haline getirilebilen masaüstü uygulamaları içindir.

---

## 📁 Standart Dizin Ağacı

```
[proje_adi]/
├── main.py                     # Masaüstü GUI penceresini açan tek başlatıcı
├── build_exe.py                # Tek tıkla PyInstaller derleme otomasyon scripti
├── requirements.txt            # pywebview, pyinstaller, pydantic vb.
├── README.md                   # Masaüstü uygulaması kullanım kılavuzu
│
├── core/                       # İş mantığı ve arka plan iş parçacıkları
│   ├── engine.py               # Ana işlem motoru
│   ├── asset_manager.py        # get_asset_path() (PyInstaller _MEIPASS yol koruması)
│   └── worker.py               # GUI donmasını engelleyen Thread / Worker sınıfları
│
├── gui/                        # Masaüstü arayüz katmanı
│   ├── app_window.py           # Pencere oluşturucu ve panel yerleşimi
│   ├── components/             # Masaüstü widgetları, butonlar, tablolar
│   └── styles.py               # Koyu tema renk sabitleri ve fontlar
│
├── assets/                     # İkonlar (.ico), logolar, statik şablonlar
├── config/                     # settings.json (Pencere boyutu, kullanıcı tercihleri)
├── data/                       # Yerel veritabanı (SQLite) veya kullanıcı verileri
├── docs/                       # klasor.md ve taslak.md
└── dist/                       # Derlenmiş hazır .exe çıktı klasörü (.gitignore'da)
```
