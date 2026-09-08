# 🧠 Beyin Analizi - Grup 1: LLM Destekli IDE, Akademik İngilizce ve Disk Kurtarma

Bu doküman, kullanıcının en büyük 3 projesindeki binlerce mesajının satır satır taranmasıyla çıkarılan karar kurallarını içerir.

## 📌 Proje: LLM Destekli IDE
* **Toplam Sohbet:** 98 | **Toplam Mesaj:** 10055

### 🎯 Kullanıcının Müdahale ve Düzeltme Kuralları (Ne İstedi / Neyi Reddetti):
* ❌ **Düzeltme:** "1- Özelleştirilmiş yapay zeka sistemini kaldıralım buna şuan gerek yok bununla ilgili şeyleri de kaldır   2- ram ve sıcaklık verileri hala güncel değil bunu düzelt"
* ❌ **Düzeltme:** "gereksiz dosyalar var mı kontrol et"
* ❌ **Düzeltme:** "pdflerin solundaki seçim butonları çalışmıyor. Tümünü seçte çalışmıyor bunları düzelt"
* ❌ **Düzeltme:** "hala düzgün çıkarılmıyor metin. Buna ek olarak T boyutunu  ayarlamayı kaldır bu sağ paneldeki butonları düzenle ve dışaırı çıkarmayı optimize et"
* ❌ **Düzeltme:** "burada kaynaklar ve arşiv varya onları kaldır. Bunun yerine belgelere ekle onları arşive atılanlar da orada gözüksün böylece alan kazanırız. Bir diğeri de 151 soru diyor ya burada "
* ❌ **Düzeltme:** "soru sayısını düzgün bulamıyor düzeltmelisin"
* ❌ **Düzeltme:** "geri dön butonu hala bozuk çalışmıyor bugu düzelt"
* ❌ **Düzeltme:** "1- Sağda belgeler listeleniyor ya tıklayınca bilgisayara indiriyor bunu çözmelisin.  2- Belgeye tıklayınca belge önizlenemiyor ama metine dönüştürüyor bunu düzelt önizlenebilir olm"
* ❌ **Düzeltme:** "önizleme ekranı açılınca belgeyi indiriyor durduk yere bunu çöz. Ve hala beyaz ekran alıyoruz bunu düzelt"
* ❌ **Düzeltme:** "önizlenmeye önizleniyor ama orijinal boyutta değil kırpılımış duruyor düzelt"
* ❌ **Düzeltme:** "Soru 1: - 6.  sorularda, cümlede boş bırakılan yerlere uygun düşen sözcük veya ifadeyi bulunuz. 1.  A)  B)  C)  D)  E) 2. A)  B)  C)  D)  E) 3. A)  B)  C)  D)  E"
* ❌ **Düzeltme:** "geri alam işlemi başarısız oluyor düzelt"

### 🏗️ Mimari ve Klasör Kararları:
* 📐 **Mimari:** "Bir isteğim var. taslak.md adlı bir dosya oluştur ve oraya senden nasıl bir sistem istediğimi yaz. Her yeni projemde main.py olduğunu, klasör yapısının düzenli olduğunu, 1000 satır"
* 📐 **Mimari:** "Standart klasör yapısına gerek yok bazı şeylerde bu taslak değişebilir sadece nasıl olmas ıgerektiğini anlat. Arayüz başka bir klasörde, datalar başka bir yerde, frontend başka, se"
* 📐 **Mimari:** "web uygulama için ayrı, tkinter ile arayüz yapılacak ise ayrı falan olmalı ona göre parçalara ayır bütün klasör düzeni olmalı. Sen benim nasıl bir tasarım istediğimi az çok biliyor"
* 📐 **Mimari:** "Daha da sistematik yap çok kapsamlı bütün her şeyi ele alan bir .md oluştur. Gerekirse işlevlerine göre taslak klasörü oluştur ve içine böl benim istediğim stile göre böylece süred"
* 📐 **Mimari:** "aaştırma içerisine eklemişsin bu servisi ama şöyle olmalı. Örneğin araştırma içerisinde de alt klasör eklemeliyiz ve tamamen konum üzerine çalışmalıdır falan böyle sistemler olmalı"
* 📐 **Mimari:** "servisler adlı klasör yapısını şöyle düşünüyorum. arastirma diyor ya örneğin bunun içinde hangi esrvisler var"
* 📐 **Mimari:** "tüm services alt klasörlerini düzenle her şeyini"
* 📐 **Mimari:** "@[c:\Users\User\Desktop\LLM Destekli IDE\services\agent\servisler] böyle alt klasöre koymana gerek yoktu 1 üst klasörde kalabilir veya araçlar yapıp içine koyabilirsin. Sadece bunu"

