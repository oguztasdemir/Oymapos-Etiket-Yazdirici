# 🏆 Proje Türü Kılavuzu: Turnuva, Kura Çarkı ve Fikstür Motoru
> **KULLANIM:** FİFA turnuvaları, lig fikstürleri ve rastgele kura çekim araçlarında bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # Turnuva sunucusunu ve interaktif ekranı başlatan dosya
├── requirements.txt            # fastapi, uvicorn
├── core/
│   ├── tournament_engine.py    # Lig veya eleme fikstür oluşturucu
│   ├── wheel_service.py        # Rastgele kura ve çark eşleştirme mantığı
│   └── standings_calculator.py # Puan, averaj, galibiyet/mağlubiyet tablosu
├── frontend/                   # 3 Panel (Sol: Takımlar/Katılımcılar, Orta: Çark & Maçlar, Sağ: Puan Tablosu)
├── data/tournament.json        # Aktif turnuva veritabanı
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **İnteraktif Kura Çarkı:** Çark döndüğünde ses/animasyon efektiyle rastgele takım eşleşir.
2. **Kura ve Çark Ayrımı:** Kura çekimi ve çark birbirinden bağımsız çalışabilir olmalıdır.
3. **Otomatik Puan Tablosu:** Maç skoru girildiği an puan durumu, averaj ve sıralama anında güncellenir.
