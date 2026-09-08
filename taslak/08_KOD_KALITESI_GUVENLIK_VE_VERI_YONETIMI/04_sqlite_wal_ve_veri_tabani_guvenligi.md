# 🗄️ 04. SQLite WAL ve Veritabanı Güvenliği

SQLite veritabanı kullanılırken kilitlenmeleri (`database is locked`) ve çakışmaları engelleyen standartlar.

---

## 🛠️ Standart SQLite Bağlantısı

```python
import sqlite3

def get_db_connection(db_path="data/database.sqlite"):
    conn = sqlite3.connect(db_path, check_same_thread=False, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.row_factory = sqlite3.Row
    return conn
```
