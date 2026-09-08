# 🎬 Proje Türü Kılavuzu: Medya İndirici, Video ve Transkript
> **KULLANIM:** Youtube, Shorts, Webtoon veya ses/video transkript projeleri geliştirirken bu kılavuz uygulanır.

---

## 🏗️ 1. Mimari ve Klasör Hiyerarşisi
```
[proje_adi]/
├── main.py                     # Medya sunucusunu ve arayüzü başlatan dosya
├── requirements.txt            # yt-dlp, openai-whisper, fastapi, aiofiles
├── core/
│   ├── downloader.py           # Video/Ses indirme kuyruğu
│   ├── transcriber.py          # Whisper ile otomatik metne dökme
│   ├── webtoon_scraper.py      # Bölümleri sırayla klasörleme
│   └── summarizer.py           # LLM ile video özetleyici
├── data/
│   ├── downloads/              # İndirilen MP4, MP3 ve resimler
│   └── transcripts/            # TXT ve JSON formatında altyazılar
└── docs/klasor.md
```

## ⚙️ 2. Çalışma ve Kod Kuralları
1. **Toplu Sıraya Alma:** Tek link veya playlist URL'si verildiğinde videolar sırayla indirilir; ilerleme çubuğu (progress bar) gösterilir.
2. **Harfiyen Transkript:** Whisper çıktısı zaman damgalarıyla (`[00:12]`) birlikte üretilir.
3. **Klasörleme Düzeni:** Webtoon bölümleri `Bölüm_01/01.jpg`, `Bölüm_01/02.jpg` şeklinde hiyerarşik kaydedilir.
