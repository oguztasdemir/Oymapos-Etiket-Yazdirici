# 🏷️ OYMAPOS - Etiket ve Fiş Yazdırıcı Kontrol Merkezi

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite3-WAL_Mode-003B57?logo=sqlite&logoColor=white)
![TSPL](https://img.shields.io/badge/Printer-TSPL--II_RAW-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**VegaWin & FasterPOS PC Entegreli & Mobil Terminal Destekli Profesyonel Raf Etiketi ve Fiş Otomasyonu**

</div>

---

## 📌 Genel Bakış

**OYMAPOS Etiket ve Fiş Yazdırıcı**, market ve perakende işletmelerinde kasa programındaki (VegaWin / FasterPOS) güncel fiyat ve stok verilerini yerel ağ üzerinden ana bilgisayara senkronize eden; masaüstü paneli, telefon kamerası veya terazi barkodlarıyla masadaki termal/lazer yazıcılardan tek tıkla standart raf etiketi basılmasını sağlayan modern bir web uygulamasıdır.

---

## ✨ Temel Özellikler

- 🖨️ **Dinamik TSPL Termal Baskı Motoru:** 40x20 mm, 60x40 mm, 76x40 mm ve 85x45 mm etiket ebatlarına göre 203 DPI (8 dots/mm) üzerinden tam kalibreli çıktı.
- 📄 **A4 Çoklu Etiket Dizgisi:** Lazer veya mürekkep püskürtmeli standart ofis yazıcıları için yapışkanlı A4 kağıtlarına (24'lü, 40'lı, 65'li) tek tıkla grid PDF/Baskı dizgisi.
- ⚡ **VegaWin & Excel/CSV Senkronizasyonu:** Excel veya CSV stok dosyalarını sürükle-bırak yöntemiyle yükleyerek değişen fiyatları, zam/indirim oranlarını ve yeni ürünleri anında tespit etme.
- 📱 **Mobil Barkod Terminali:** Ek uygulama gerektirmeden, telefon kamerasını barkod okuyucuya dönüştürerek raftaki ürünü okutup ana bilgisayardaki yazıcıya saniyede etiket gönderme.
- 🎨 **Görsel Şablon Stüdyosu (Visual Studio):** Etiket punto boyutlarını, metin alanlarını, yerli üretim rozetini ve barkod görünürlüğünü canlı önizleyerek özelleştirme.
- ⚖️ **Terazi / Manav Barkod Çözücü:** `27`, `28`, `29` prefixli gramajlı/tutarlı terazi barkodlarını (`27[PLU][Gramaj][C]`) otomatik çözüp birim fiyattan anlık tutar hesaplama.
- 📈 **Ürün Fiyat Geçmişi:** Her ürünün geçmişteki tüm zam ve indirim hareketlerini, değişim tarihlerini ve oranlarını zaman çizelgesinde inceleme.
- 💾 **Tek Tıkla Sistem Yedekleme:** SQLite veritabanı, yazıcı kalibrasyonları ve şablonları tek tıkla zaman damgalı `.zip` olarak indirme ve geri yükleme.
- 🔍 **Türkçe Karakter Zırhı:** SQLite üzerinde katlamalı arama (`fold_tr`) ile `ı/i`, `ş/s`, `ğ/g`, `ü/u`, `ö/o`, `ç/c` harflerini sorunsuz eşleştirme.

---

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Python 3.10 veya üzeri
- Windows 7 / 8 / 10 / 11 (Windows Spooler RAW yazdırma için)

### 2. Kurulum
```bash
# Proje dizinine girin
cd "Etiket Yazdırıcı"

# Bağımlılıkları yükleyin
pip install -r requirements.txt
```

### 3. Çalıştırma
```bash
python main.py
```

* Sunucu başladığında varsayılan tarayıcınızda kontrol paneli (`http://localhost:8000`) otomatik olarak açılacaktır.
* Port meşgulse çökmeden bir sonraki boş portu (8001, 8002...) otomatik bulur.

---

## 📱 Cihaz Rotaları ve Kullanım

| Modül | URL | Açıklama |
|---|---|---|
| 🖥️ **Masaüstü Kontrol Masası** | `http://localhost:8000/` | Ürün arama, A4 dizgi, tekli/toplu etiket basımı, şablon stüdyosu. |
| 📱 **Mobil Terminal** | `http://[ANA_PC_IP]:8000/mobile` | Telefon kamerasıyla kablosuz barkod okuma ve anında baskı. |
| 🛒 **VegaWin Veri Aktarımı** | `http://[ANA_PC_IP]:8000/sync` | Diğer bilgisayarlardan VegaWin Excel/CSV dosyasını yükleme istasyonu. |

---

## 🏗️ Klasör Mimarisi

```
├── main.py                     # Ana Başlatıcı, Port Çözücü & Live Reload
├── requirements.txt            # Python Paket Bağımlılıkları
├── .gitignore                  # Git Hariç Tutma Kuralları
├── README.md                   # Dokümantasyon
├── backend/                    # FastAPI Backend Katmanı
│   ├── app.py                  # FastAPI Sunucusu & F5 Anti-Cache Middleware
│   ├── config.py               # Dizin ve Yapılandırma Sabitleri
│   ├── controllers/            # REST API Uç Noktaları (api_controller.py)
│   ├── models/                 # Pydantic Şemaları (schemas.py)
│   ├── services/               # DB (SQLite WAL), Yazıcı (TSPL), VegaWin, Şablon Servisleri
│   └── utils/                  # Ağ IP, QR Kod ve UTF-8 Yardımcıları
├── frontend/                   # Obsidian Slate Koyu Tema Web UI
│   ├── css/                    # style.css & components.css
│   ├── stiller/                # Modüler Masaüstü ve Mobil CSS Kütüphanesi
│   ├── js/                     # api.js, ui.js, app.js, mobile.js
│   ├── index.html              # Masaüstü Kontrol Paneli & Şablon Stüdyosu
│   ├── mobile.html             # Mobil Barkod Terminali
│   └── sync.html               # Ağ Üzerinden VegaWin Dosya Yükleme Ekranı
├── data/                       # Veritabanı & Ayarlar
│   ├── market_sistemi.db       # SQLite WAL Modunda 4.900+ Ürün Veritabanı
│   ├── ayarlar.json            # Yazıcı ve Kalibrasyon Ayarları
│   └── etiket_sablonlari.json  # Özel ve Varsayılan Etiket Şablonları
└── backup/                     # Dışa aktarma ve JSON/CSV yedekleri
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

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır.
