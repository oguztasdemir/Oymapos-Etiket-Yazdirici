# 📖 06. Dosya Sözlüğü (`docs/klasor.md`) Disiplini

Yapay zekanın projeye eklediği veya güncellediği HER DOSYA anında `docs/klasor.md` içerisine işlenmelidir.

---

## 📋 Standart `docs/klasor.md` Formatı

```markdown
# 📂 Proje Dosya Envanteri ve Sözlüğü

| Dosya Yolu | Katman | İşlevi ve Açıklaması |
| :--- | :--- | :--- |
| `main.py` | Başlatıcı | Port yönetimini yapar, backend sunucusunu ve tarayıcıyı tek tıkla açar. |
| `backend/app.py` | Sunucu | FastAPI uygulamasını başlatır, router'ları bağlar ve statik dosyaları sunar. |
| `frontend/index.html` | Arayüz | 2 panelli koyu tema arayüzün ana HTML giriş noktasıdır. |
| `frontend/css/style.css` | Tasarım | Koyu tema renk paletini (`#0b0f19`), modern fontları ve tablo stillerini içerir. |
| `core/engine.py` | İş Mantığı | PDF'ten veri çıkaran ve temizleyen ana motor fonksiyonudur. |
| `data/database.sqlite` | Veri | SQLite WAL modunda çalışan kullanıcı ve oturum veritabanı. |
```
