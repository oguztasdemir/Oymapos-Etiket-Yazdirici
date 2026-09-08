# 🦙 01. Yerel Ollama Entegrasyonu ve Model Yönetimi

Yerel modeller `http://localhost:11434` portu üzerinden bağlanır.

---

## 🛠️ Temel Kurallar:
1. **Dinamik Model Listeleme:** Başlangıçta `/api/tags` sorgulanarak kullanıcının bilgisayarında yüklü modeller arayüze dropdown olarak doldurulur.
2. **Akışlı Yanıt (Streaming):** `/api/generate` veya `/api/chat` uç noktası üzerinden `stream=True` ile token token yanıt alınır.
3. **Bağlantı Kontrolü:** Ollama kapalıysa kullanıcıya çirkin hata basmak yerine *"Ollama servisi başlatılamadı, lütfen Ollama'yı açın"* uyarısı verilir.