### 🎨 Arayüz ve Kullanıcı Deneyimi Tercihleri:
* 🖌️ **Arayüz:** "Standart klasör yapısına gerek yok bazı şeylerde bu taslak değişebilir sadece nasıl olmas ıgerektiğini anlat. Arayüz başka bir klasörde, datalar başka bir yerde, frontend başka, se"
* 🖌️ **Arayüz:** "web uygulama için ayrı, tkinter ile arayüz yapılacak ise ayrı falan olmalı ona göre parçalara ayır bütün klasör düzeni olmalı. Sen benim nasıl bir tasarım istediğimi az çok biliyor"
* 🖌️ **Arayüz:** "burayı daha modern ve uygun bir hale getir orta paneli aşırı karışık duruyor karşılarken"
* 🖌️ **Arayüz:** "burası normal sohbet alanı gibi olsun ve bir mesaj yazınca solda gözüksün."
* 🖌️ **Arayüz:** "model şunu akıl edebilsin bir sınav formatı yüklendiğinde soru sıralamasının nasıl gittiğini örneğin bir mantık olmalıdır 1 2 3 4 5 gibi ilerliyorsa bir bağlam kurmalıdır o pdf içi"
* 🖌️ **Arayüz:** "pdflerin solundaki seçim butonları çalışmıyor. Tümünü seçte çalışmıyor bunları düzelt"
* 🖌️ **Arayüz:** "sağ üstteki isim değişmemelidir önizleme kalmalıdır. Buna ek olarak ram kullanımını optimize eden bir şey koymalısın belirli bir seviyede kalmalıdır abartılı kullanmamalıdır yoksa "
* 🖌️ **Arayüz:** "bilgisayarın güncel sıcaklığını gösteren bir özellikte ekleyebiliriz. Kullanıcı ayarlara gidip bu aşağı panelde neler gözükmeli neler gözükmemeli diye özelleştirebilmelidir örneğin"

---

## 📌 Proje: Akademik İngilizce Uygulamaları
* **Toplam Sohbet:** 49 | **Toplam Mesaj:** 4650

### 🎯 Kullanıcının Müdahale ve Düzeltme Kuralları (Ne İstedi / Neyi Reddetti):
* ❌ **Düzeltme:** "Örneğin burada read okumak zaten yeter hepsi anlaşılıyor gidip oku ve anlaşılmak falan gerek yok. Tüm kelimeleri buna göre de yap, saçma ve gereksiz anlamları yazma boşa kalabalık"
* ❌ **Düzeltme:** "Burada çevirileri 1. hale getirmelisin kelime kampındaki gibi kelimelerde. growing mesela veya -d -s takıları gereksiz. offer da 2 kere geldi galiba bu tarz varsa bunları da birleş"
* ❌ **Düzeltme:** "Tüm kelimeleri teker teker kontrol et çalışmayan hatalı bir şey var mı bak veya yanlış çeviri veya 1. halde olmayan"
* ❌ **Düzeltme:** "Şuan kaç kelime oldu v0 dışı kaldırılınca"
* ❌ **Düzeltme:** "vercel ve githubları ben demeden güncelleme çok zaman alıyor. Örneğin muktedir kelimesi çok nadir kullanılan tr kelime onu kaldır sık kullanılan kelimeler kalsın"
* ❌ **Düzeltme:** "En başından en sonuna tekrar kontrol et ve her şeyi yavaş yavaş emin olarak yap hatalar olmasını istemiyorum tüm her şey düzgün çevirilmeli, boş ve gereksiz çeviri varsa onları kal"
* ❌ **Düzeltme:** "Burada karneyi dışarı aktarma kısmında bir şey fark ettim pdf olarak çıkarınca doğru yanlışlar beraber çıkıyor. Bunu önleyelim. Önce tüm yanlışlar listelensin, sonra tüm doğrular d"
* ❌ **Düzeltme:** "sıradaki kampa geç derken 1 den 2ye geçince hata vermişti bir kontrol et ve düzelt"
* ❌ **Düzeltme:** "klasör yapısını düzelt"
* ❌ **Düzeltme:** "projedeki tüm kodları test et o zaman browser ile aç ve ekranları ss çek, siyah ekran verenleri tespit et eğer varsa ve onları düzelt"
* ❌ **Düzeltme:** "kelime kampı boş siyah ekran veriyor düzelt"
* ❌ **Düzeltme:** "sonraki kampa geç dedikten sonra sağda şöyle bir ekran açılıyor onu istemiyorum onu kaldır. Kodu düzelt test etmene gerek yok"

