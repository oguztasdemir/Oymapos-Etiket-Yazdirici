# 🌐 02. Selenium ve Undetected-ChromeDriver Standartları

Selenium projelerinde bot algılamasını önleyen `undetected_chromedriver` kullanılır.

---

## 🚫 Sabit `time.sleep()` Yasağı:
* `time.sleep(5)` gibi ezbere beklemeler kesinlikle yasaktır; sayfa yavaş yüklenirse patlar, hızlı yüklenirse zaman kaybettirir.
* Her zaman dinamik `WebDriverWait(driver, 15).until(EC.presence_of_element_located(...))` kullanılır.
