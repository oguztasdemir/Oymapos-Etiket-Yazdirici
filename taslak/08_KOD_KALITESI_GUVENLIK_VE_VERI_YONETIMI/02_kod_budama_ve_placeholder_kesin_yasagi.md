# ✂️ 02. Kod Budama ve Placeholder Kesin Yasağı (Strict No-Truncation)

Yapay zekanın dosya üretirken veya güncellerken kodun ortasını kesip kısaltması kesinlikle yasaktır.

---

## 🚫 Yasaklı İfadeler:
* ❌ `// ... rest of the code remains the same ...`
* ❌ `# Existing functions here...`
* ❌ `<!-- Diğer kodlar aynı kalacak -->`
* ❌ `/* ... */`

## ✅ Zorunlu Kural:
Bir dosya güncellendiğinde ya hedeflenen fonksiyon eksiksiz yazılmalı ya da tüm dosya tam ve çalışır vaziyette teslim edilmelidir.
