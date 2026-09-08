# 📚 02. RAG ve ChromaDB Vektör Depolama Standartları

Belge analizi ve bağlam aramalarında ChromaDB yerel disk deposu (`data/vector_store/`) kullanılır.

---

## ⚙️ RAG Boru Hattı Parametreleri:
* **Metin Bölme (Chunk Size):** 500 - 1000 karakter.
* **Örtüşme (Overlap):** %10 - %15 (yaklaşık 100 karakter).
* **Benzerlik Eşleştirme (Top-K):** 3 ila 5 en alakalı metin parçası alınır.
* **Bağlam Enjeksiyonu:** Seçilen Top-K metin parçaları prompt içerisine `--- BAĞLAM BAŞLANGICI ---` formatıyla enjekte edilir.
