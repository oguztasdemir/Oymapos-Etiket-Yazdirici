# 💻 04. Rich CLI ve Terminal Araçları Dizin Yapısı

Bu şablon, arayüzsüz, hızlı çalışan ve renkli terminal çıktıları üreten konsol araçları içindir.

---

## 📁 Standart Dizin Ağacı

```
[proje_adi]/
├── main.py                     # CLI komut yöneticisi ve argüman ayrıştırıcı
├── requirements.txt            # rich, typer, pydantic vb.
├── README.md                   # Komut satırı kullanım örnekleri
│
├── cli/                        # Terminal arayüz katmanı
│   ├── commands/               # Alt komutlar (scan.py, convert.py, export.py)
│   ├── console_ui.py           # Rich renkli paneller, tablolar ve spinner/progress fonksiyonları
│   └── interactive.py          # Argümansız çalıştırıldığında açılan adım adım soru menüsü
│
├── core/                       # Veri dönüştürme ve iş mantığı motoru
├── data/                       # Girdi ve çıktı klasörleri
└── docs/                       # klasor.md
```
