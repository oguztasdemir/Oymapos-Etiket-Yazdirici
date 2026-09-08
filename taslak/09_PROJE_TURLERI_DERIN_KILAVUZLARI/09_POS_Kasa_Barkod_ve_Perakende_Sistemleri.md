# 🏷️ 09. POS, Kasa Satış, Barkod ve Perakende Sistemleri Kılavuzu

Bu kılavuz; market kasası, barkodlu hızlı satış, stok takibi, termal fiş yazıcı ve POS yazılımları geliştirilirken uygulanacak özel mimari standartları belirler.

---

## 🎯 1. Temel POS Mimarisi ve İlkeler

### A. Donanım ve Barkod Okuyucu Desteği:
* **Klavye Kaması (Keyboard Wedge):** Barkod okuyucular genellikle klavye gibi davranır ve barkod sonuna `Enter` basar. Arayüzde odak (focus) nerede olursa olsun, hızlı barkod okunduğunda sepet listesine anında ürün eklenmelidir.
* **USB / Seri Port Okuyucular:** `pyserial` ile donanım seviyesinde dinleme altyapısı.

### B. Klavye Kısayolları ve Dokunmatik Arayüz:
* `F2`: Hızlı Nakit Satış / Ödeme Ekranı
* `F3`: Kredi Kartı ile Satış
* `F4`: İskonto / İndirim Uygula
* `Delete`: Seçili Ürünü Sepetten Kaldır
* `ESC`: Satışı İptal Et / Temizle

### C. Termal Fiş ve Yazıcı Entegrasyonu (ESC/POS & PDF):
* `python-escpos` ile 80mm veya 58mm termal yazıcılara doğrudan ham fiş basımı.
* Alternatif olarak otomatik PDF fiş/fatura dökümü (`ReportLab` veya HTML şablonundan dönüştürme).

### D. Çevrimdışı (Offline-First) Veritabanı ve Gün Sonu Raporu:
* İnternet kesilse bile kasanın durmaması için yerel **SQLite WAL** modu.
* **Z-Raporu (Gün Sonu):** Günlük toplam ciro, nakit/kart dağılımı, satılan ürün adetleri ve KDV dökümü tek tıkla raporlanır.

---

## 📁 Standart POS Klasör Şablonu

```
[pos_proje_adi]/
├── main.py                     # POS uygulamasını başlatan dosya (Web veya pywebview .EXE)
├── build_exe.py                # Masaüstü bağımsız POS .EXE üretici
├── core/
│   ├── pos_engine.py           # Sepet hesaplama, KDV, indirim, para üstü motoru
│   ├── barcode_listener.py     # Barkod yakalayıcı ve ürün eşleştirici
│   ├── printer_service.py      # Termal yazıcı (ESC/POS) ve fiş oluşturucu
│   └── report_service.py       # Z-Raporu ve satış analiz motoru
├── data/
│   ├── database.sqlite         # Ürünler, barkodlar, stoklar ve satış geçmişi
│   └── receipts/               # Kaydedilen PDF fiş kopyaları
├── frontend/                   # Yüksek kontrastlı, hızlı butonlu Kasa Arayüzü
│   ├── index.html              # Dokunmatik ekran uyumlu Numpad + Sepet + Ürün Grid
│   ├── css/pos_style.css       # Okunaklı büyük fontlar, canlı toplam fiyat kutusu
│   └── js/pos_app.js           # Anlık sepet güncelleme ve kısayol dinleyiciler
└── docs/
    └── klasor.md
```
