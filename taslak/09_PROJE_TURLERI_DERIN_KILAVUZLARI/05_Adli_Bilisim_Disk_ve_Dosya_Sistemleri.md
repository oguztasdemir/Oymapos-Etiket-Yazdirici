# 💾 Proje Türü Kılavuzu: Adli Bilişim, Disk Kurtarma ve Depolama
> **KULLANIM:** Disk analizi, silinmiş dosya kurtarma veya depolama alanı görselleştirme projelerinde bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # GUI arayüzünü açan başlatıcı
├── requirements.txt            # psutil, pywin32, customtkinter / pyside6
├── core/
│   ├── disk_scanner.py         # Sektör ve disk okuma motoru
│   ├── file_recovery.py        # Silinmiş dosya başlıklarını (headers) tarama
│   └── storage_analyzer.py     # Kategori bazlı (% dilim) boyut hesaplama
├── gui/
│   ├── app_window.py           # Masaüstü penceresi
│   ├── components/chart_view.py# Pasta/Çubuk grafik görselleştirme
│   └── styles.py               # Koyu tema
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **Kategori Bazlı Dilim Grafiği:** Disk doluluğu `Videolar (%40)`, `Oyunlar (%30)`, `Dokümanlar (%15)` gibi renkli dilimlerle gösterilir.
2. **Güvenli Kurtarma:** Kurtarılan dosyalar taranan diske değil; her zaman kullanıcının seçtiği güvenli bir hedef klasöre yazılır.