### 🏗️ Mimari ve Klasör Kararları:
* 📐 **Mimari:** "Burada çevirileri 1. hale getirmelisin kelime kampındaki gibi kelimelerde. growing mesela veya -d -s takıları gereksiz. offer da 2 kere geldi galiba bu tarz varsa bunları da birleş"
* 📐 **Mimari:** "scracthleri neden ana klasöre yazdın ve ben scractch yazmanı istemedim bana kelimeleri tespit etmeni ve V0 olmayan isim ve fiileri getirmeni istedim"
* 📐 **Mimari:** "day1 day2 falan koymana da gerek yok tüm jsonları klasör yapısını falan sil sağlık ve sosyalde"
* 📐 **Mimari:** "şimdi sadece fene göre bu V0 haline getir her şeyi, birbirini tekrar eden kelimele varsa ingilzice olarak örneğin offer 2 kere geçiyorsa ikisini birleştir. Tüm kelimelerde de sadec"
* 📐 **Mimari:** "klasör yapısını düzelt"
* 📐 **Mimari:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Akademik İngilizce Uygulamaları\main.py from lines 169 to 190 File Path: `file:///c:/Users/"
* 📐 **Mimari:** "scractch gibi boş klasörler varsa onları da sil"
* 📐 **Mimari:** "bu tarzda boş dosya veya klasör var mı işe yaramayan"

### 🎨 Arayüz ve Kullanıcı Deneyimi Tercihleri:
* 🖌️ **Arayüz:** "sağlık ve sosyaldeki tüm kelimelerin içerisini boş yap verilerini sil sadece fen kalmalıdır"
* 🖌️ **Arayüz:** "day1 day2 falan koymana da gerek yok tüm jsonları klasör yapısını falan sil sağlık ve sosyalde"
* 🖌️ **Arayüz:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Akademik İngilizce Uygulamaları\Dataset\yokdil\fen\kelime_kampi\day_1.json from lines 24 to"
* 🖌️ **Arayüz:** "bu sağ paneldeki şeyler ne bu neden gözüküyor burada"
* 🖌️ **Arayüz:** "ŞUAN TÜM DOSYALAR ÇALIŞIR HALDE Mİ, BOŞTA BİR SİSTEM VAR MI BUGA GİRMESİNİ SAĞLAYABİLCEK"
* 🖌️ **Arayüz:** "sonraki kampa geç dedikten sonra sağda şöyle bir ekran açılıyor onu istemiyorum onu kaldır. Kodu düzelt test etmene gerek yok"
* 🖌️ **Arayüz:** "En son bir test ettiğimde şöyle çok kapsamlı hata raporu çıkartmıştım bunlardan bazılarını düzelttik ama hala düzelmeyenler var. Neler çalışıyor neler çalışmıyorsa eş zamanlı kontr"
* 🖌️ **Arayüz:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Akademik İngilizce Uygulamaları\Web Gui\src\App.jsx from lines 2123 to 2158 File Path: `fil"

---

## 📌 Proje: Disk Kurtarma
* **Toplam Sohbet:** 11 | **Toplam Mesaj:** 2597

### 🎯 Kullanıcının Müdahale ve Düzeltme Kuralları (Ne İstedi / Neyi Reddetti):
* ❌ **Düzeltme:** "100kb dan daha az dosyalar eklenmesin burada oyun logoları falan olabilir o yüzden gereksiz."
* ❌ **Düzeltme:** "Projeyi başka dosyada düzeltmişsin ven başka dosyayı istemiyorum Veri Kurtarma klasöründe çalışıyoruz"
* ❌ **Düzeltme:** "hepsini düzelt"
* ❌ **Düzeltme:** "Butonların boyutları tam sığmıyor ana ekranın boyutlarını optimize edip düzelt"
* ❌ **Düzeltme:** "biz neyi düzeltmeliyiz şuan"
* ❌ **Düzeltme:** "devam etmesine rağmen hala aşağıda tarama hızı falan gözükmüyor onu düzeltmelisin. Tüm kodları teker teker incele ve mantıksal hataları tespit ederek bir rapor hazırla ve raporu .m"
* ❌ **Düzeltme:** "burada değiştirme tarihini, dosyaların orijinalde hangi klasörde bulunduklarını falan bulabilmemiz mümkün mü, eğer mümkünse bunları da çek örneğin ben-good gibi bir klasör adı var "
* ❌ **Düzeltme:** "resim jpg olarak yapmana gerek yok çünkü önceki klasör yapımda hem görsel hem resim 1 klasörde bulunabiliyordu senin öncelikli amacın böyle yapmak"
* ❌ **Düzeltme:** "1-böyle hata aldım bunu düzelt.  2-Video dışarı aktarılmamış yedek alırken bunu güncelle.  3- Videoyu uygulama içi çalıştırmaya başladım tkinterla ilgili hata verdi bunu düzelt."
* ❌ **Düzeltme:** "burada örneğin önceden taramasını istediğim fakat şuan taramasını istemekten vazgeçtiğim şeyler olabilir onları kaldırabilmeliyim veya mevcut sistem üzerine yeni barlar da ekleyebi"
* ❌ **Düzeltme:** "sağ panel böyle olmasın bunun yerine emoji yerine önizleme ekranı olsun ve direkt buradan başlatıp durdurabilelim yeni bir pencereye gerek duymadan"
* ❌ **Düzeltme:** "klasör yapılarını kontrol et gereksizler varsa sil kullanılmayanlar. Klasörleri birleştir mantık çerçevesinde yazılıma uygun şekilde"

