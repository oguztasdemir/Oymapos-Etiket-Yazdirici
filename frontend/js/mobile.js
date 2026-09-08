// ==========================================================================
// MOBİL BARKOD VE ETİKET TERMİNALİ MOTORU
// Standart: taslak/04_ARAYUZ_TASARIM_VE_FRONTEND_STANDARTLARI
// ==========================================================================

let html5QrCode = null;
let currentProduct = null;
let scanCooldown = false;
let scanHistory = JSON.parse(localStorage.getItem('mobile_scan_history') || '[]');

class SoundFeedback {
  static playSuccess() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

function showMobileToast(msg, isSuccess = true) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.borderColor = isSuccess ? '#10b981' : '#f43f5e';
  t.style.background = isSuccess ? '#06281e' : '#28060f';
  t.textContent = (isSuccess ? '✅ ' : '❌ ') + msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  initCameraScanner();
  renderHistory();
  const autoSwitch = document.getElementById('autoPrintSwitch');
  if (autoSwitch) {
    autoSwitch.checked = localStorage.getItem('auto_print') !== 'false';
    autoSwitch.addEventListener('change', () => {
      localStorage.setItem('auto_print', autoSwitch.checked);
    });
  }
});

function initCameraScanner() {
  const qrReader = document.getElementById('reader');
  if (!qrReader) return;

  html5QrCode = new Html5Qrcode("reader");
  const config = {
    fps: 15,
    qrbox: { width: 260, height: 160 },
    aspectRatio: 1.333
  };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    console.warn("Kamera başlatılamadı:", err);
  });
}

function onScanSuccess(decodedText) {
  if (scanCooldown) return;
  const barcode = decodedText.trim();
  if (!barcode) return;

  scanCooldown = true;
  processBarcode(barcode);
  setTimeout(() => { scanCooldown = false; }, 1800);
}

function onScanFailure(error) {
  // Canlı arama sırasında sessizce devam et
}

function handleManualSearch(e) {
  e.preventDefault();
  const input = document.getElementById('manualBarcodeInput');
  const b = input.value.trim();
  if (b) {
    processBarcode(b);
    input.value = '';
  }
}

async function processBarcode(barcode) {
  const autoPrint = document.getElementById('autoPrintSwitch').checked;

  try {
    const res = await fetch('/api/print/mobile_scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: barcode, auto_print: autoPrint, copies: 1 })
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      SoundFeedback.playSuccess();
      currentProduct = data.product;
      displayProduct(data.product, data.print_status);
      addToHistory(data.product);
      showMobileToast(autoPrint ? `${data.product.title} yazıcıya basıldı!` : 'Ürün bulundu.');
    } else {
      showMobileToast(data.detail || 'Ürün bulunamadı!', false);
    }
  } catch (err) {
    showMobileToast('Bağlantı hatası: ' + err.message, false);
  }
}

function displayProduct(p, printStatus) {
  document.getElementById('prodBrand').textContent = p.brand || 'ÜRÜN';
  document.getElementById('prodTitle').textContent = p.title;
  document.getElementById('prodPrice').textContent = `₺ ${Number(p.price).toFixed(2)}`;
  document.getElementById('prodBarcode').textContent = p.barcode;

  const badge = document.getElementById('printBadge');
  const msg = document.getElementById('printStatusMsg');
  if (printStatus && printStatus.printed) {
    badge.style.display = 'flex';
    badge.style.background = 'rgba(16, 185, 129, 0.15)';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    badge.style.color = '#34d399';
    msg.textContent = 'Ana PC Yazıcısına Gönderildi!';
  } else {
    badge.style.display = 'flex';
    badge.style.background = 'rgba(255, 255, 255, 0.05)';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    badge.style.color = '#94a3b8';
    msg.textContent = 'Fiyat Görüntülendi';
  }

  document.getElementById('productCard').style.display = 'block';
}

async function reprintCurrent() {
  if (!currentProduct) return;
  try {
    const res = await fetch('/api/print/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: currentProduct.barcode, copies: 1 })
    });
    const data = await res.json();
    if (data.status === 'success') {
      showMobileToast('1 Adet Daha Basıldı!', true);
    } else {
      showMobileToast('Hata: ' + data.message, false);
    }
  } catch (err) {
    showMobileToast('Yazıcı hatası: ' + err.message, false);
  }
}

function clearCurrentProduct() {
  document.getElementById('productCard').style.display = 'none';
  currentProduct = null;
}

function addToHistory(p) {
  scanHistory = scanHistory.filter(item => item.barcode !== p.barcode);
  scanHistory.unshift({
    barcode: p.barcode,
    title: p.title,
    price: p.price,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  });
  if (scanHistory.length > 15) scanHistory.pop();
  localStorage.setItem('mobile_scan_history', JSON.stringify(scanHistory));
  renderHistory();
}

function renderHistory() {
  const card = document.getElementById('historyCard');
  const list = document.getElementById('historyList');
  if (!card || !list) return;

  if (scanHistory.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  list.innerHTML = '';
  scanHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div>
        <strong style="color:#ffffff; font-size:13px;">${item.title}</strong>
        <div style="color:var(--text-muted); font-size:11px;">${item.barcode} • ${item.time}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:800; color:#34d399;">₺ ${Number(item.price).toFixed(2)}</span>
        <button onclick="processBarcode('${item.barcode}')" style="background:#6366f1; color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">Bas</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function clearHistory() {
  scanHistory = [];
  localStorage.removeItem('mobile_scan_history');
  renderHistory();
}
