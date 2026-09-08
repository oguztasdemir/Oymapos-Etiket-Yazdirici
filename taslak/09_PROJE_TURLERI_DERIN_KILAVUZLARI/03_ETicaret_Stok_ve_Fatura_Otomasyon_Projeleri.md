# 🛍️ Proje Türü Kılavuzu: E-Ticaret, Stok ve Fatura Otomasyonu
> **KULLANIM:** Dolap, Gardrops, Trendyol, Ödeal gibi platformlar için bot ve fatura motoru geliştirirken bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # Botu ve kontrol panelini başlatan dosya
├── requirements.txt            # selenium, undetected-chromedriver, beautifulsoup4, openpyxl
├── core/
│   ├── bot_engine.py           # Otomasyon ana döngüsü
│   ├── scraper.py              # Stealth tarayıcı yöneticisi
│   ├── invoice_maker.py        # Ödeal/Portal otomatik fatura kesme ve PDF indirme
│   └── stock_sync.py           # Platformlar arası stok eşitleyici
├── config/credentials.json     # Giriş bilgileri ve API anahtarları (Gitignore edilir)
├── data/
│   ├── invoices/               # İndirilen PDF faturalar
│   └── daily_sales.sqlite      # Satış ve ciro veritabanı
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **Tümünü Durdur Kuralı:** "Tümünü durdur" dendiğinde tarayıcı kapatılmaz; sadece aktif işlem durdurulup bekleme moduna geçilir.
2. **Dinamik Bekleme:** Hardcoded sleep yerine `WebDriverWait` kullanılır.
3. **Ciro ve Raporlama:** Günlük ve haftalık satışlar ferah tabloda özetlenir; tek tıkla Excel/JSON dışa aktarılır.
