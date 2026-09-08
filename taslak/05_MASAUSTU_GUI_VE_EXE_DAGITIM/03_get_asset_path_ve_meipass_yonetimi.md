# 🛡️ 03. `get_asset_path()` ve `_MEIPASS` Yol Güvenliği

PyInstaller paketlemesinde statik dosyaların kaybolmasını ve siyah ekranda çökmesini engelleyen temel fonksiyon.

---

## 🛠️ Standart `core/asset_manager.py`

```python
import os
import sys
from pathlib import Path

def get_asset_path(relative_path: str) -> Path:
    """
    Geliştirme ortamında (normal python) ve derlenmiş PyInstaller .EXE içinde
    statik dosyalara (html, css, resim, db) hatasız erişim sağlar.
    """
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).resolve().parent.parent
        
    return base_path / relative_path
```
