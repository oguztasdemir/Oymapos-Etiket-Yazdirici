# 📸 03. Hata Anında Otomatik Ekran Görüntüsü ve HTML Dump

Bot çalışırken bir buton bulunamazsa veya sayfa beklenmeyen bir duruma düşerse:
1. `logs/screenshots/error_YYYYMMDD_HHMMSS.png` adıyla tam sayfa ekran görüntüsü alınır.
2. `logs/pages/error_page.html` adıyla kaynak HTML kaydedilir.
3. Böylece kullanıcının *"Neden tıklayamadın?"* diye sormasına gerek kalmadan kanıt sunulur.
