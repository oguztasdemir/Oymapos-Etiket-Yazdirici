# 👁️ 05. OCR ve Görsel Belge İşleme Standartları

PDF veya görsel belgelerden (fatura, soru kitapçığı, kimlik) metin çıkarılırken izlenecek kurallar.

---

## 🛠️ OCR Standartları:
1. **Seviyeli Çıkarma:** Önce `pypdf` veya `pdfplumber` ile doğrudan metin katmanı okunur. Eğer metin katmanı yoksa (taranmış görselse) `pytesseract` veya `easyocr` motoruna yönlendirilir.
2. **Tablo Tespiti:** Fatura veya tablolarda `pdfplumber.extract_tables()` kullanılır; ham düz metin karmaşası önlenir.
