# 📏 03. Proje Ölçeklendirme: Mikro, Orta ve Büyük Ölçek

Yapay zeka projenin büyüklüğüne göre gereksiz klasör ve soyutlama yükü oluşturmamalıdır:

---

## 🟢 1. Mikro Ölçek (Hızlı Araçlar / Mini Scriptler)
* **Örnek:** Tek seferlik PDF sayfa ayırıcı, JSON formatlayıcı, mini CLI hesap makinesi.
* **Klasör Düzeni:**
```
[proje_adi]/
├── main.py
├── requirements.txt
└── README.md
```
* **Kural:** 10 tane alt klasör açılmaz, tüm mantık tek veya iki dosyada temizce toplanır.

---

## 🟡 2. Orta Ölçek (Masaüstü GUI / Standart Web / Bot)
* **Örnek:** 2-3 panelli masaüstü aracı, e-ticaret botu, interaktif sınav sistemi.
* **Klasör Düzeni:** `core/`, `gui/` (veya `frontend/`), `docs/`, `main.py`.
* **Kural:** İş mantığı ve arayüz birbirinden temizce ayrılır.

---

## 🔵 3. Büyük Ölçek (Full-Stack / AI Boru Hattı / Çok Katmanlı)
* **Örnek:** RAG bilgi bankası, büyük veri analiz platformu, çok modelli görsel/metin motoru.
* **Klasör Düzeni:** `backend/` (`controllers/`, `services/`, `models/`), `frontend/`, `data/`, `docs/`, `backup/`.
* **Kural:** Servisler sök-çıkar (plug-and-play) mimaride yazılır.
