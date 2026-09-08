# 🤖 01. Playwright Stealth ve Anti-Bot Standartları

Modern web sitelerinde bot korumalarını (Cloudflare, reCAPTCHA vb.) aşarak güvenli kazıma yapma standartları.

---

## 🛠️ Playwright Stealth Konfigürasyonu
* **Stealth Plugin:** `playwright-stealth` aktif edilir.
* **User-Agent:** Gerçek ve güncel Chrome User-Agent başlığı kullanılır.
* **Viewport:** Doğal ekran çözünürlüğü (`1920x1080`) ayarlanır.
* **Başsız (Headless) / Görsel Mod:** Geliştirme anında `headless=False`, canlı üretimde `headless=True` geçişi yapılır.
