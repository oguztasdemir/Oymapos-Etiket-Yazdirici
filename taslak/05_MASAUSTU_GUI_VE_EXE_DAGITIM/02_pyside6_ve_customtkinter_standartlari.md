# 🖥️ 02. `PySide6` ve `CustomTkinter` Standartları

Yerel Python arayüz bileşenleri gerektiğinde `PySide6` (Qt) veya `CustomTkinter` kullanılır.

---

## 🎨 Tasarım İlkeleri
1. **Splitter (Ayırıcı Çubuklar):** Paneller arasındaki genişlik kullanıcı tarafından sürüklenebilir olmalıdır (`QSplitter`).
2. **Koyu Tema:** Koyu arkaplan (`#0b0f19`) ve belirgin kart renkleri uygulanmalıdır.
3. **Yerel Dosya Seçici:** `QFileDialog.getOpenFileName` veya `customtkinter.filedialog.askopenfilename` kullanılmalıdır.
