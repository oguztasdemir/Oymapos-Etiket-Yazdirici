# 📊 04. Veri Ayrıştırma ve Excel / JSON Dışa Aktarma

Kazınan veriler `pandas` veya `openpyxl` ile biçimlendirilmiş Excel ve JSON dosyalarına aktarılır.

---

## 🛠️ Dışa Aktarma Standartları:
* **Kolon İsimleri:** Türkçe ve anlaşılır başlıklar (örn: `Fatura No`, `Tarih`, `Tutar (TL)`).
* **Otomatik Genişlik:** Excel sütun genişlikleri içeriğe göre otomatik ayarlanır.
* **Yedek Çıktı:** Her zaman `data/exports/` klasörüne zaman damgalı olarak yazılır.
