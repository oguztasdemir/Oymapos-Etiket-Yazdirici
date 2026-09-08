# 🪟 01. `pywebview` ile Modern Masaüstü Uygulaması

`pywebview`, modern HTML5/CSS3/JavaScript ile yazılmış web arayüzlerini yerel bir masaüstü penceresi içinde (Chrome/Edge motoruyla) çalıştırmanın en hafif ve şık yoludur.

---

## 🚀 Standart `main.py` Örneği

```python
import webview
from core.asset_manager import get_asset_path

class AppAPI:
    def process_data(self, payload):
        # Python iş mantığı
        return {"status": "success", "result": "Veri işlendi"}

def main():
    api = AppAPI()
    html_path = get_asset_path("frontend/index.html")
    
    window = webview.create_window(
        title="Uygulama Adı",
        url=str(html_path),
        js_api=api,
        width=1200,
        height=800,
        min_size=(900, 600),
        background_color='#0b0f19'
    )
    webview.start(debug=False)

if __name__ == "__main__":
    main()
```
