# 📁 ETİKET VE FİŞ YAZDIRICI - DOSYA SÖZLÜĞÜ (docs/klasor.md)

Taslak standartlarına (`00_MASTER_TALIMAT`, `01_full_stack_web_dizin_yapisi.md`) tam uyumlu, modüler ve temiz dizin yapısı:

```
Etiket Yazdırıcı/
├── main.py                     # TEK TIKLA BAŞLATICI (Port çakışma çözücü, no-spam uvicorn, CTRL+C/Web zarif kapanış, otomatik tarayıcı)
├── requirements.txt            # Python bağımlılıkları (fastapi, uvicorn, pydantic, openpyxl, qrcode, Pillow)
├── README.md                   # Kapsamlı Proje Dokümantasyonu ve Başlangıç Kılavuzu
│
├── backend/                    # Backend sunucu katmanı (FastAPI)
│   ├── __init__.py
│   ├── app.py                  # FastAPI uygulaması, CORS, F5 Anti-Caching, Lifespan ve Statik Sunum
│   ├── config.py               # Dizin yolları, veritabanı yolu ve varsayılan etiket ayarları
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── api_controller.py   # REST API uç noktaları (Arama, Baskı, VegaWin Senkronizasyon, Dışa Aktar, Kapatma)
│   ├── models/                 # Pydantic veri modelleri ve şemalar
│   │   ├── __init__.py
│   │   └── schemas.py          # PrinterSettings, PrintSingle, PrintBatch, MobileScan modelleri
│   ├── services/               # İş mantığı servisleri
│   │   ├── __init__.py
│   │   ├── db_service.py       # Hızlı, WAL modunda SQLite veritabanı servisi (Türkçe arama ve kirli veri temizliği)
│   │   ├── printer_service.py  # Termal yazıcı bağlantısı (Windows Spooler) ve TSPL komut motoru
│   │   └── vegawin_service.py  # VegaWin Excel/CSV dosya okuma ve anlık fiyat değişim takip servisi
│   └── utils/                  # Yardımcı araçlar
│       ├── __init__.py
│       ├── network_utils.py    # Yerel ağ IP tespiti ve dinamik QR kod PNG üretimi
│       └── response_utils.py   # Standart JSON API yanıt sarmalayıcıları ve UTF-8 konsol loglama
│
├── frontend/                   # Modern Web UI katmanı (Obsidian Slate / Zero AI Slop)
│   ├── index.html              # Masaüstü Ana Kontrol Masası (Giriş noktası)
│   ├── mobile.html             # Mobil Barkod Tarayıcı ve Anında Baskı Terminali (/mobile)
│   ├── sync.html               # VegaWin Veri Aktarım İstasyonu (/sync)
│   ├── css/
│   │   ├── style.css           # Obsidian Slate ana teması, değişkenler, tipografi ve scrollbar
│   │   └── components.css      # Panel, kart, buton, rozet, tablo ve modal bileşen stilleri
│   ├── js/
│   │   ├── api.js              # Backend REST API çağrı servisi (Fetch wrapper)
│   │   ├── ui.js               # Toast bildirimler, Web Audio sesler, modal ve sayaç efektleri
│   │   ├── app.js              # Masaüstü yönetim paneli Javascript motoru (Kısayollar, Arama, Tablo)
│   │   └── mobile.js           # Mobil kamera barkod okuyucu ve otomatik baskı motoru
│   └── sayfalar/               # Geriye dönük uyumluluk HTML şablonları
│       ├── index.html
│       ├── mobile.html
│       └── sync.html
│
├── data/                       # Veri saklama alanı
│   ├── market_sistemi.db       # ACID & WAL uyumlu SQLite veritabanı (Ürünler & Fiyatlar)
│   └── uploads/                # Geçici dosya yükleme alanı
│
├── docs/                       # Proje dokümantasyonu
│   ├── taslak.md               # Mimari hedefler ve tasarım manifestosu
│   └── klasor.md               # Canlı dosya sözlüğü
│
├── backup/                     # Dışa aktarma ve JSON/CSV yedekleme alanı
│   └── README.md
│
└── taslak/                     # Mimari standartlar ve rehber kütüphanesi
```
