# 📝 04. Mimari Karar Günlüğü (ADR) Standartları

Proje boyunca alınan kritik teknik kararlar (teknoloji değişikliği, veritabanı seçimi, veri formatı) `docs/kararlar.md` içerisine kaydedilir.

---

## 🏛️ Standart ADR Formatı

```markdown
# 🏛️ Mimari Karar Günlüğü (Architecture Decision Records)

### [2026-08-22] - ADR-001: SQLite WAL Modu ve Paralel Erişim
* **Durum:** Kabul Edildi
* **Bağlam:** Arka plan botu veri yazarken web arayüzünden okuma yapıldığında veritabanı kilitleniyordu.
* **Karar:** SQLite `PRAGMA journal_mode=WAL;` ve `check_same_thread=False` moduna geçirildi.
* **Sonuç:** Eşzamanlı okuma/yazma hatası sıfırlandı.

### [2026-08-22] - ADR-002: Tek Portta FastAPI StaticFiles Birleşimi
* **Durum:** Kabul Edildi
* **Bağlam:** Ayrı bir Node.js dev server çalıştırmak port çakışmalarına yol açıyordu.
* **Karar:** Frontend Vanilla HTML5/CSS3 olarak yazıldı ve FastAPI StaticFiles ile port 8000 üzerinden sunuldu.
* **Sonuç:** Kullanıcı tek tıkla `python main.py` diyerek projeyi ayağa kaldırabilir hale geldi.
```