### 🏗️ Mimari ve Klasör Kararları:
* 📐 **Mimari:** "Projeyi başka dosyada düzeltmişsin ven başka dosyayı istemiyorum Veri Kurtarma klasöründe çalışıyoruz"
* 📐 **Mimari:** "klasör yapısını başından sonuna kadar incele ve dosyalara bak, buga neden olabilecek bir şey var mı veya geliştirilmesi gereken bir şey var mı değerlendir ve bir ana klasöre .md aç"
* 📐 **Mimari:** "benim istediğim şey kullanıcı diskini 100e bölsün ve 100e bölümden istediği kısmı o an aratarak dosyalarını kurtarabilsin. çok düşük kblara gerek yok çünkü onlar çöp içerikler olab"
* 📐 **Mimari:** "The USER performed the following action: Command: & C:/Python313/python.exe "c:/Users/User/Desktop/Disk Kurtarma/main.py" CWD: c:\Users\User\Desktop\Disk Kurtarma  				The command "
* 📐 **Mimari:** "The USER performed the following action: Command: & C:/Python313/python.exe "c:/Users/User/Desktop/Disk Kurtarma/main.py" CWD: c:\Users\User\Desktop\Disk Kurtarma  				The command "
* 📐 **Mimari:** "sanal taramayı başlat değil de klasör yapısını tara olarak yeni bir buton olarak adlandırsak daha iyi olmaz mı"
* 📐 **Mimari:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Disk Kurtarma\main.py from lines 1 to 37 File Path: `file:///c:/Users/User/Desktop/Disk%20K"
* 📐 **Mimari:** "The USER performed the following action: Command: & C:/Python313/python.exe "c:/Users/User/Desktop/Disk Kurtarma/main.py" CWD: c:\Users\User\Desktop\Disk Kurtarma  				The command "

### 🎨 Arayüz ve Kullanıcı Deneyimi Tercihleri:
* 🖌️ **Arayüz:** "sanal taramayı başlat değil de klasör yapısını tara olarak yeni bir buton olarak adlandırsak daha iyi olmaz mı"
* 🖌️ **Arayüz:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Disk Kurtarma\main.py from lines 1 to 37 File Path: `file:///c:/Users/User/Desktop/Disk%20K"
* 🖌️ **Arayüz:** "Butonların boyutları tam sığmıyor ana ekranın boyutlarını optimize edip düzelt"
* 🖌️ **Arayüz:** "butonlar güzel evet ama klasör yapısını düzenle diyince yeni bir ekran gelsin ve yüzde kaç tarandığı gösterilsin"
* 🖌️ **Arayüz:** "bu klasör yapısını ve dosyaları tara diyince yeni bir panel açılsın bir pencere gibi ve orada taramayı başlat yapılsın. Çalıştığını görmek için bir sayaç ekle, toplam disk boyutu v"
* 🖌️ **Arayüz:** "The USER performed the following action: Show the contents of file c:\Users\User\Desktop\Disk Kurtarma\main.py from lines 1 to 23 File Path: `file:///c:/Users/User/Desktop/Disk%20K"
* 🖌️ **Arayüz:** "bar seçiminde bir sorun olması halinde bazı barların ilerleyişini sıfırlayabilelim sıfırmış gibi gösterebilelim veya fullemiş gösterelim. Sistemde ona göre ilerlesin fakat aynı içe"
* 🖌️ **Arayüz:** "videolarda videonun süresini de göster, videonun görselini de ekle ne ile ilgili olduğunu anlayabilelim ve başlatma butonunu videonun ortasına da koy videoya basınca başlasın, bi d"

---

