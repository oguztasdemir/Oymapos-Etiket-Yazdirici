# 🎨 02. Anti-AI Renk Paletleri ve Modern Cam Efekti (Glassmorphism)

Tüm projelerde jenerik AI mor-cyan renkleri yerine projenin ruhuna ve alanına özel **rafine renk paletleri** kullanılır.

---

## 🏛️ 1. Alana Özgü Rafine Palet Seçenekleri

### A. Obsidian Slate (SaaS, Mühendislik & Verimlilik Araçları)
```css
:root {
    --bg-main: #090a0f;         /* Derin Gece Zemin */
    --bg-surface: #11141d;      /* Yan Menü & Üst Bar */
    --bg-card: #171b26;         /* Kartlar & İçerik Blokları */
    --bg-hover: #222838;        /* Hover Durumu */
    
    --border-color: rgba(255, 255, 255, 0.08); /* Rafine İnce Çizgi */
    --border-focus: #6366f1;    /* İndigo Odak Vurgusu */
    
    --text-primary: #f8fafc;    /* Pürüzsüz Beyaz */
    --text-secondary: #94a3b8;  /* Yumuşak Arduvaz */
    --text-muted: #64748b;      /* Silik Açıklamalar */
    
    --accent: #6366f1;          /* İndigo Birincil Buton */
    --accent-hover: #4f46e5;
    --accent-success: #10b981;  /* Zümrüt Onay */
    --accent-danger: #f43f5e;   /* Gül Kırmızısı Hata */
    --accent-warning: #f59e0b;  /* Sıcak Amber */
}
```

### B. Emerald Atelier (Finans, Borsa, Analitik & Dashboard)
```css
:root {
    --bg-main: #06100c;         /* Koyu Orman / Gece */
    --bg-surface: #0a1813;      /* Derin Zümrüt Yüzey */
    --bg-card: #0f241d;         /* Zümrüt Kartlar */
    --bg-hover: #163329;
    
    --border-color: rgba(16, 185, 129, 0.15);
    --border-focus: #10b981;
    
    --text-primary: #f0fdf4;
    --text-secondary: #a7f3d0;
    --text-muted: #4ade80;
    
    --accent: #10b981;          /* Canlı Zümrüt */
    --accent-hover: #059669;
    --accent-gold: #fbbf24;     /* Lüks Altın Detaylar */
}
```

### C. Warm Craft (Not Alma, Blog, CMS & Yazarlık Sistemleri)
```css
:root {
    --bg-main: #131211;         /* Sıcak Kömür */
    --bg-surface: #1c1a18;      /* Sıcak Taş Yüzey */
    --bg-card: #252220;         /* Sıcak Ahşap/Taş Kart */
    --bg-hover: #332f2c;
    
    --border-color: rgba(255, 255, 255, 0.07);
    --border-focus: #f59e0b;
    
    --text-primary: #fef3c7;    /* Sıcak Krem Metin */
    --text-secondary: #d4d4d8;
    --text-muted: #78716c;
    
    --accent: #f59e0b;          /* Sıcak Amber/Bal */
    --accent-hover: #d97706;
}
```

---

## 🪟 2. Rafine Cam & Derinlik Efekti (Bespoke Glassmorphism)

Aşırı parlayan neon yerine şık, mat ve profesyonel cam efekti:

```css
.glass-panel {
    background: rgba(17, 20, 29, 0.75);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```
