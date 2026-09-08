# 💻 Proje Türü Kılavuzu: CLI, Terminal ve Konsol Araçları

Bu kılavuz, arayüzsüz (headless), hızlı ve terminal tabanlı çalışan otomasyon ve veri işleme araçları için geçerlidir.

---

## 🎯 1. Mimari Standartlar
* **Kütüphaneler:** `typer` veya `argparse` + `rich` (Renkli çıktılar, konsol tabloları, spinner/progress barlar).
* **UTF-8 Konsol Koruması:** `sys.stdout.reconfigure(encoding='utf-8')` ile Türkçe karakterlerin bozulması önlenir.

---

## 🛡️ 2. Temel İlkeler ve Kurallar
1. **İki Çalışma Modu:**
   * **Argüman Modu:** `python main.py --input dosya.pdf --output cikti/`
   * **İnteraktif Mod:** Argüman verilmediğinde kullanıcıya adım adım soru soran renkli konsol menüsü (`rich.prompt.Prompt.ask`).
2. **Temiz İlerleme Çubuğu:** Büyük dosya veya çoklu işlem durumlarında `rich.progress.Progress` ile tek satır dinamik ilerleme gösterilir; ekran satır satır doldurulmaz.
3. **Standart Çıkış Kodları:** Başarılı tamamlanmada `sys.exit(0)`, hata durumunda `sys.exit(1)`.

---

## 📁 Standart Klasör Şablonu
```
[proje_adi]/
├── main.py                     # CLI komut yöneticisi
├── requirements.txt            # rich, typer vb.
├── cli/
│   ├── console_ui.py           # Renkli tablo ve panel fonksiyonları
│   └── interactive.py          # Adım adım kullanıcı menüsü
├── core/                       # İş mantığı ve dönüştürücüler
└── docs/                       # klasor.md
```
