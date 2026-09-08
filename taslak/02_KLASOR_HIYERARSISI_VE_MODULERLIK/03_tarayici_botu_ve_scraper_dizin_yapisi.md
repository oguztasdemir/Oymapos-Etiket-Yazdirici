# 🤖 03. Tarayıcı Botu ve Scraper Dizin Yapısı

Bu şablon, `Playwright Stealth` veya `Selenium undetected-chromedriver` ile geliştirilen veri kazıma ve otomasyon botları içindir.

---

## 📁 Standart Dizin Ağacı

```
[proje_adi]/
├── main.py                     # Botu başlatan, zamanlayıcıyı kuran ana dosya
├── requirements.txt            # playwright, beautifulsoup4, pandas, pydantic vb.
├── README.md                   # Bot çalıştırma ve parametre kılavuzu
│
├── core/                       # Kazıma, ayrıştırma ve dışa aktarma motoru
│   ├── scraper.py              # Tarayıcıyı yöneten stealth kazıma sınıfı
│   ├── parser.py               # HTML/JSON ayrıştırma, regex ve veri temizleme
│   ├── wait_helper.py          # Dinamik bekleme (WebDriverWait / expect) yardımcıları
│   └── exporter.py             # Verileri Excel, JSON, CSV formatına dönüştürücü
│
├── config/
│   └── bot_config.json         # Kullanıcı girişleri, hedef URL'ler, filtreler
│
├── logs/                       # Çalışma anı logları ve hata anı ekran görüntüleri (screenshot.png)
├── data/                       # İndirilen faturalar, PDF'ler, görseller ve çıktılar
└── docs/                       # klasor.md ve taslak.md
```
