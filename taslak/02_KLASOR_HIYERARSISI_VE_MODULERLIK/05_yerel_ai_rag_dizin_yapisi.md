# 🦙 05. Yerel AI, RAG ve Model Boru Hatları Dizin Yapısı

Bu şablon, yerel Ollama modelleri, ChromaDB vektör deposu ve belge analizi yapan AI araçları içindir.

---

## 📁 Standart Dizin Ağacı

```
[proje_adi]/
├── main.py                     # API sunucusunu ve AI boru hattını başlatan dosya
├── requirements.txt            # ollama, chromadb, fastapi, pydantic vb.
├── README.md                   # Model indirme ve RAG kullanım kılavuzu
│
├── ai_engine/                  # Yapay zeka ve RAG katmanı
│   ├── ollama_client.py        # Ollama API bağlantısı, model kontrolü ve streaming
│   ├── rag_pipeline.py         # Metin bölme (Chunking: 500-1000 kar.) ve benzerlik eşleştirme
│   ├── vector_store.py         # ChromaDB yerel koleksiyon yönetimi
│   └── prompt_templates.py     # Halüsinasyonu engelleyen sıkı sistem promptları
│
├── backend/                    # API sunucu katmanı (FastAPI)
├── frontend/                   # Modern Web Chat UI (Daktilo akış efekti)
├── data/
│   ├── vector_store/           # ChromaDB indeksleri
│   └── documents/              # Yüklenen PDF ve TXT belgeleri
└── docs/                       # klasor.md ve taslak.md
```
