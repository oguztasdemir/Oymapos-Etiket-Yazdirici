# 🏷️ OYMAPOS - Kurumsal Etiket & Fiş Otomasyon Merkezi

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite3-WAL_Mode-003B57?logo=sqlite&logoColor=white)
![Printer](https://img.shields.io/badge/Printer-ZPL_%26_TSPL--II_RAW-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Windows-7%20%7C%208%20%7C%2010%20%7C%2011%20(32%2F64--bit)-lightgrey?logo=windows)

**VegaWin & FasterPOS Entegreli, Kablosuz Mobil Terminal Destekli, ZPL/TSPL Çift Motorlu Profesyonel Raf Etiketi ve Fiş Otomasyonu**

[Özellikler](#-özellikler--yetenekler) • [Hızlı Başlatma](#-hızlı-başlatma-tüm-windows-sürümleri) • [Ağ ve Modüller](#-ağ-ve-cihaz-erişimi) • [Proje Mimarisi](#-proje-mimarisi) • [Kısayollar](#-klavye-kısayolları) • [Sorun Giderme](#-sorun-giderme)

</div>

---

## 📌 Proje Genel Bakışı

**OYMAPOS**, süpermarketler, şarküteriler, manavlar ve perakende satış noktaları için geliştirilmiş yüksek performanslı, dayanıklı bir **Etiket ve Fiş Baskı Kontrol Merkezi**dir.

Sistem, dükkan ve kasa bilgisayarlarında çalışan **VegaWin & FasterPOS** veritabanlarındaki fiyat ve ürün güncellemelerini yerel ağ üzerinden otomatik algılar. Masaüstü yönetim paneli, reyon el terminali (mobil telefon kamerası) veya barkod okuyucu aracılığıyla tek tıkla termal / lazer yazıcılardan kusursuz etiket basılmasını sağlar.

---

## ✨ Özellikler & Yetenekler

### 🖨️ Hibrit Termal Baskı Motoru (ZPL + TSPL-II & A4 Grid)
- **Doğrudan Windows RAW Spooler:** Yazıcı sürücüsü gecikmesi olmaksızın milisaniyeler içinde doğrudan termal donanıma ham komut iletimi.
- **Çift Protokol Desteği (ZPL & TSPL-II):** Zebra, Xprinter, Argox, HPRT, Bixolon vb. piyasadaki tüm termal yazıcılarla tak-çalıştır uyumluluk.
- **Dinamik Raf Etiketi Standartları:** Birim fiyat kutusu, gramaj/miktar rozeti, resmi Yerli Üretim logosu, reyon kodları ve promosyon alanı.
- **Çoklu Boyut Desteği:** 40x20 mm, 60x40 mm, 76x40 mm (Standart Market), 85x45 mm ve özel şablonlar.
- **A4 Çoklu Çıkartma Dizgisi:** Lazer veya mürekkep püskürtmeli standart ofis yazıcıları için A4 yapışkanlı etiket kağıtlarına (24'lü, 40'lı, 65'li) baskı imkanı.
- **Canlı Baskı Geçmişi:** Yapılan tüm baskı işlemlerinin anlık loglanması ve arayüzdeki "Baskı Geçmişi" sekmesinden izlenebilmesi.

### 🔄 VegaWin / FasterPOS Akıllı Senkronizasyon & Karşılaştırma Masası
- **Otomatik Dizin & Dosya Keşfi:** Bilgisayardaki VegaWin klasör yolunu (`C:\vegawin`, `C:\vegawin\Bin` vb.) otomatik tarama.
- **Çok Formatlı Aktarım:** Güncel satış hareketleri (`*SonSatisHareket.txt`), SQLite (`market_sistemi.db`), Excel (`.xlsx`), CSV veya panodan yapıştırma (`Ctrl+V`) desteği.
- **2 Aşamalı Güvenli Aktarım Masası:** Aktarım öncesinde fiyat farkları, zam/indirim değişimleri ve yeni ürünler önizleme tablosunda onaylatılır.
- **Geri Alma (Rollback / Undo):** Hatalı aktarımlarda tek tıkla eski fiyatlara geri dönebilme güvencesi.

### 📱 Mobil Barkod Terminali (Reyon Asistanı)
- Herhangi bir uygulama yüklemeden, aynı Wi-Fi ağına bağlı akıllı telefon kamerasından barkod okutma.
- Reyonda gezerken raf fiyatı ile kasa fiyatını denetleme ve tek tıkla kasadaki yazıcıya etiket gönderme.

### ⚖️ Terazi / Manav Barkod Çözücü
- `27`, `28` ve `29` prefixli terazi barkodlarını (`27[PLU][Gramaj/Tutar][C]`) anında ayrıştırma.
- Gramajlı ürünlerin birim fiyatını ve paket tutarını otomatik hesaplama.

### 🛡️ Kararlı ve Çökme Önleyici Mimari
- **SQLite WAL (Write-Ahead Logging):** Eşzamanlı okuma/yazma kilitlenmelerini önleyen hızlı veritabanı motoru.
- **Türkçe Karakter Katlaması (`fold_tr`):** `I/ı`, `İ/i`, `Ş/ş`, `Ğ/ğ`, `Ü/ü`, `Ö/ö`, `Ç/ç` harflerinde %100 arama doğruluğu.
- **Zaman Damgalı Tek Tıkla Yedekleme:** Veritabanı ve ayarları `.zip` formatında yedekleme ve geri yükleme.

---

## 🚀 Hızlı Başlatma (Tüm Windows Sürümleri)

Windows 7, 8, 10 veya 11 (32-bit / 64-bit) fark etmeksizin sistemi çalıştırmak için:

### 1. Tek Tıkla Başlatma (Tavsiye Edilen)
Proje ana dizinindeki **`BASLAT.bat`** dosyasına çift tıklayın.

> **Ne Yapar?**
> * Bilgisayarınızda Python olup olmadığını otomatik kontrol eder.
> * Eğer Python yoksa; Windows sürümünüze ve mimarinize (32/64-bit) uygun Python motorunu resmi kaynaktan arka planda sessizce kurar.
> * Gerekli kütüphaneleri [requirements.txt](requirements.txt) üzerinden otomatik tamamlar.
> * Web sunucusunu başlatır ve tarayıcınızı otomatik olarak açar.

### 2. Geliştirici Modu (Manuel Kurulum)
```bash
# 1. Proje dizinine girin
cd "Etiket Yazdirici"

# 2. Gereksinimleri yukleyin
pip install -r requirements.txt

# 3. Sunucuyu calistirin
python main.py
```

Tarayıcınızda arayüz otomatik olarak `http://localhost:8000` adresinde açılacaktır.

---

## 🌐 Ağ ve Cihaz Erişimi

| Modül | Yerel Adres | Açıklama |
|---|---|---|
| 🖥️ **Ana Yönetim & Etiket Masası** | `http://localhost:8000/` | Stok arama, tekli/toplu etiket basımı, baskı geçmişi. |
| 💻 **Dükkan Veri Aktarım Portalı** | `http://[IP_ADRESI]:8000/sync` | Dükkan bilgisayarından VegaWin klasörünü tarayıp verileri gönderme masası. |
| 📱 **Reyon Mobil Terminali** | `http://[IP_ADRESI]:8000/mobile` | Telefon kamerası ile kablosuz reyon etiket denetimi. |

---

## 📂 Proje Mimarisi

```
Etiket Yazdırıcı/
├── BASLAT.bat                      # Tüm Windows'lar için Otomatik Kurulum ve Başlatıcı
├── main.py                         # Ana Başlatıcı & Dinamik Port Yönetimi
├── requirements.txt                # Python Bağımlılıkları
├── README.md                       # Proje Dokümantasyonu
├── LICENSE                         # MIT Lisansı
├── backend/
│   ├── app.py                      # FastAPI Sunucusu & Anti-Cache Middleware
│   ├── config.py                   # Uygulama Dizin ve Konfigürasyon Sabitleri
│   ├── controllers/                # REST API Denetleyicileri
│   │   ├── api_controller.py       # Router Birleştirici
│   │   ├── network_controller.py   # Ağ Bilgisi & IP API
│   │   ├── print_controller.py     # Tekli, Toplu ve Mobil Baskı API
│   │   ├── printer_controller.py   # Yazıcı Donanım & Ayar API
│   │   ├── product_controller.py   # Ürün Listeleme & Arama API
│   │   ├── system_controller.py    # Yedekleme & Geri Yükleme API
│   │   ├── template_controller.py  # Etiket Tasarım Şablonları API
│   │   └── vegawin_controller.py   # VegaWin Senkronizasyon & Karşılaştırma API
│   ├── models/
│   │   └── schemas.py              # Pydantic Veri Modelleri
│   ├── services/
│   │   ├── db/                     # SQLite Veritabanı ve Repository Katmanı
│   │   ├── printer_service.py      # RAW Spooler, ZPL & TSPL-II Baskı Servisi
│   │   ├── zpl_etiket_kodlayici.py # Standart ZPL Raf Etiketi Kodlayıcı Motor
│   │   ├── template_service.py     # Etiket Şablon Motoru
│   │   └── vegawin/                # VegaWin Ayrıştırıcı & Karşılaştırma Motoru
│   └── utils/
│       ├── network_utils.py        # Yerel IP & Dinamik QR Kod Üretici
│       ├── response_utils.py       # Standart JSON Yanıt Yardımcıları
│       └── text_utils.py           # Türkçe Karakter ve Metin Temizleyici
├── frontend/
│   ├── css/                        # Responsive Arayüz Tasarım Stilleri
│   ├── js/
│   │   ├── api.js                  # Backend REST API İstemcisi
│   │   ├── main.js                 # Frontend Başlatıcı & Sekme Yönetimi
│   │   ├── mobile.js               # Mobil Terminal Kamera Okuyucu
│   │   └── modules/                # JS Modülleri (products, print, sync vb.)
│   ├── partials/                   # Dinamik Sekmeler ve Modal Şablonları
│   ├── index.html                  # Ana Masaüstü Kontrol Masası
│   ├── sync.html                   # VegaWin Veri Aktarım & Karşılaştırma Portalı
│   └── mobile.html                 # Mobil Reyon Barkod Terminali
└── data/
    ├── ayarlar.json                # Yazıcı ve Kalibrasyon Ayarları
    ├── etiket_sablonlari.json      # Etiket Tasarım Şablonları
    ├── kara_liste.json             # Otomatik Temizleme Kuralları
    └── uploads/                    # Geçici Yükleme Klasörü (.gitkeep ile korunur)
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

## 💡 Sorun Giderme

1. **Yazıcı Çıktı Vermiyorsa:**
   - Denetim Masası > Aygıtlar ve Yazıcılar bölümünden termal yazıcınızın adının arayüzdeki "Yazıcı Ayarları" sekmesindeki isimle birebir aynı olduğunu kontrol edin.
2. **Kuyrukta Yazdırma İşi Takılı Kalırsa:**
   - Arayüzdeki Yazıcı Ayarları bölümünden "Kuyruğu Temizle" butonunu kullanarak kilitlenmiş yazdırma işlerini tek tıkla boşaltabilirsiniz.
3. **Dükkan Bilgisayarından Bağlanılamıyorsa:**
   - Ana bilgisayarın Windows Güvenlik Duvarı ayarlarında Python için yerel ağ bağlantılarına izin verildiğinden emin olun.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır.
