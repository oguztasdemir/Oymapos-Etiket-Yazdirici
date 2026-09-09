# 🏷️ OYMAPOS - Kurumsal Etiket & Fiş Otomasyon Merkezi

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite3-WAL_Mode-003B57?logo=sqlite&logoColor=white)
![TSPL](https://img.shields.io/badge/Printer-TSPL--II_RAW-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**VegaWin & FasterPOS Entegreli, Kablosuz Mobil Terminal Destekli ve Yerel Ağ Senkronizasyonlu Profesyonel Raf Etiketi Çözümü**

[Özellikler](#-özellikler--yetenekler) • [Kurulum](#-kurulum-ve-başlatma) • [Ağ ve Modüller](#-ağ-ve-cihaz-erişimi) • [Proje Yapısı](#-proje-yapısı) • [Sorun Giderme](#-sorun-giderme)

</div>

---

## 📌 Proje Genel Bakışı

**OYMAPOS**, süpermarketler, şarküteriler, manavlar ve perakende işletmeleri için tasarlanmış yüksek performanslı bir **Etiket ve Fiş Baskı Kontrol Merkezi**dir.

Sistem, dükkan / kasa bilgisayarında çalışan **VegaWin & FasterPOS** veritabanlarındaki fiyat ve ürün değişikliklerini yerel ağ üzerinden otomatik algılar; masaüstü paneli, reyon el terminali (mobil telefon kamerası) veya barkod okuyucu aracılığıyla tek tıkla termal / lazer yazıcılardan kusursuz etiket basılmasını sağlar.

---

## ✨ Özellikler & Yetenekler

### 🔄 VegaWin / FasterPOS Akıllı Senkronizasyon & Karşılaştırma Masası
- **Otomatik Dizin & Dosya Keşfi:** Bilgisayardaki VegaWin klasör yolunu (`C:\vegawin`, `C:\vegawin\Bin` vb.) otomatik tarar.
- **İkili Veri & Hareket Ayrıştırma:** Güncel satış hareketlerini (`*SonSatisHareket.txt`), SQLite (`market_sistemi.db`), Excel (`.xlsx`) veya CSV dosyalarını otomatik tespit eder ve panodan yapıştırma (`Ctrl+V`) desteği sunar.
- **2 Aşamalı Güvenli Aktarım:** Önce ekranda tüm fiyat değişimleri, zam/indirim farkları ve yeni eklenen ürünler listelenir; kullanıcı inceleyip onay verdikten sonra ana sisteme aktarılır.
- **Toplu Geri Alma (Rollback / Undo):** İstenmeyen veya hatalı yapılan bir aktarımı tek tıkla eski fiyatlarına geri döndürme imkanı.

### 🖨️ TSPL Termal Baskı & A4 Çoklu Dizgi Motoru
- **Doğrudan Windows RAW Spooler:** Sürücü gecikmesi olmadan TSPL-II komutlarıyla milisaniyeler içinde termal etiket basımı.
- **Çoklu Etiket Boyutları:** 40x20 mm (Mini), 60x40 mm (Kompakt), 76x40 mm (Standart Market), 85x45 mm (Büyük Boy).
- **A4 Kağıt Dizgisi:** Lazer / mürekkep püskürtmeli yazıcılar için A4 yapışkanlı kağıtlara (24'lü, 40'lı, 65'li etiket şablonu) grid baskı desteği.

### 📱 Mobil Barkod Terminali (Reyon Asistanı)
- Herhangi bir ek uygulama indirmeden, aynı Wi-Fi ağına bağlı akıllı telefonun kamerasıyla barkod okutma.
- Reyonda gezerken raf fiyatı ile kasa fiyatını anında kontrol etme ve tek tuşla kasadaki yazıcıya etiket gönderme.

### ⚖️ Terazi / Manav Barkod Çözücü
- `27`, `28` ve `29` prefixli terazi barkodlarını (`27[PLU][Gramaj/Tutar][C]`) otomatik çözer.
- Gramajlı ürünlerin birim fiyatını ve paket tutarını anında hesaplayarak etikete basar.

### 🛡️ Sistem Kararlılığı ve Çökme Önleyici Mimari
- **SQLite WAL (Write-Ahead Logging):** Eşzamanlı okuma/yazma kilitlenmelerini önler, yüksek işlem hızına sahiptir.
- **Türkçe Karakter Katlaması (`fold_tr`):** `I/ı`, `İ/i`, `Ş/ş`, `Ğ/ğ`, `Ü/ü`, `Ö/ö`, `Ç/ç` harflerinde %100 arama doğruluğu.
- **Global Hata Yakalama (Crash Proof):** Beklenmeyen API veya donanım hatalarında sunucu çökmez, güvenli hata döndürür.
- **Zaman Damgalı Tek Tıkla Yedekleme:** Veritabanı ve yazıcı ayarlarını tek tıkla `.zip` olarak indirme ve yedekten geri yükleme.

---

## 🚀 Kurulum ve Başlatma

### Gereksinimler
- Python 3.10 veya üzeri
- Windows 10 / 11 / Server (Windows Spooler RAW yazdırma için)

### Adım Adım Başlatma
```bash
# 1. Proje dizinine gidin
cd "Etiket Yazdırıcı"

# 2. Gerekli kütüphaneleri yükleyin
pip install -r requirements.txt

# 3. Uygulamayı başlatın
python main.py
```

- Sunucu başladığında varsayılan tarayıcınızda kontrol paneli (`http://localhost:8000`) otomatik olarak açılacaktır.
- Eğer 8000 portu başka bir program tarafından kullanılıyorsa sistem otomatik olarak bir sonraki boş portu (8001, 8002...) seçer.

---

## 🌐 Ağ ve Cihaz Erişimi

| Modül | Adres | Açıklama |
|---|---|---|
| 🖥️ **Ana Yönetim & Etiket Masası** | `http://localhost:8000/` | Stok arama, tekli/toplu etiket basımı, görsel şablon stüdyosu. |
| 💻 **Dükkan Veri Aktarım Portalı** | `http://[ANA_PC_IP]:8000/sync` | Dükkan bilgisayarından VegaWin klasörünü tarayıp verileri gönderme masası. |
| 📱 **Reyon Mobil Terminali** | `http://[ANA_PC_IP]:8000/mobile` | Telefon kamerası ile kablosuz reyon etiket denetimi. |

---

## 📂 Proje Yapısı

```
Etiket Yazdırıcı/
├── main.py                         # Ana Başlatıcı, Dinamik Port Çözücü & Live-Reload
├── requirements.txt                # Python Bağımlılıkları
├── README.md                       # Kurumsal Kullanım Kılavuzu
├── LICENSE                         # MIT Lisans Dosyası
├── backend/
│   ├── app.py                      # FastAPI Sunucusu & Anti-Cache Middleware
│   ├── config.py                   # Uygulama Dizin ve Konfigürasyon Sabitleri
│   ├── controllers/                # Modüler REST API Denetleyicileri
│   │   ├── api_controller.py       # Ana Router Birleştirici
│   │   ├── network_controller.py   # Yerel Ağ & Cihaz Kayıt API
│   │   ├── print_controller.py     # Termal & Test Baskı API
│   │   ├── printer_controller.py   # Yazıcı Donanım & Ayar API
│   │   ├── product_controller.py   # Ürün Listeleme & Arama API
│   │   ├── system_controller.py    # Yedekleme & Geri Yükleme API
│   │   ├── template_controller.py  # Etiket Tasarım Şablonları API
│   │   └── vegawin_controller.py   # VegaWin Senkronizasyon & Karşılaştırma API
│   ├── models/
│   │   └── schemas.py              # Pydantic Veri Modelleri
│   ├── services/
│   │   ├── db/                     # Veritabanı Katmanı (Connection, Repo, Schema, Sync)
│   │   ├── db_service.py           # Veritabanı Modüler Facade
│   │   ├── printer_service.py      # TSPL-II & Windows RAW Spooler Servisi
│   │   ├── template_service.py     # Etiket Şablon Motoru
│   │   ├── vegawin/                # VegaWin Ayrıştırıcı & Karşılaştırma Motoru
│   │   └── vegawin_service.py      # VegaWin Modüler Facade
│   └── utils/
│       ├── network_utils.py        # Yerel IP & Dinamik QR Kod Üretici
│       ├── response_utils.py       # Standart JSON Yanıt & Güvenli Log
│       └── text_utils.py           # Türkçe Karakter, Fiyat & Barkod Temizleyici
├── frontend/
│   ├── css/                        # Kurumsal Tasarım Sistem Stilleri
│   ├── js/
│   │   ├── api.js                  # Backend REST API İstemcisi
│   │   ├── ui.js                   # UI Motoru & Modal/Toast Yardımcıları
│   │   ├── main.js                 # Frontend Başlatıcı & Sekme Yönetimi
│   │   ├── mobile.js               # Mobil Terminal & Kamera Okuyucu Mantığı
│   │   └── modules/                # Parçalanmış JS Modülleri (products, print, studio vb.)
│   ├── partials/                   # HTML Modülleri (Sekmeler ve Modallar)
│   ├── index.html                  # Ana Masaüstü Kontrol Masası
│   ├── sync.html                   # VegaWin Veri Aktarım & Karşılaştırma Portalı
│   └── mobile.html                 # Mobil Reyon Barkod Terminali
└── data/
    ├── ayarlar.json                # Yazıcı ve Kalibrasyon Ayarları
    ├── etiket_sablonlari.json      # Etiket Tasarım Şablonları
    ├── kara_liste.json             # Otomatik Temizleme & Kara Liste Kuralları
    └── uploads/                    # Geçici Dosya Yükleme Alanı (.gitkeep ile korunur)
```

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
|---|---|
| `Ctrl + K` veya `/` | Ürün arama kutusuna anında odaklan |
| `Ctrl + S` | Yazıcı ve kalibrasyon ayarlarını kaydet |
| `F2` | Hızlı test etiketi yazdır |
| `Enter` | Önizleme modalı açıkken doğrudan yazdır |
| `Escape` | Modalı kapat veya arama kutusunu temizle |

---

## 💡 Sorun Giderme & İpuçları

1. **Yazıcı Çıktı Vermiyorsa:**
   - Denetim Masası > Aygıtlar ve Yazıcılar bölümünden termal yazıcınızın adının `ayarlar.json` veya arayüzdeki "Yazıcı Ayarları" sekmesindeki isimle birebir aynı olduğunu kontrol edin.
2. **Dükkan Bilgisayarından Bağlanılamıyorsa:**
   - Ana bilgisayarın Windows Güvenlik Duvarında Python için yerel ağ gelen bağlantılarına izin verildiğinden emin olun.
3. **Fiyat Değişimlerini Göremiyorsanız:**
   - VegaWin klasör yolunun (`C:\vegawin` veya `C:\vegawin\Bin`) doğru olduğunu kontrol edin ve `/sync` sayfasından **"Ürünleri Getir & Listele"** butonuna basın.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır.
