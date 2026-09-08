# 🔇 02. No-Spam Terminal ve Durum Rozetleri

Terminal gereksiz HTTP istek loglarıyla (`GET 200 OK`, `favicon.ico`, `304 Not Modified`) kirletilemez.

---

## 📋 Standart Terminal Çıktı Formatı

Terminalde bir olay gerçekleştiğinde **1 satır boşluk bırakılarak** temiz ve okunaklı durum mesajı yazılır:

```
[⚡ Güncellendi]
Kodda bir değişiklik algılandı ve sunucu otomatik yenilendi.

[🔄 Sayfa Yenilendi]
Kullanıcı arayüzü başarıyla yenilendi (F5).

[✅ İşlem Tamamlandı]
100 dosya başarıyla tarandı ve Excel'e aktarıldı.

[❌ Hata: Dosya Bulunamadı]
data/uploads/rapor.pdf dosyasına erişilemedi.
```

### ⏳ Uzun İşlemlerde Tek Satır İlerleme (`\r` Standartı)
Toplu veri işleme veya indirme sırasında terminal satır satır doldurulmaz; aynı satır güncellenir:
```python
print(f"\r[⏳ İşleniyor: %{yuzde} ({mevcut}/{toplam} Dosya)]", end="", flush=True)
```
