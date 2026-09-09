// ==========================================================================
// UI MOTORU VE ETKİLEŞİMLER - ui.js
// ==========================================================================

// Global HTML Escape Güvenlik Yardımcısı
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 1. SESLİ GERİ BİLDİRİM (Web Audio API)
class SoundFeedback {
  static playSuccess() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Tarayıcı izin vermezse sessizce geç
    }
  }

  static playWarning() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }
}

// 2. TOAST BİLDİRİM SİSTEMİ
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  if (type === 'success') {
    SoundFeedback.playSuccess();
  } else if (type === 'error') {
    SoundFeedback.playWarning();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// 3. SAYI SAYACI ANİMASYONU (Count-Up)
function animateCount(element, target, duration = 600) {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
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

// 4. MODAL YÖNETİCİSİ
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// 5. SUNUCU KAPATMA DİYALOĞU
async function confirmShutdown() {
  if (confirm("Sunucuyu kapatmak ve portu serbest bırakmak istediğinize emin misiniz?")) {
    showToast("Sunucu kapatılıyor...", "info");
    try {
      await API.shutdownServer();
      setTimeout(() => {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#090a0f;color:#fff;font-family:sans-serif;">
            <div style="font-size:48px;margin-bottom:16px;">🛑</div>
            <h2>Sunucu Başarıyla Kapatıldı</h2>
            <p style="color:#94a3b8;margin-top:8px;">Terminal ve port serbest bırakıldı. Bu sekmeyi kapatabilirsiniz.</p>
          </div>
        `;
      }, 600);
    } catch (e) {
      showToast("Kapatma isteği gönderildi.", "info");
    }
  }
}
