# ⌨️ 07. Klavye Kısayolları ve Komut Paleti (`Ctrl+K`) Standartları

Vibe coding uygulamalarında kullanıcıyı sadece fareye mahkum etmemek ve masaüstü/web hızını artırmak için standart klavye kısayolları eklenir.

---

## 🎯 Evrensel Kısayol Tuşları:
* `Ctrl + K` veya `Cmd + K`: **Evrensel Komut Paleti (Spotlight Search):** Sayfadaki tüm aksiyonları ve aramaları tek bir açılır kutuda toplar.
* `Ctrl + Enter`: Formu / Mesajı Gönder (Chat, Yorum, Veri Kaydı).
* `Ctrl + S`: Anlık Değişiklikleri Kaydet (Otomatik sunucuya POST atar, tarayıcının varsayılan sayfa kaydetme penceresini engeller: `e.preventDefault()`).
* `Escape`: Açık olan modalları, önizleme pencerelerini veya menüleri kapat.
* `Delete`: Seçili satırı / öğeyi listeden sil (Onay modalı ile).

---

## 🛠️ Standart JavaScript Kısayol Dinleyicisi

```javascript
document.addEventListener("keydown", (e) => {
    // Ctrl + S (Kaydet)
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveCurrentState();
    }
    // Ctrl + K (Komut Paleti)
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
    }
    // Escape (Modal Kapat)
    if (e.key === "Escape") {
        closeAllModals();
    }
});
```
