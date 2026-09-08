# 🌐 01. Full-Stack Web Uygulaması Dizin Yapısı (Tek Port Standardı)

Bu şablon, FastAPI veya Flask ile geliştirilen ve tarayıcıda çalışan web araçları için geçerlidir.

---

## 📁 Standart Dizin Ağacı

```
[proje_adi]/
├── main.py                     # TEK TIKLA BAŞLATICI (Portu yönetir, sunucuyu ve tarayıcıyı açar)
├── requirements.txt            # Python bağımlılıkları (fastapi, uvicorn, pydantic, jinja2)
├── README.md                   # Proje tanımı, kurulum ve kullanım adımları
│
├── backend/                    # Backend sunucu katmanı (FastAPI)
│   ├── app.py                  # API router tanımları, CORS ve statik frontend sunumu (StaticFiles)
│   ├── config.py               # Port, ortam değişkenleri (.env) ve genel sabitler
│   ├── controllers/            # İstekleri karşılayan API uç noktaları (chat, data, upload vb.)
│   ├── services/               # İş mantığı, veri işleme, AI servisleri
│   ├── models/                 # Pydantic veri modelleri ve şemalar
│   └── utils/                  # Loglama, dosya yardımcıları, zaman damgası araçları
│
├── frontend/                   # Modern Web UI katmanı (Zero-Build Vanilla CSS/JS)
│   ├── index.html              # Ana HTML giriş noktası (<meta charset="UTF-8">, lang="tr")
│   ├── css/
│   │   ├── style.css           # Karanlık tema (#0b0f19, #111827), tipografi, scrollbar stilleri
│   │   └── components.css      # Panel, buton, kart, tablo ve rozet stilleri
│   └── js/
│       ├── app.js              # Arayüz durum yöneticisi ve başlatıcı
│       ├── api.js              # Backend REST ve SSE (Server-Sent Events) çağrıları
│       └── ui.js               # DOM güncellemeleri, toast bildirimleri ve modal pencereler
│
├── data/                       # Veri saklama alanı
│   ├── uploads/                # Yüklenen dosyalar (PDF, TXT, Resim vb.)
│   └── database.sqlite         # SQLite veritabanı (WAL modu aktif)
│
├── docs/                       # Proje dokümantasyonu
│   ├── klasor.md               # Klasördeki HER DOSYANIN işlevini açıklayan sözlük
│   └── taslak.md               # Projenin onaylanan mimari taslağı
│
└── backup/                     # Dışa aktarma ve JSON yedekleme alanı
```
