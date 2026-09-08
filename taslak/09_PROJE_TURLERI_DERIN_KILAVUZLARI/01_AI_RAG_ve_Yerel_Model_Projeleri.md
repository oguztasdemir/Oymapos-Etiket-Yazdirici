# 🧠 Proje Türü Kılavuzu: AI, RAG ve Yerel Model Projeleri
> **KULLANIM:** Yapay zeka destekli bir sohbet, doküman analizi, RAG veya persona projesi geliştirirken bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # Uvicorn + FastAPI başlatan ve tarayıcıyı açan başlatıcı
├── requirements.txt            # fastapi, uvicorn, chromadb, ollama, pydantic
├── backend/
│   ├── app.py                  # API rotaları, CORS ve statik frontend sunumu
│   ├── controllers/
│   │   ├── chat_controller.py  # Sohbet akışı (streaming)
│   │   └── rag_controller.py   # Doküman yükleme ve sorgulama
│   ├── services/
│   │   ├── orchestrator.py     # Sök-çıkar boru hattı yöneticisi
│   │   ├── ollama_service.py   # http://localhost:11434 bağlantısı
│   │   ├── vector_service.py   # ChromaDB vektör deposu
│   │   └── chunker.py          # 500-1000 karakter, %15 örtüşmeli parçalama
│   └── models/schemas.py       # Pydantic mesaj ve oturum şemaları
├── frontend/                   # 3 Panelli Gemini Arayüzü (Sol: Oturumlar/Model, Orta: Chat, Sağ: Önizleme)
├── data/vector_store/          # ChromaDB dosyaları
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **Ollama Otomatik Keşif:** Başlangıçta `GET http://localhost:11434/api/tags` ile kurulu modeller çekilir ve sol panele dinamik liste verilir.
2. **Akışlı Çıktı (Streaming):** Server-Sent Events (SSE) ile harf harf yanıt üretilir.
3. **Halüsinasyon Yasağı:** Context dışına çıkılmaz; *"Yalnızca verilen bağlamdaki bilgilerle cevap ver"* kuralı işletilir.
4. **F5 Durum Koruma:** SQLite veya yerel oturum deposu kullanılır; sayfa yenilendiğinde sohbet silinmez.
