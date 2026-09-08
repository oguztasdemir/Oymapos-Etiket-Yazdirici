# 🎓 Proje Türü Kılavuzu: Eğitim, Sınav ve Kelime Kampları
> **KULLANIM:** YÖKDİL, YDS, KPSS veya dil öğrenme/sınav projeleri geliştirirken bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # Sunucuyu ve sınav arayüzünü başlatan dosya
├── requirements.txt            # fastapi, sqlite3, pydantic
├── backend/
│   ├── app.py
│   ├── controllers/quiz_controller.py
│   ├── services/
│   │   ├── question_engine.py  # Soru havuzundan rastgele/sıralı soru çekici
│   │   ├── vocabulary_camp.py  # Günlük kelime kampları ve kök çıkarma (-ing, -ed temizleme)
│   │   └── score_tracker.py    # Doğru/Yanlış ve başarı yüzdesi hesaplayıcı
│   └── models/quiz_models.py
├── frontend/                   # 3 Panelli Arayüz (Sol: Kamp Günleri/Kategoriler, Orta: Soru & Şıklar, Sağ: Kelime Detayı/Flashcard)
├── data/questions.sqlite       # Sınav soru bankası ve kelime sözlüğü
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **Anlık Doğru/Yanlış Geri Bildirimi:** Şıkka tıklandığı an yeşil (doğru) veya kırmızı (yanlış) animasyon gösterilir; açıklama metni anında açılır.
2. **Kelime Kökü Normalizasyonu:** Kelimeler eklerinden arındırılarak 1. yalın haline getirilir.
3. **Flashcard ve Kelime Eşleştirme:** İki sütunlu interaktif eşleştirme oyunu ve telaffuz desteği sağlanır.
