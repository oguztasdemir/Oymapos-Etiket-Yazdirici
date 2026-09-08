# 🔄 03. Otonom Hata Düzeltme (Self-Healing Loop)

Yapay zeka çalıştırma sırasında bir hata aldığında panikleyip kullanıcıya sormak yerine önce kendi içinde çözmeye çalışır.

---

## 🔁 Kendi Kendini İyileştirme Akışı:
1. **Hatayı Tanı:** Terminal çıktısındaki hata türünü tespit et (örn: `ModuleNotFoundError`, `WinError 10048`, `FileNotFoundError`).
2. **Otonom Düzelt:**
   * Paket eksikse: `pip install [paket]` çalıştır.
   * Port doluysa: Bir sonraki porta geç.
   * Yol hatalıysa: `pathlib.Path` yolunu düzelt.
3. **Tekrar Dene:** Kodu tekrar çalıştırıp doğrula.
4. **Raporla:** Kullanıcıya sadece nihai başarılı durumu bildir.
