# 🔔 06. Toast Bildirimler ve Modal Sistemleri

Kullanıcı işlemlerinde (Kaydedildi, Hata oluştu, Dosya indirildi) sayfa yenilenmeden ekranın sağ üst/alt köşesinde kaybolan Toast bildirimleri gösterilir.

---

## 🍞 Standart Toast Kullanımı

```javascript
// ui.showToast("İşlem başarıyla tamamlandı!", "success");
// ui.showToast("Dosya bulunamadı.", "error");

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
```
