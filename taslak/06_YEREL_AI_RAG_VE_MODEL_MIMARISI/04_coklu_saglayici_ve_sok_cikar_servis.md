# 🔌 04. Çoklu Sağlayıcı ve Sök-Çıkar (Plug-and-Play) Servis Mimarisi

Yerel modeller (Ollama) ile Bulut API'leri (Gemini, OpenAI, Anthropic) arasında tek bir config anahtarıyla geçiş yapılabilen arayüz.

---

## 🛠️ Standart `LLMProvider` Soyutlama Sınıfı

```python
from abc import ABC, abstractmethod

class BaseLLM(ABC):
    @abstractmethod
    def generate(self, prompt: str, system: str = "") -> str:
        pass
    
    @abstractmethod
    def stream(self, prompt: str, system: str = ""):
        pass

class OllamaProvider(BaseLLM):
    # Ollama istemcisi
    pass

class CloudProvider(BaseLLM):
    # Gemini / OpenAI istemcisi
    pass
```
