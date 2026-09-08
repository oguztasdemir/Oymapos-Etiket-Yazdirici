# 🎨 09. Mikro-UX, Duyusal Geri Bildirim ve İskelet Yükleme (Sensory Polish)

> **TEMEL KURAL:** Bir yazılımın profesyonel hissettirmesi yalnızca statik renklerle değil; kullanıcının eylemlerine verdiği **akıcı, dokunsal ve duyusal tepkilerle** sağlanır. Bu mekanikler yapay zeka klişesi içermeyen, birinci sınıf stüdyo dokunuşlarıdır.

---

## 🌊 1. İskelet Yükleme Ekranları (Skeleton Loading)

Dönen anlamsız spinner'lar yerine içeriğin geleceği alanı simüle eden zarif gri dalgalanma efekti kullanılır.

### CSS Standartı:
```css
.skeleton {
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.03) 25%,
        rgba(255, 255, 255, 0.08) 37%,
        rgba(255, 255, 255, 0.03) 63%
    );
    background-size: 400% 100%;
    animation: skeleton-pulse 1.4s ease infinite;
    border-radius: var(--radius-sm, 6px);
}

@keyframes skeleton-pulse {
    0% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
}

.skeleton-text { height: 16px; margin-bottom: 8px; width: 80%; }
.skeleton-title { height: 24px; margin-bottom: 12px; width: 50%; }
.skeleton-card { height: 120px; width: 100%; }
```

---

## 🔢 2. Canlı Sayı Yükselişi (Count-Up Number Animations)

Dashboard'lardaki istatistik sayaçlarında (Toplam Satış, Taranan PDF, Aktif Görev vb.) sayıların sıfırdan hedefe akıcı şekilde tırmanması:

```javascript
function animateCount(element, target, duration = 800) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(easeProgress * (target - start) + start);
        
        element.textContent = current.toLocaleString('tr-TR');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString('tr-TR');
        }
    }
    
    requestAnimationFrame(update);
}
```

---

## 🔔 3. Web Audio API ile Narin & Zarif Sesli Bildirim

Harici `.mp3` dosyalarına bağımlı kalmadan, tarayıcının yerel Web Audio API'si ile işlem bittiğinde çıkan çok hafif, lüks ve rahatsız etmeyen "pürüzsüz onay tonu":

```javascript
class SoundFeedback {
    static playSuccess() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
            
            gain.gain.setValueAtTime(0.04, ctx.currentTime); // Çok hafif ses düzeyi
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch (e) {
            // Tarayıcı izin vermezse sessizce geç
        }
    }
}
```

---

## 📋 4. Panoya Kopyalama Mikro Geri Bildirimi

Bir metin veya kod kopyalandığında butondaki simgenin 1.5 saniye zarif bir yeşil onay rozetine dönüşmesi:

```javascript
function copyToClipboardWithFeedback(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = `
            <span style="color: var(--accent-success, #10b981); display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Kopyalandı!
            </span>
        `;
        buttonElement.disabled = true;
        SoundFeedback.playSuccess();
        
        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
            buttonElement.disabled = false;
        }, 1600);
    });
}
```
