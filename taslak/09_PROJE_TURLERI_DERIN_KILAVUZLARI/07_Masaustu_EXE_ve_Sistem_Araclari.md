# 🖥️ Proje Türü Kılavuzu: Masaüstü GUI, `.EXE` ve Sistem Araçları

Bu kılavuz, bağımsız bir masaüstü penceresi veya tek tıkla çalışabilir bir Windows `.exe` programı geliştirilirken uygulanacak özel mimari kuralları belirler.

---

## 🎯 1. Mimari Seçenekler
1. **Web Teknolojileri ile Masaüstü (`pywebview`):** Modern HTML/CSS/JS ile şık arayüz + Python arka uç + bağımsız yerel masaüstü penceresi.
2. **Yerel Python GUI (`PySide6` / `CustomTkinter`):** Yerel sistem menüleri, donanım seviyesinde pencereler ve gelişmiş masaüstü bileşenleri.

---

## 🛡️ 2. Temel İlkeler ve Kurallar
1. **Statik Dosya Erişimi:** Tüm görsel, ikon ve şablon yolları `get_asset_path()` (`sys._MEIPASS`) üzerinden yüklenmelidir.
2. **Arka Plan Threading:** Dosya dönüştürme, OCR, tarama veya AI istekleri ana GUI thread'ini kilitlememesi için her zaman arka plan iş parçacığında (`threading.Thread` veya `QThread`) çalıştırılmalıdır.
3. **Pencere Kapanışı:** Kullanıcı pencereyi kapattığında arka planda açık subprocess veya zombie process kalmamalıdır.
4. **Tek Tıkla Derleme:** Projede her zaman `build_exe.py` hazır bulunmalıdır.

---

## 📁 Standart Klasör Şablonu
```
[proje_adi]/
├── main.py                     # GUI başlatıcı
├── build_exe.py                # PyInstaller derleme scripti
├── requirements.txt            # pywebview, pyinstaller vb.
├── core/                       # İş mantığı ve worker thread'ler
├── gui/ (veya frontend/)       # Arayüz ve stiller
├── assets/                     # icon.ico, logolar
└── docs/                       # klasor.md, taslak.md
```
