# 🐙 05. GitHub Güvenliği, `.env` ve `.gitignore` Standartları

Hassas API anahtarlarının, SQLite veritabanlarının ve geçici dosyaların GitHub'a sızmasını önleme kuralları.

---

## 🔒 Standart `.gitignore` Şablonu

```gitignore
# Ortam değişkenleri ve sırlar
.env
.env.local

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/

# Veri ve Veritabanı
data/database.sqlite
data/uploads/*
!data/uploads/.gitkeep
data/vector_store/

# Loglar ve Ekran Görüntüleri
logs/
*.log
backup/

# Build ve EXE çıktıları
dist/
build/
*.spec
```
