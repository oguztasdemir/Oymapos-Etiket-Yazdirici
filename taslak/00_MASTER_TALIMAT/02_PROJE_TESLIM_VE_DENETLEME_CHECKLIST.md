# ✅ 02. Proje Teslim ve Denetleme Kontrol Listesi (25 Maddelik Self-Audit)

Yapay zeka herhangi bir projeyi kullanıcıya teslim etmeden önce aşağıdaki 25 maddeyi kontrol etmek zorundadır:

---

### 🛑 Faz 0: Başlangıç ve İletişim
- [ ] **0.1.** Aklı takılan tüm gereksinimler adım adım ve tek tek sorularak netleştirildi mi?
- [ ] **0.2.** `docs/taslak.md` üzerinden mimari plan çıkarılıp onay alındı mı?
- [ ] **0.3.** Gereksiz hiçbir teknoloji/kütüphane ezbere projeye dayatılmadı mı?

### ⚡ Faz 1: Başlatıcı ve Süreç
- [ ] **1.1.** Ana dizinde tek tıkla çalışan `main.py` mevcut mu?
- [ ] **1.2.** `.bat` dosyası kalabalığı engellendi mi?
- [ ] **1.3.** Port çakışmasında (`8000` doluysa) otomatik boş porta geçiliyor mu?
- [ ] **1.4.** Sunucu açılışında tarayıcı veya masaüstü penceresi otomatik açılıyor mu?
- [ ] **1.5.** `CTRL+C` veya pencere kapatıldığında tüm arka plan süreçleri temizleniyor mu?
- [ ] **1.6.** Terminalde `200 OK` log spamı filtrelendi mi?
- [ ] **1.7.** Windows UTF-8 konsol koruması eklendi mi?

### 🎨 Faz 2: Arayüz ve Tasarım
- [ ] **2.1.** Doğru panel düzeni (1 Panel, 2 Panel, 3 Panel, Sekmeli Grid) seçildi mi?
- [ ] **2.2.** Koyu tema (`#0b0f19`, `#111827`), modern font ve ferah boşluklar uygulandı mı?
- [ ] **2.3.** Kod ve metin bloklarında **"Kopyala"** butonu var mı?
- [ ] **2.4.** `F5` yenilemede veriler silinmeden korunuyor mu (State persistence)?
- [ ] **2.5.** Dosya tarama veya yükleme alanında istatistik rozetleri (MB, tür dağılımı) var mı?
- [ ] **2.6.** AI ve uzun görevlerde canlı akış (SSE / daktilo efekti) çalışıyor mu?

### 🧹 Faz 3: Kod Kalitesi ve Güvenlik
- [ ] **3.1.** 0 kırmızı linter hatası ve 0 eksik import sağlandı mı?
- [ ] **3.2.** Kesinlikle hiçbir dosyada `// ... rest unchanged ...` gibi eksik kod bırakılmadı mı?
- [ ] **3.3.** `docs/klasor.md` içindeki tüm dosya tanımları güncel mi?
- [ ] **3.4.** Kök dizindeki tüm geçici ve çöp dosyalar temizlendi mi?
- [ ] **3.5.** Çalışan eski kodlar korunup üzerine mi inşa edildi?
- [ ] **3.6.** Hassas veriler ve `.env` dosyası `.gitignore` ile korundu mu?
- [ ] **3.7.** SQLite WAL modu aktif mi?

### 📦 Faz 4: Masaüstü ve Dağıtım (Gerekiyorsa)
- [ ] **4.1.** Statik dosya yolları `get_asset_path()` (`sys._MEIPASS`) ile korundu mu?
- [ ] **4.2.** `build_exe.py` hazır ve tek tıkla hatasız derleniyor mu?
