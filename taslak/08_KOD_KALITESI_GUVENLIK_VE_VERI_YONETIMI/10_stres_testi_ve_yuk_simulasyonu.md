# ⚡ 10. Stres Testi, Yük Simülasyonu ve Uç Senaryo Doğrulaması

> **TEMEL KURAL:** Kod yalnızca 3-5 adet temiz test verisiyle doğrulanmaz. Sistemin gerçek dünyadaki zorlu koşullarda nasıl davrandığını görmek için **10.000 satırlık yük simülasyonu ve bozuk veri denemeleri (Fuzzing)** yapılır.

---

## 🧪 1. 10.000 Satırlık Hızlı Yük Testi Scripti (`tests/stress_test.py`)

Veritabanı ve sorgu hızını ölçmek için standart test motoru:

```python
import sqlite3
import time
import random
import string

def run_stress_test(db_path="data/app.db", record_count=10000):
    print(f"\n[⚡ STRES TESTİ BAŞLADI] {record_count} adet kayıt üretiliyor...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # WAL modunu doğrula
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stress_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            score REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    start_time = time.time()
    batch_data = [
        (''.join(random.choices(string.ascii_letters, k=20)), random.uniform(10.0, 99.9))
        for _ in range(record_count)
    ]
    
    cursor.executemany("INSERT INTO stress_logs (title, score) VALUES (?, ?)", batch_data)
    conn.commit()
    insert_duration = time.time() - start_time
    
    # Okuma testi
    read_start = time.time()
    cursor.execute("SELECT COUNT(*), AVG(score) FROM stress_logs")
    count, avg_score = cursor.fetchone()
    read_duration = time.time() - read_start
    
    conn.close()
    
    print(f"[✅ TEST TAMAMLANDI]")
    print(f"  * {record_count} Kayıt Yazma Süresi : {insert_duration:.3f} saniye")
    print(f"  * Agregasyon / Okuma Süresi     : {read_duration:.4f} saniye")
    print(f"  * Toplam Kayıt / Ortalama Puan   : {count} / {avg_score:.2f}\n")

if __name__ == "__main__":
    run_stress_test()
```

---

## 🌪️ 2. Uç Senaryo & Bozuk Veri (Fuzzing) Kontrol Listesi

Sistem şu 5 sınır dışı senaryoya karşı test edilir:
1. **0 Baytlık Boş Dosya:** Yüklendiğinde 500 hatası vermemeli, kullanıcıya *"Dosya boş"* uyarısı dönmeli.
2. **Çok Uzun Karakter Dizileri:** 10.000 karakterlik kesintisiz metin girdi kutularını ve tablo genişliğini taşırmamalı (`word-break: break-word`).
3. **Özel Karakterler & Emojiler:** `utf-8` zırhı sayesinde Türkçe harfler (`İ, ğ, ş, ç`) ve emojiler (`🚀, 🤖`) veritabanında bozulmadan saklanmalı.
4. **Hızlı Seri Tıklama:** Kullanıcı butona 5 kez üst üste bastığında sistem işlemi 1 kez icra etmeli.
