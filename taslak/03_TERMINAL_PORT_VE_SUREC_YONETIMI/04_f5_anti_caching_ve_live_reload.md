# 🔄 04. F5 = CTRL+F5 Kuralı, Anti-Caching ve Canlı Yenileme

Kullanıcı arayüzde `F5` tuşuna bastığında tarayıcı önbelleğine (cache) takılmadan her zaman en güncel CSS ve JS dosyaları yüklenmelidir.

---

## 🛡️ Anti-Cache Kuralları
1. **HTTP Headers:** Sunucu statik dosyalar için şu başlıkları zorunlu döndürür:
   * `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`
   * `Pragma: no-cache`
   * `Expires: 0`
2. **Cache-Busting Parametresi:** HTML içerisindeki script ve stil importlarına zaman damgası eklenir:
   ```html
   <link rel="stylesheet" href="css/style.css?v=174000">
   <script src="js/app.js?v=174000"></script>
   ```
3. **State Koruma:** F5 yapıldığında oturum verileri veya yüklenen belgeler kaybolmamalı, ancak yeni odalar/oturumlar kopyalanıp çoğaltılmamalıdır.
