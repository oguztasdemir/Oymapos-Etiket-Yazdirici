# 🔌 03. Otomatik Port Çakışma Çözücü

Proje başlatılırken varsayılan port (`8000`) doluysa sistem çökmek yerine otomatik olarak boş bir port bulmalı veya portu kullanan eski süreci temizlemelidir.

---

## 🛠️ Standart Port Bulucu Fonksiyon

```python
import socket

def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> int:
    """Belirtilen port doluysa bir sonraki boş portu bulur."""
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"{start_port} ile {start_port + max_attempts} arasında boş port bulunamadı.")
```
