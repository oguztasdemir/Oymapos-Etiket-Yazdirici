# 📱 10. Sosyal Medya (Instagram Klonu), SaaS ve Medya Platformları Kılavuzu

Bu kılavuz; Instagram, Twitter/X, Pinterest tarzı akış (feed), hikaye (story), medya yükleme, canlı etkileşim ve SaaS platformları geliştirilirken uygulanacak özel mimari standartları belirler.

---

## 🎯 1. Temel Sosyal Medya Mimarisi ve İlkeler

### A. Medya Yükleme ve Optimizasyon (Görsel / Video Pipeline):
* **Otomatik Boyutlandırma:** Yüklenen görseller `Pillow` ile anında optimize edilir, küçük resim (thumbnail) ve tam boyut versiyonları üretilir.
* **Video İşleme:** Kısa videolar için `moviepy` veya `ffmpeg` ile thumbnail karesi çıkarma.
* **Sürükle-Bırak Yükleme Alanı:** Çoklu dosya seçimi, anlık görsel kırpma (crop) ve filtre önizlemesi.

### B. Sonsuz Kaydırma (Infinite Scroll) ve Sayfalama:
* Sayfa numarası yerine **Cursor-based** veya **Offset-based** sayfalama (`/api/feed?cursor=timestamp`).
* Kullanıcı sayfanın altına yaklaştığında arka planda bir sonraki 10 gönderi çekilir; donma yaşanmaz.
* Görseller `loading="lazy"` ile tembel yüklenir.

### C. Canlı Etkileşim ve Anlık Bildirimler:
* **WebSocket / SSE:** Yeni beğeni, yorum, mesaj geldiğinde sayfa yenilenmeden kırmızı bildirim rozeti yanar.
* **İyimser Arayüz Güncellemesi (Optimistic UI):** Beğen (Like) veya Kaydet butonuna tıklandığında sunucu yanıtı beklenmeden arayüzde kalp anında kırmızıya döner ve sayaç +1 artar; hata olursa geri alınır.

### D. Arayüz Yerleşimi (Instagram / Mobil Uyumlu Grid):
* **Üst Bar:** Hikaye (Story) çemberleri ve hikaye görüntüleme modalı.
* **Sol / Alt Bar:** Navigasyon menüsü (Akış, Keşfet, Oluştur, Bildirimler, Profil).
* **Orta Akış (Feed):** Kullanıcı kartları, çift tıklama ile kalp animasyonu, yorum modalı.
* **Profil Ekranı:** 3 sütunlu kare görsel ızgarası (Grid View) ve bio/istatistik alanı.

---

## 📁 Standart Sosyal Medya Klasör Şablonu

```
[sosyal_proje_adi]/
├── main.py                     # Sunucuyu ve arayüzü tek tıkla başlatan dosya
├── backend/
│   ├── app.py                  # FastAPI + WebSocket router + StaticFiles
│   ├── auth.py                 # Kullanıcı oturum, şifreleme ve JWT/Cookie yönetimi
│   ├── controllers/            # feed_api.py, post_api.py, user_api.py, chat_api.py
│   ├── services/
│   │   ├── media_processor.py  # Görsel sıkıştırma, thumbnail ve video işleme
│   │   └── websocket_hub.py    # Anlık beğeni, mesaj ve bildirim dağıtıcı
│   └── models/                 # User, Post, Comment, Like, Story şemaları
├── frontend/
│   ├── index.html              # Instagram tarzı modern mobil/web uyumlu arayüz
│   ├── css/
│   │   ├── style.css           # Dark mode (#000000, #121212) ve cam efektleri
│   │   └── animations.css      # Çift tık kalp patlama, story halkası animasyonları
│   └── js/
│       ├── feed.js             # Sonsuz kaydırma ve gönderi render motoru
│       ├── media_uploader.js   # Görsel yükleme ve filtreleme motoru
│       └── ws_client.js        # Canlı bildirim ve beğeni dinleyicisi
├── data/
│   ├── database.sqlite         # SQLite WAL veritabanı
│   └── media/
│       ├── posts/              # Gönderi görselleri
│       ├── thumbnails/         # Önizleme küçük resimleri
│       └── stories/            # 24 saatlik hikayeler
└── docs/
    └── klasor.md
```
