# 🎯 05. Vibe Coding Altın Görev Promptları Bankası

Bu doküman, projelerinizde yapay zekaya (Antigravity, Cursor, Claude, Windsurf vb.) verirken **en yüksek verimi, sıfır kod kaybını ve taş gibi sağlam mimariyi** garanti eden hazır komut şablonlarını içerir. Kopyalayıp sohbete yapıştırmanız yeterlidir:

---

## 🚀 1. Yeni Proje Başlatma (Sıfır Varsayım & Adım Adım Soru)
```markdown
Taslak mimari kurallarımızı ve standartlarımızı oku. Bu projede [PROJENİN KISA AMACI/FİKRİ] inşa etmek istiyoruz.

Kurallarımız gereği toplu soru yığmadan; iş mantığı, girdi/çıktı, platform ve veri akışına dair aklına takılan tüm soruları bana sırasıyla, teker teker ve adım adım sor. Tüm detaylar netleştiğinde docs/taslak.md planını hazırla ve onayıma sun.
```

---

## ✨ 2. Yeni Özellik Ekleme (Mevcut Kodu Bozmadan)
```markdown
Mevcut mimariyi ve çalışan hiçbir fonksiyonu bozmadan sisteme şu özelliği ekleyelim:
[EKLENECEK ÖZELLİĞİN DETAYI]

Kurallarımız:
1. Mevcut kodları kırpma veya placeholder (// rest of code) bırakma.
2. docs/klasor.md dosyasını yeni eklenen modüllerle güncelle.
3. Arayüzde gerekliyse toast bildirimi ve F5 koruması ekle.
```

---

## 🎨 3. Anti-AI Arayüz & Estetik Cila (Studio Quality)
```markdown
Mevcut arayüzü Anti-AI Slop standartlarımıza uygun olarak modernize et:
1. Mor/cyan jenerik parıltıları kaldır; Obsidian Slate / Derin Kömür (#0b0f19, #111827) paletine geç.
2. Tablo ve kartlara ferah paddingler (12-16px) ve veri alanlarına "Tek Tıkla Kopyala" butonları ekle.
3. Dokunsal mikro etkileşimler (hover, aktif buton basma hissi) ve durum rozetleri ekle.
4. F5 yenilemesinde verilerin kaybolmadığını garanti et.
```

---

## 🛠️ 4. Hata Ayıklama & Self-Healing (Kök Neden Çözümü)
```markdown
Terminalde / Konsolda şu hatayı aldım:
[HATA LOGU VEYA EKRAN GÖRÜNTÜSÜ]

Lütfen:
1. Hatanın kök nedenini analiz et.
2. Geçici yama yapmak yerine kilitlenmeyen, kalıcı bir çözüm uygula.
3. Windows UTF-8 veya port çakışması ile ilgiliyse standart zırhlarımızı devreye sok.
```

---

## 📥 5. Veri İçe / Dışa Aktarma (Excel & JSON) Entegrasyonu
```markdown
Mevcut projemize tek tıkla çalışan veri yedekleme ve dışa aktarma sistemi ekleyelim:
1. Tablodaki verileri tek tıkla Excel (.xlsx) ve JSON olarak indirebilen butonlar ekle.
2. Kullanıcının Excel/JSON dosyasını sürükleyip bırakarak sisteme veri yükleyebileceği bir içe aktarıcı ekle.
3. İşlem bittiğinde başarılı/hatalı satır sayısını toast bildirimle göster.
```

---

## 📦 6. Tek Tıkla Masaüstü .EXE Derleme
```markdown
Projemizi bağımsız bir Windows .exe dosyası haline getirmek için build_exe.py scriptini hazırla ve çalıştır:
1. Statik dosyaları (HTML/CSS/JS) sys._MEIPASS korumalı get_asset_path() fonksiyonuyla bağla.
2. PyInstaller ile --noconsole ve --onefile parametreleriyle derlemeyi yap.
3. Derleme bittiğinde dist/ klasörünü doğrula.
```

---

## 🔍 7. Proje Teslim ve Denetleme (Pre-Flight Audit)
```markdown
Projeyi teslim etmeden önce 25 maddelik Vibe Coding denetim listesini (taslak/00_MASTER_TALIMAT/02_PROJE_TESLIM_VE_DENETLEME_CHECKLIST.md) baştan sona kontrol et:
- 0 kırmızı linter hatası var mı?
- .bat kalabalığı temizlendi mi?
- Terminal log spamı engellendi mi?
- Tek tıkla main.py çalışıyor mu?
Tüm maddeleri kontrol edip sonuç raporunu sun.
```
