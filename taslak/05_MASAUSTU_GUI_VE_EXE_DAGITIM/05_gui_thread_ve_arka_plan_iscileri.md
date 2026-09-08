# 🧵 05. GUI Threading ve Donmayan Arayüz Standartları

Masaüstü uygulamalarında dosya tarama, PDF OCR, scraping veya AI çağrıları ana UI döngüsünü dondurmamalıdır.

---

## 🛠️ Donmayan Thread Fonksiyonu

```python
import threading

def run_in_background(task_fn, on_success=None, on_error=None):
    """Arayüzü kilitlemeden arka planda iş parçacığı çalıştırır."""
    def worker():
        try:
            res = task_fn()
            if on_success:
                on_success(res)
        except Exception as e:
            if on_error:
                on_error(e)
            else:
                print(f"[❌ Hata] {e}")

    t = threading.Thread(target=worker, daemon=True)
    t.start()
```
