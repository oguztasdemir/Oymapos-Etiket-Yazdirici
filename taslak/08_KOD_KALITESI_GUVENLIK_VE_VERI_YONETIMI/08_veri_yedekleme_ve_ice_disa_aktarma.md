# 💾 08. Veri Yedekleme, İçe/Dışa Aktarma (JSON & Excel) Standartları

Kullanıcıların oluşturduğu veya işlediği verilerin güvenliği için projeye tek tıkla dışa aktarma (Export) ve geri yükleme (Import) standartları eklenir.

---

## 🛠️ Standart Dışa Aktarma Uç Noktaları (Endpoints):
* `GET /api/export/json`: Tüm veritabanını veya oturum verilerini tek parça `backup_YYYYMMDD.json` olarak indirir.
* `GET /api/export/excel`: Tablo verilerini biçimlendirilmiş `.xlsx` olarak indirir.
* `POST /api/import/json`: Yedeklenen JSON dosyasını geri yükler.

---

## 🛡️ Otomatik Güvenlik Yedeği:
Veritabanında büyük bir silme veya toplu güncelleme yapılmadan önce `backup/` klasörüne anlık `.sqlite` kopyası alınır.
