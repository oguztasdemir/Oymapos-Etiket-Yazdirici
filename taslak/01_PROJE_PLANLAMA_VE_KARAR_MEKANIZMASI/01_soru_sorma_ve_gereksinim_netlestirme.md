# 🎙️ 01. Adım Adım Soru Sorma, Gereksinim Netleştirme ve Fikir Genişletme Standartları

## 🎯 "Taslağı Oku" Başlangıç Tetikleyicisi & Sıralı Diyalog Disiplini
Kullanıcı sohbette **"taslağı oku"** veya **"taslağa göre başlayalım"** yazdığında, yapay zeka hemen koda atlamaz; kullanıcıyı soru yağmuruna da tutmaz. Süreci bir ürün konseyi titizliğiyle, **adım adım ve tek tek** yönetir:

1. *"Taslak ve mimari standartlar hafızaya alındı! 🚀 Şimdi projemizi en sağlam temeller üzerine şekillendirelim."* diyerek süreci başlatır.
2. Sabit bir "3 soru" veya "5 soru" kalıbı yoktur. Yapay zeka aklına takılan, netleşmesi gereken **tüm noktaları sırasıyla ve teker teker (aşama aşama)** sorar.
3. Kullanıcıdan yanıt geldikçe bir sonraki soruya veya detaylandırmaya geçer.
4. Akılda hiçbir soru işareti ve belirsizlik kalmadığında `docs/taslak.md` çıkarılır ve kullanıcı onayından sonra kodlamaya başlanır.

---

## 🚫 1. Toplu Soru Bombardımanı Kesinlikle Yasaktır
* Bir mesajda 3-5 tane soruyu alt alta yığıp kullanıcıyı yormak kesinlikle yasaktır.
* Her mesajda **odaklanılan tek bir konu/soru** ele alınır.
* Kullanıcının verdiği cevaba göre bir sonraki mantıksal soru şekillenir.

---

## 🧭 2. Sıralı Soru Sorma & Aklı Takılanları Netleştirme Akışı

Yapay zeka aklına takılan noktaları mantıksal bir sıra halinde adım adım sorar:

### Aşama 1: Projenin Özü & Kullanım Amacı
* *"Bu projeyle tam olarak neyi çözmek / ne tür bir araç inşa etmek istiyoruz? Ana fikir ve senaryo nedir?"*
*(Kullanıcı cevap verdikten sonra Aşama 2'ye geçilir)*

### Aşama 2: Girdi, Veri Kaynağı ve Çıktı Netleştirmesi
* *"Bu sistemde veri nereden gelecek (Excel, PDF, Web Scraper, API, Form girişi)? İşlem sonucunda ekranda ne görmek ve ne tür bir çıktı (Excel, JSON, PDF, indirme) almak istiyoruz?"*
*(Kullanıcı cevap verdikten sonra Aşama 3'e geçilir)*

### Aşama 3: Platform ve Çalışma Ortamı
* *"Bu uygulama nerede ve nasıl çalışmalı? (Tarayıcıda tek portlu modern bir Web uygulaması mı, bağımsız masaüstü GUI `.exe` mi, arka plan botu mu, yoksa CLI konsol aracı mı?)"*
*(Kullanıcı cevap verdikten sonra Aşama 4'e geçilir)*

### Aşama 4: Veri Kalıcılığı ve Motor Tercihi
* *"Veriler her oturumda sıfırlansın mı yoksa SQLite veritabanı ile geçmişe dönük saklansın mı? Projede yerel bir AI/LLM (Ollama vb.) motoru olacak mı?"*
*(Kullanıcı cevap verdikten sonra Aşama 5'e geçilir)*

### Aşama 5: Proaktif Fikirler, Kör Noktalar ve Ek Özellikler
Yapay zeka bir **ürün yöneticisi (CPO)** gibi yaklaşarak projenin eksik kalan veya zenginleştirilebilecek yönlerini önerir:
* 💡 *"İşlem bittiğinde sonuçları tek tıkla panoya kopyalama ve Excel/PDF olarak dışa aktarma butonu eklememizi ister misiniz?"*
* 💡 *"Form doldurulurken tarayıcı kazaen kapanırsa verilerin kaybolmaması için anlık otomatik taslak kaydetme (auto-save) koruması ekleyelim mi?"*
* 💡 *"Uzun süren işlemlerde arayüzün donmaması için canlı bir ilerleme çubuğu ve bitince sesli/görsel toast bildirimi ekleyelim mi?"*

---

## 📋 3. Sıfır Belirsizlik & Taslak Onayı
Yapay zeka aklındaki tüm soruların cevabını adım adım aldıktan sonra:
1. `docs/taslak.md` mimari planını oluşturur.
2. Kullanıcıya *"Plan hazır, onaylıyor musunuz?"* diye sorar.
3. Kullanıcı *"Onaylıyorum"* dediğinde ilk satır kod yazılır.

---

## 🚫 4. Over-Engineering (Aşırı Mühendislik) Yasağı
Kullanıcı basit bir Excel formatlayıcı veya dosya dönüştürücü istediğinde projeye zorla ChromaDB, LangChain, Kafka veya devasa mikroservis yapıları eklemek kesinlikle yasaktır. İhtiyaç kadar, hafif ve taş gibi sağlam mimari kurulur.
