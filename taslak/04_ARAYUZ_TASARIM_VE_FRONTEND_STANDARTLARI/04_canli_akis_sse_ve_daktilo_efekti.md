# ⚡ 04. Canlı Akış (SSE), Daktilo Efekti ve İlerleme Çubukları

Yapay zeka üretimi, web scraping veya dosya dönüştürme gibi uzun süren işlemlerde kullanıcı donmuş bir ekranla baş başa bırakılmaz.

---

## 📡 Server-Sent Events (SSE) ile Canlı Veri Akışı

```javascript
// Frontend - js/api.js
function streamAIResponse(prompt, onChunk, onComplete) {
    const eventSource = new EventSource(`/api/stream?prompt=${encodeURIComponent(prompt)}`);
    
    eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
            eventSource.close();
            if (onComplete) onComplete();
        } else {
            onChunk(event.data);
        }
    };
    
    eventSource.onerror = () => {
        eventSource.close();
    };
}
```
