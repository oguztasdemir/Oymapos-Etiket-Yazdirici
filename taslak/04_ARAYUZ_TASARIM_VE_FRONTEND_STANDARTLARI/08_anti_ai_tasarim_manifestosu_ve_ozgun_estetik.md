# 🎨 08. Anti-AI Tasarım & Kusursuz İşçilik Manifestosu (Zero AI Fingerprint)

> **TEMEL KURAL:** Bir projeye, arayüze, koda veya metne bakıldığında "Bunu yapay zeka şablonu yapmış" hissi KESİNLİKLE OLUŞMAMALIDIR. Tasarım ve mühendislik; üst düzey ürün tasarımcılarının (Linear, Stripe, Apple, Vercel, Figma vb.) ve kıdemli baş mühendislerin elinden çıkmış gibi özgün, rafine, yaşayan ve kusursuz işçilik taşımalıdır.

---

## 🚫 1. Yapay Zekayı Ele Veren İpuçları & Yasaklar (AI Slop Listesi)

### A. Görsel & Arayüz Klişeleri:
* ❌ **Jenerik Mor-Cyan Neon Degradeleri:** Her yapay zekanın varsayılan olarak kullandığı klişe `#8b5cf6` -> `#06b6d4` mor/camgöbeği parıltılı degradeler.
* ❌ **Anlamsız Glow & Işık Saçan Kartlar:** Amacı olmayan, her kutunun altına basılan 50px bulanık neon parıltılar.
* ❌ **Ruhsuz & Ezbere 3 Kart Düzeni:** Sayfanın ortasına yan yana atılmış "Özellik 1, Özellik 2, Özellik 3" kutucukları.
* ❌ **Robot / AI Sparkle Simgeleri:** Her butona veya başlığa zorla eklenen sihirli değnek (✨), robot (🤖) veya yapay zeka kıvılcımı ikonları.
* ❌ **Pürüzsüz Ama Cansız Statiklik:** Tıklama, odaklanma veya üzerine gelme (hover) anında mekanik hissettiren, canlılık taşımayan arayüzler.

### B. Kodlama & Yorum Satırı Klişeleri (Code Fingerprint):
* ❌ **Bariz/Gereksiz Yorum Satırları:** `// Event listener for button click`, `// Main container styles`, `# function to add numbers` gibi bariz AI yorumları YASAKTIR.
* ❌ **Placeholder & Budanmış Kod:** `// rest of code unchanged`, `# TODO: implement` gibi yapay zeka tembellikleri yasaktır.
* ❌ **İç İçe Div Çöplüğü:** Gereksiz `<div><div><div>...</div></div></div>` sarmalları yerine modern CSS Grid ve Flexbox semantiği kullanılır.

### C. Metin Yazarlığı & İçerik Klişeleri (Copywriting Slop):
* ❌ **İçi Boş Pazarlama Kalıpları:** *"Geleceğin çözümleriyle işinizi bir üst seviyeye taşıyın"*, *"Devrim niteliğinde"*, *"Seamlessly integrate"*, *"Unlock the power of..."* gibi içi boş klişeler YASAKTIR.
* ❌ **Simetrik Demo Verileri:** "John Doe", "Jane Smith", "Test 1, Test 2" gibi yapay demo verileri yerine sektöre ve amaca uygun gerçekçi veriler kullanılır.

---

## 💎 2. İnsan Eli Değmiş Özgün Tasarım Prensipleri (Human Craftsmanship)

### A. Tipografik Hiyerarşi ve Karakter Seçimi
* Varsayılan browser fontları veya aşırı jenerik kombinasyonlar yerine projenin temasına özel Google Fontları seçilir:
  * **Modern & Mühendislik/SaaS:** `Plus Jakarta Sans`, `Inter`, `Geist Sans`
  * **Zarif, Editoryal & Finans:** `Playfair Display`, `Newsreader` + `Inter`
  * **Fütüristik / Oyun / Taktik:** `Space Grotesk`, `Chakra Petch`, `JetBrains Mono`
  * **Sıcak & Ürün Odaklı:** `Outfit`, `Manrope`, `Cabinet Grotesk`
* Başlıklarda `letter-spacing: -0.02em` ile sıkı ve rafine editoryal duruş, gövde metinlerinde ferah satır aralıkları (`line-height: 1.6`).

### B. Alana Özgü Rafine Renk Paletleri (Domain-Specific Palettes)
Tek bir jenerik şablon yerine, projenin kimliğine göre özel paletler kullanılır:
1. **Obsidian Studio (SaaS & Profesyonel Araçlar):**
   * Kömür siyahı zemin (`#090a0f`), arduvaz paneller (`#12151e`), zarif çivit vurgusu (`#6366f1`), buz grisi metin (`#f1f5f9`).
2. **Emerald Atelier (Finans, Veri & Analitik):**
   * Derin orman yeşili/siyah (`#06110d`), koyu zümrüt kartlar (`#0d1e18`), canlı nane vurgusu (`#10b981`), narin altın detaylar (`#fbbf24`).
3. **Warm Monochrome / Craft (Editoryal, Not & CMS):**
   * Sıcak koyu gri/kahvemsi siyah (`#121110`), sıcak taş paneller (`#1c1a18`), amber/turuncu vurgu (`#f59e0b`).
4. **Clean Nordic Light (Kullanıcı Aydınlık Tema İsterse):**
   * Kar beyazı değil, kağıt beyazı (`#fafaf9`), yumuşak keten kartlar (`#ffffff`), duman grisi sınırlar (`#e2e8f0`), derin lacivert metin (`#0f172a`).

### C. Dokunsal Geri Bildirim & Mikro Etkileşimler (Tactile UI)
* **Gerçekçi Buton Basılma Hissi:** `active: scale(0.98)` ve `transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)`.
* **Fokus Halkaları:** `outline: none` yapılıp kör bırakılmaz; `box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.35)` ile zarif vurgulanır.
* **Yumuşak Geçişler (Micro-Animations):** Sayfa açılışlarında veya modal görünürken `fade-in-up` animasyonları (150ms-250ms).
* **Cam Efekti (Bespoke Glassmorphism):** Aşırı opak olmayan, `backdrop-filter: blur(12px)` ile arkadaki içeriği zarifçe hissettiren yüzeyler.

---

## 🛠️ 3. Arayüzde Yaratıcı İmza Dokunuşları (Signature Polish)

1. **Dinamik Boş Durumlar (Empty States):** Boş tablolarda sadece "Veri yok" yazmak yerine, o an ne yapılması gerektiğini anlatan şık bir illüstrasyon/ikon, açıklama ve "İlk Veriyi Ekle" eylem butonu.
2. **Canlı Durum İndikatörleri:** Sunucu bağlıyken hafifçe nabız gibi atan (pulsing) yeşil nokta (`status-indicator-online`).
3. **Akıllı Klavye İpuçları:** Butonların veya arama kutusunun yanında zarif `⌘K` veya `CTRL + F` rozetleri (`kbd` etiketleri).
4. **Çoklu Görünüm Geçişleri (View Switchers):** Veri listelerinde kullanıcıya tek tıkla Tablo Görünümü / Kart Görünümü / Kompakt Liste seçeneği sunma.
5. **Akıcı İlerleme (Skeleton Screens):** Yükleniyor spinner'ı yerine içerik yüklenirken modern iskelet (skeleton loading) dalgalanması.

