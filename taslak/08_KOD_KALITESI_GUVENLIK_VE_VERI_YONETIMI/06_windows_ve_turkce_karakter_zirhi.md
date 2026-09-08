# 🪟 06. Windows ve Türkçe Karakter Koruma Zırhı

Windows işletim sisteminde Türkçe karakter bozulmalarını (`İ, ı, ş, ğ, ü, ö, ç`) ve yol (`\`) hatalarını engelleyen temel kurallar.

---

## 🛡️ Standart Kurallar:
1. **Python Konsol Kodlaması:** `main.py` girişinde:
   ```python
   import sys
   if sys.platform == "win32":
       sys.stdout.reconfigure(encoding='utf-8')
       sys.stderr.reconfigure(encoding='utf-8')
   ```
2. **Dosya Açma:** Tüm `open()` çağrılarında açıkça `encoding='utf-8'` parametresi verilir.
3. **HTML Başlığı:** Tüm HTML sayfalarında `<meta charset="UTF-8">` ve `<html lang="tr">` zorunludur.
4. **Yol Tanımları:** Asla elle `"C:\\Users\\..."` yazılmaz; `pathlib.Path` veya `os.path.join()` kullanılır.
