# 🚀 04. Tek Tıkla `build_exe.py` Derleme Scripti

Kullanıcıya karmaşık PyInstaller parametreleri yazdırmadan tek tıkla `.exe` üreten standart derleme aracı.

---

## 🛠️ Standart `build_exe.py`

```python
import os
import subprocess
import sys

def build():
    print("🚀 [1/3] PyInstaller kontrol ediliyor...")
    try:
        import PyInstaller
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    app_name = "Uygulama"
    entry_point = "main.py"
    icon = "assets/icon.ico" if os.path.exists("assets/icon.ico") else None

    cmd = [
        "pyinstaller",
        "--name", app_name,
        "--noconsole",
        "--onefile",
        "--clean",
        "--noconfirm",
        "--add-data", "frontend;frontend",
        "--add-data", "data;data"
    ]
    if icon:
        cmd.extend(["--icon", icon])
    cmd.append(entry_point)

    print("⚙️ [2/3] .EXE derleniyor...")
    res = subprocess.run(cmd)
    if res.returncode == 0:
        print(f"✅ [3/3] Derleme tamamlandı! Çıktı: dist/{app_name}.exe")
    else:
        print("❌ Derleme hatası.")

if __name__ == "__main__":
    build()
```
