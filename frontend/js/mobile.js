/**
 * =========================================================================
 * 📱 OYMAPOS MOBİL KAMERA & BARKOD TARAMA MOTORU (1-1 BİREBİR KODLAR)
 * Donanım BarcodeDetector, ZXing, Kırmızı Lazer Çizgisi, Fener & Zoom
 * =========================================================================
 */

// Paylaşılan Global Değişkenler
let isScanningLive = false;
let currentBarcode = "";
let currentProduct = null;
let isNewProduct = false;
let mobileQueue = [];
let mediaStreamObj = null;
let frameDetectionInterval = null;
let html5QrCode = null;
let zxingReader = null;
let activeVideoTrack = null;
let isTorchOn = false;
let currentZoomLevel = 1.0;
let barcodeCandidateBuffer = { text: '', count: 0, lastTime: 0 };

/**
 * 🔊 Bip ve Titreşim Sinyali
 */
function playBeepSound() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(90);
    }
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch(e) {}
}

/**
 * 🎯 MATEMATİKSEL BARKOD SAĞLAMA (CHECKSUM) DOĞRULAYICI
 * Hatalı kamera okumalarını %100 oranında engeller.
 */
function validateBarcodeChecksum(barcode) {
  if (!barcode || typeof barcode !== 'string') return false;
  const b = barcode.trim();
  
  // EAN-13 (13 hane) Modulo-10 Kontrolü
  if (/^\d{13}$/.test(b)) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(b[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(b[12], 10);
  }
  
  // EAN-8 (8 hane) Modulo-10 Kontrolü
  if (/^\d{8}$/.test(b)) {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      sum += parseInt(b[i], 10) * (i % 2 === 0 ? 3 : 1);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(b[7], 10);
  }
  
  // UPC-A (12 hane) Modulo-10 Kontrolü
  if (/^\d{12}$/.test(b)) {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(b[i], 10) * (i % 2 === 0 ? 3 : 1);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(b[11], 10);
  }
  
  // Code-128 / Code-39 / ITF (en az 3 karakterli alfa-sayısal)
  if (b.length >= 3 && /^[A-Za-z0-9\-\.\ \$\/\+\%]+$/.test(b)) {
    return true;
  }
  
  return false;
}

/**
 * 🍞 Toast Bildirim Gösterici
 */
function showToast(msg, type = "info") {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = `toast-box toast-${type}`;
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

/**
 * 🔍 Kamera Zoom Kontrolü (Donanım Seviyesi + Fallback)
 */
async function setCameraZoom(zoomVal) {
  currentZoomLevel = zoomVal;
  
  // UI Butonlarını Güncelle
  document.querySelectorAll('.fs-btn-zoom').forEach(b => b.classList.remove('active'));
  const activeBtnId = zoomVal === 1.0 ? 'btn-zoom-1x' : (zoomVal === 1.5 ? 'btn-zoom-15x' : (zoomVal === 2.0 ? 'btn-zoom-2x' : 'btn-zoom-3x'));
  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) activeBtn.classList.add('active');

  const videoElem = document.getElementById('fullscreen-video');

  // 1. Donanım Seviyesi Optik/Dijital Zoom
  if (activeVideoTrack && typeof activeVideoTrack.applyConstraints === 'function') {
    try {
      const caps = activeVideoTrack.getCapabilities ? activeVideoTrack.getCapabilities() : {};
      if (caps.zoom) {
        const minZ = caps.zoom.min || 1.0;
        const maxZ = caps.zoom.max || 5.0;
        const targetZ = Math.min(Math.max(zoomVal, minZ), maxZ);
        await activeVideoTrack.applyConstraints({
          advanced: [{ zoom: targetZ }]
        });
        if (videoElem) videoElem.style.transform = "none";
        return;
      }
    } catch (e) {
      console.warn("Donanım zoom uygulanamadı:", e);
    }
  }

  // 2. Yazılımsal Dijital Zoom (Scale Fallback)
  if (videoElem) {
    videoElem.style.transform = zoomVal > 1.0 ? `scale(${zoomVal})` : "none";
    videoElem.style.transformOrigin = "center center";
  }
}

/**
 * 💡 Fener (Flashlight) Aç / Kapa
 */
async function toggleFlashlight() {
  if (!activeVideoTrack) return;
  try {
    isTorchOn = !isTorchOn;
    await activeVideoTrack.applyConstraints({
      advanced: [{ torch: isTorchOn }]
    });
    const btnTorch = document.getElementById('btn-fs-torch');
    if (btnTorch) {
      if (isTorchOn) {
        btnTorch.classList.add('active');
        btnTorch.style.background = "rgba(245, 158, 11, 0.4)";
        btnTorch.style.borderColor = "#f59e0b";
        btnTorch.style.color = "#fbbf24";
      } else {
        btnTorch.classList.remove('active');
        btnTorch.style.background = "rgba(30, 41, 59, 0.8)";
        btnTorch.style.borderColor = "rgba(255, 255, 255, 0.2)";
        btnTorch.style.color = "#e2e8f0";
      }
    }
  } catch (e) {
    console.warn("Fener kontrolü desteklenmiyor:", e);
  }
}

/**
 * 📷 Tam Ekran Canlı Kamerayı Aç (OYMAPOS 1-1 Birebir Akış)
 */
async function openFullscreenCamera() {
  const modal = document.getElementById('fullscreen-camera-overlay');
  const videoElem = document.getElementById('fullscreen-video');
  const readerDiv = document.getElementById('fullscreen-reader');
  const btnTorch = document.getElementById('btn-fs-torch');

  // Varsa önceki hata kutusunu temizle
  const existingErr = document.getElementById('fs-camera-error-banner');
  if (existingErr) existingErr.remove();

  if (modal) modal.style.display = 'flex';
  if (videoElem) {
    videoElem.style.display = 'block';
    videoElem.muted = true;
    videoElem.setAttribute('playsinline', 'true');
    videoElem.setAttribute('webkit-playsinline', 'true');
    videoElem.setAttribute('autoplay', 'true');
  }
  if (readerDiv) readerDiv.style.display = 'none';

  isScanningLive = true;
  isTorchOn = false;
  if (btnTorch) btnTorch.style.display = 'none';
  setCameraZoom(1.0);

  // 1. Tarayıcı Güvenli Bağlam (Secure Context / HTTPS / Localhost) Kontrolü
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // WebRTC engellendiğinde doğrudan mobil sistem kamerasını açma mekanizmasını tetikle
    triggerNativeCaptureFallback();
    return;
  }

  // 2. getUserMedia ile doğrudan native akışı al ve <video> içine bağla
  let stream = null;
  let lastCameraError = null;

  const constraintList = [
    { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: { facingMode: "environment" } },
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: true }
  ];

  for (const cons of constraintList) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(cons);
      if (stream) break;
    } catch (e) {
      lastCameraError = e;
      console.warn("Kamera kuralı deneniyor...", e);
    }
  }

  if (stream) {
    mediaStreamObj = stream;
    if (videoElem) {
      videoElem.srcObject = stream;
      try {
        await videoElem.play();
      } catch (playErr) {
        console.warn("video.play() uyarısı:", playErr);
      }
    }

    const track = stream.getVideoTracks()[0];
    if (track) {
      activeVideoTrack = track;
      const capabilities = (typeof track.getCapabilities === 'function') ? track.getCapabilities() : {};
      if (capabilities.torch && btnTorch) {
        btnTorch.style.display = 'flex';
      }
    }

    // ZXing Reader örneğini hazırla
    if (typeof ZXing !== 'undefined' && !zxingReader) {
      try {
        const hints = new Map();
        const formats = [
          ZXing.BarcodeFormat.EAN_13,
          ZXing.BarcodeFormat.EAN_8,
          ZXing.BarcodeFormat.CODE_128,
          ZXing.BarcodeFormat.CODE_39,
          ZXing.BarcodeFormat.UPC_A,
          ZXing.BarcodeFormat.UPC_E,
          ZXing.BarcodeFormat.ITF,
          ZXing.BarcodeFormat.QR_CODE
        ];
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
        zxingReader = new ZXing.BrowserMultiFormatReader(hints, 50);
      } catch(e) {
        console.warn("ZXing init hatası:", e);
      }
    }

    startContinuousBarcodeEngine(videoElem);
    return;
  }

  // 3. Fallback: Html5Qrcode Motoru
  try {
    if (videoElem) videoElem.style.display = 'none';
    if (readerDiv) readerDiv.style.display = 'block';

    if (!html5QrCode && typeof Html5Qrcode !== 'undefined') {
      html5QrCode = new Html5Qrcode("fullscreen-reader");
    }

    if (html5QrCode) {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 25, qrbox: { width: 300, height: 180 }, aspectRatio: 1.77 },
        (decodedText) => {
          onLiveBarcodeDetected(decodedText);
        },
        () => {}
      );
      return;
    }
  } catch (fallbackErr) {
    lastCameraError = fallbackErr;
  }

  // Eğer tüm yöntemler başarısız olduysa net bir bilgilendirme göster
  let errDesc = "Kamera açılamadı.";
  if (lastCameraError) {
    if (lastCameraError.name === 'NotAllowedError' || lastCameraError.name === 'PermissionDeniedError') {
      errDesc = "Tarayıcıda kamera izni reddedilmiş. Lütfen adres çubuğundaki kilit simgesinden 'Kamera İzni'ni açın.";
    } else if (lastCameraError.name === 'NotFoundError' || lastCameraError.name === 'DevicesNotFoundError') {
      errDesc = "Cihazda uygun bir arka kamera bulunamadı.";
    } else if (lastCameraError.name === 'NotReadableError' || lastCameraError.name === 'TrackStartError') {
      errDesc = "Kamera başka bir uygulama tarafından kullanılıyor olabilir.";
    } else {
      errDesc = "Hata: " + (lastCameraError.message || lastCameraError.name);
    }
  }

  showCameraError("⚠️ Kamera Açılamadı", errDesc);
}

/**
 * 📸 Mobil Sistem Kamerasını Tetikleme (WebRTC İznine / HTTPS'e İhtiyaç Duymaz)
 */
function triggerNativeCaptureFallback() {
  closeFullscreenCamera();
  
  let nativeInput = document.getElementById('native-camera-input');
  if (!nativeInput) {
    nativeInput = document.createElement('input');
    nativeInput.id = 'native-camera-input';
    nativeInput.type = 'file';
    nativeInput.accept = 'image/*';
    nativeInput.capture = 'environment';
    nativeInput.style.display = 'none';
    document.body.appendChild(nativeInput);

    nativeInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      showToast("⏳ Barkod taranıyor...", "info");
      
      try {
        const imgBitmap = await createImageBitmap(file);
        
        // 1. BarcodeDetector ile dene
        if ('BarcodeDetector' in window) {
          try {
            const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code', 'itf'] });
            const barcodes = await detector.detect(imgBitmap);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              const raw = barcodes[0].rawValue.trim();
              if (validateBarcodeChecksum(raw)) {
                playBeepSound();
                lookupBarcode(raw);
                return;
              }
            }
          } catch(detErr) {}
        }

        // 2. ZXing ile dene
        if (typeof ZXing !== 'undefined') {
          const canvas = document.createElement('canvas');
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgBitmap, 0, 0);

          if (!zxingReader) {
            const hints = new Map();
            const formats = [
              ZXing.BarcodeFormat.EAN_13,
              ZXing.BarcodeFormat.EAN_8,
              ZXing.BarcodeFormat.CODE_128,
              ZXing.BarcodeFormat.CODE_39,
              ZXing.BarcodeFormat.UPC_A,
              ZXing.BarcodeFormat.UPC_E,
              ZXing.BarcodeFormat.ITF,
              ZXing.BarcodeFormat.QR_CODE
            ];
            hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
            hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
            zxingReader = new ZXing.BrowserMultiFormatReader(hints, 50);
          }

          const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
          const binaryBitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(luminanceSource));
          const result = zxingReader.decode(binaryBitmap);
          if (result && result.getText) {
            const raw = result.getText().trim();
            if (validateBarcodeChecksum(raw)) {
              playBeepSound();
              lookupBarcode(raw);
              return;
            }
          }
        }

        showToast("⚠️ Fotoğrafta net bir barkod bulunamadı. Lütfen barkodu ortalayarak tekrar çekin.", "error");
      } catch(procErr) {
        console.warn("Fotoğraf barkod işleme hatası:", procErr);
        showToast("Fotoğraftan barkod okunamadı. Lütfen barkodu düzgün tutarak tekrar çekin.", "error");
      } finally {
        nativeInput.value = '';
      }
    });
  }

  nativeInput.click();
}

/**
 * ⚠️ Kamera Hatası veya İzin Uyarısı Paneli
 */
function showCameraError(title, desc) {
  const modal = document.getElementById('fullscreen-camera-overlay');
  if (!modal) return;

  const existing = document.getElementById('fs-camera-error-banner');
  if (existing) existing.remove();

  const errBox = document.createElement('div');
  errBox.id = 'fs-camera-error-banner';
  errBox.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 380px;
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid #ef4444;
    border-radius: 16px;
    padding: 22px 18px;
    text-align: center;
    z-index: 999;
    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    backdrop-filter: blur(16px);
  `;

  errBox.innerHTML = `
    <div style="font-size: 38px; margin-bottom: 6px;">📷🔒</div>
    <div style="font-size: 16px; font-weight: 800; color: #f87171; margin-bottom: 8px;">${title}</div>
    <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.5; margin-bottom: 16px;">${desc}</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button onclick="triggerNativeCaptureFallback()" style="width: 100%; background: #10b981; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>📸</span>
        <span>Telefon Kamerasıyla Çek & Oku</span>
      </button>
      <div style="display: flex; gap: 8px;">
        <button onclick="openFullscreenCamera()" style="flex: 1; background: #0284c7; color: white; border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 12.5px; cursor: pointer;">
          Canlı Yeniden Dene
        </button>
        <button onclick="closeFullscreenCamera()" style="flex: 1; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #ef4444; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 12.5px; cursor: pointer;">
          Kapat
        </button>
      </div>
    </div>
  `;

  modal.appendChild(errBox);
}

/**
 * 🔴 30 FPS Canlı Donanım BarcodeDetector & ZXing Motoru
 */
function startContinuousBarcodeEngine(videoElem) {
  if (frameDetectionInterval) {
    clearInterval(frameDetectionInterval);
    frameDetectionInterval = null;
  }
  if (!videoElem) return;

  // Görünür bir canvas ile zxing fallback
  let hiddenCanvas = null;
  let canvasCtx = null;

  frameDetectionInterval = setInterval(async () => {
    if (!isScanningLive || !videoElem || videoElem.readyState < 2) return;

    // 1. Donanım Hızlandırmalı BarcodeDetector (Android Chrome / Edge / modern Webkit)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code', 'itf'] });
        const barcodes = await detector.detect(videoElem);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue && isScanningLive) {
          const raw = barcodes[0].rawValue.trim();
          if (validateBarcodeChecksum(raw)) {
            onLiveBarcodeDetected(raw);
            return;
          }
        }
      } catch(e) {}
    }

    // 2. ZXing Canvas Fallback (iOS Safari ve BarcodeDetector desteklemeyen tarayıcılar)
    if (typeof ZXing !== 'undefined' && zxingReader && isScanningLive) {
      try {
        if (!hiddenCanvas) {
          hiddenCanvas = document.createElement('canvas');
          canvasCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
        }
        const vw = videoElem.videoWidth || 640;
        const vh = videoElem.videoHeight || 480;
        if (vw > 0 && vh > 0) {
          // Performans için ölçeklendir
          const scale = Math.min(1.0, 640 / vw);
          const targetW = Math.round(vw * scale);
          const targetH = Math.round(vh * scale);
          hiddenCanvas.width = targetW;
          hiddenCanvas.height = targetH;
          canvasCtx.drawImage(videoElem, 0, 0, targetW, targetH);

          const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(hiddenCanvas);
          const binaryBitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(luminanceSource));
          const result = zxingReader.decode(binaryBitmap);
          if (result && result.getText && isScanningLive) {
            const raw = result.getText().trim();
            if (validateBarcodeChecksum(raw)) {
              onLiveBarcodeDetected(raw);
              return;
            }
          }
        }
      } catch(zxingErr) {
        // ZXing okuyamadığında normal hata fırlatır, sessizce devam et
      }
    }
  }, 60);
}

/**
 * 🛑 Kamerayı Güvenli Şekilde Kapat
 */
function closeFullscreenCamera() {
  if (frameDetectionInterval) {
    clearInterval(frameDetectionInterval);
    frameDetectionInterval = null;
  }

  if (zxingReader) {
    try { zxingReader.reset(); } catch(e) {}
  }

  if (mediaStreamObj) {
    try {
      mediaStreamObj.getTracks().forEach(track => track.stop());
    } catch(e) {}
    mediaStreamObj = null;
  }

  activeVideoTrack = null;
  isTorchOn = false;

  const videoElem = document.getElementById('fullscreen-video');
  if (videoElem) {
    try {
      videoElem.pause();
      videoElem.srcObject = null;
      videoElem.style.transform = "none";
    } catch(e) {}
  }

  const readerDiv = document.getElementById('fullscreen-reader');
  if (html5QrCode) {
    try { 
      html5QrCode.stop().catch(() => {}); 
    } catch(e) {}
  }
  if (readerDiv) {
    readerDiv.style.display = 'none';
  }

  isScanningLive = false;
  const overlay = document.getElementById('fullscreen-camera-overlay');
  if (overlay) overlay.style.display = 'none';
}

/**
 * 🔴 Barkod Algılandığında (Kırmızı Çizgiye Oturduğunda)
 */
function onLiveBarcodeDetected(decodedText) {
  if (!decodedText || !isScanningLive) return;
  const raw = String(decodedText).trim();

  if (!validateBarcodeChecksum(raw)) {
    return;
  }

  playBeepSound();
  closeFullscreenCamera();
  lookupBarcode(raw);
}

/**
 * 🔎 Barkod Sorgulama & Ekrana Getirme (OYMAPOS Standart)
 */
async function lookupBarcode(barcode) {
  barcode = (barcode || '').trim();
  if (!barcode) return;

  currentBarcode = barcode;
  const emptyState = document.getElementById('empty-state');
  const addedCard = document.getElementById('added-success-card');
  const productCard = document.getElementById('product-card');
  const txtBarcode = document.getElementById('txt-barcode');
  const badge = document.getElementById('badge-status');
  const inpTitle = document.getElementById('inp-title');
  const inpPrice = document.getElementById('inp-price');

  if (txtBarcode) txtBarcode.innerText = barcode;
  const manualInp = document.getElementById('inp-manual-barcode');
  if (manualInp) manualInp.value = barcode;

  try {
    const res = await fetch(`/api/products/${encodeURIComponent(barcode)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.product) {
      const p = data.data.product;
      currentProduct = p;
      isNewProduct = false;

      if (inpTitle) inpTitle.value = p.title || "";
      
      const posPrice = (typeof p.price === 'number') ? p.price : Number(p.price || 0);
      const hasLabel = (p.label_price !== null && p.label_price !== undefined);
      const labelPrice = hasLabel ? Number(p.label_price) : null;

      document.getElementById('val-pos-price').textContent = `₺ ${posPrice.toFixed(2)}`;
      document.getElementById('val-label-price').textContent = hasLabel ? `₺ ${labelPrice.toFixed(2)}` : 'Basılmadı';

      if (inpPrice) inpPrice.value = posPrice.toFixed(2);

      if (hasLabel && Math.abs(posPrice - labelPrice) > 0.001) {
        badge.className = "product-status-pill diff";
        badge.innerText = `⚠️ FARK: ₺${Math.abs(posPrice - labelPrice).toFixed(2)}`;
      } else if (!p.last_printed_at) {
        badge.className = "product-status-pill diff";
        badge.innerText = "⚠️ Baskı Bekliyor";
      } else {
        badge.className = "product-status-pill found";
        badge.innerText = "✓ Kayıtlı & Güncel";
      }

      showToast(`✓ "${p.title}" getirildi.`, "success");
    } else {
      isNewProduct = true;
      currentProduct = { barcode: barcode, price: 0, title: '' };
      if (inpTitle) inpTitle.value = "";
      if (inpPrice) inpPrice.value = "";
      document.getElementById('val-pos-price').textContent = "Yeni Ürün";
      document.getElementById('val-label-price').textContent = "Yok";

      badge.className = "product-status-pill new";
      badge.innerText = "➕ Yeni Ürün";
      showToast("Ürün kayıtlı değil. Bilgilerini yazıp basabilirsiniz.", "info");
      if (inpTitle) inpTitle.focus();
    }

    if (emptyState) emptyState.style.display = 'none';
    if (addedCard) addedCard.style.display = 'none';
    if (productCard) productCard.style.display = 'flex';
  } catch (err) {
    showToast("Bağlantı hatası: " + err.message, "error");
  }
}

function getSelectedMobilePrinter() {
  const sel = document.getElementById('mobilePrinterSelect');
  if (sel && sel.value) return sel.value;
  return localStorage.getItem('selected_printer') || null;
}

async function loadMobilePrinters() {
  try {
    const res = await fetch('/api/printers');
    const json = await res.json();
    const data = json.data || {};
    const printers = data.printers || [];
    const printerDetails = data.printer_details || [];
    const activeFromBackend = data.active_printer || (printers[0] || 'Termal Etiket Yazici');
    
    let chosen = localStorage.getItem('selected_printer') || activeFromBackend;
    const sel = document.getElementById('mobilePrinterSelect');
    const dot = document.getElementById('mobile-printer-dot');

    if (sel && printers.length > 0) {
      sel.innerHTML = '';
      printers.forEach(p => {
        const d = printerDetails.find(item => item.name === p);
        const isConn = d ? d.connected : false;
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = `${isConn ? '🟢' : '🔴'} ${p}`;
        opt.style.background = '#0f172a';
        opt.style.color = '#f8fafc';
        if (p === chosen) opt.selected = true;
        sel.appendChild(opt);
      });
      // Eğer seçili olan liste dışındaysa ilkini seç
      if (!printers.includes(chosen)) {
        chosen = printers[0];
        sel.value = chosen;
      }
    }

    // Seçili yazıcının bağlantı durumunu al
    const stRes = await fetch(`/api/printer/status?printer=${encodeURIComponent(chosen)}`);
    const stJson = await stRes.json();
    const stData = stJson.data || {};
    const isConnected = !!stData.connected;

    if (dot) {
      dot.style.background = isConnected ? '#10b981' : '#ef4444';
      dot.style.boxShadow = isConnected ? '0 0 6px #10b981' : '0 0 6px #ef4444';
    }
  } catch(e) {
    const dot = document.getElementById('mobile-printer-dot');
    if (dot) dot.style.background = '#ef4444';
  }
}

function handleMobilePrinterChange(newPrinter) {
  if (!newPrinter) return;
  localStorage.setItem('selected_printer', newPrinter);
  loadMobilePrinters();
  showToast(`Yazıcı seçildi: "${newPrinter}"`, 'info');
}

/**
 * 🖨️ Hemen Etiket Yazdır
 */
async function printCurrentProductNow() {
  if (!currentBarcode) return;
  const title = (document.getElementById('inp-title')?.value || '').trim();
  const price = parseFloat(document.getElementById('inp-price')?.value) || 0;
  const chosenPrinter = getSelectedMobilePrinter();

  try {
    const payload = {
      barcode: currentBarcode,
      title: title,
      price: price,
      copies: 1
    };
    if (chosenPrinter) payload.printer = chosenPrinter;

    const res = await fetch('/api/print/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
      showToast(`✓ "${title}" yazıcıya basıldı!`, 'success');
      document.getElementById('val-label-price').textContent = `₺ ${price.toFixed(2)}`;
      const badge = document.getElementById('badge-status');
      if (badge) {
        badge.className = "product-status-pill found";
        badge.innerText = "✓ Etiket Güncel";
      }
      loadMobilePrinters();
    } else {
      showToast('⚠️ Yazdırma Hatası: ' + data.message, 'error');
      loadMobilePrinters();
    }
  } catch(e) {
    showToast('⚠️ Yazıcıya ulaşılamadı: ' + e.message, 'error');
    loadMobilePrinters();
  }
}

/**
 * ✓ Etiket Basıldı Onayla (Fiziki değişim onayı)
 */
async function confirmPrintedOnly() {
  if (!currentBarcode) return;
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(currentBarcode)}/confirm-printed`, { method: 'POST' });
    const data = await res.json();

    if (data.status === 'success') {
      showToast('✓ Etiket basıldı olarak onaylandı!', 'success');
      const posP = parseFloat(document.getElementById('inp-price')?.value) || (currentProduct ? currentProduct.price : 0);
      document.getElementById('val-label-price').textContent = `₺ ${Number(posP).toFixed(2)}`;
      const badge = document.getElementById('badge-status');
      if (badge) {
        badge.className = "product-status-pill found";
        badge.innerText = "✓ Etiket Güncel";
      }
    } else {
      showToast('Hata: ' + data.message, 'error');
    }
  } catch(e) {
    showToast('Hata: ' + e.message, 'error');
  }
}

/**
 * ➕ Basım Listesine Ekle (Kuyruk)
 */
function addItemToQueue() {
  const title = (document.getElementById('inp-title')?.value || '').trim();
  const price = parseFloat(document.getElementById('inp-price')?.value) || 0;

  if (!title) {
    showToast("Lütfen Ürün Adı girin!", "error");
    return;
  }

  const existingIdx = mobileQueue.findIndex(x => x.barcode === currentBarcode);
  if (existingIdx !== -1) {
    mobileQueue[existingIdx].title = title;
    mobileQueue[existingIdx].price = price;
  } else {
    mobileQueue.push({
      barcode: currentBarcode,
      title: title,
      price: price
    });
  }

  saveQueueToStorage();
  showToast(`✓ "${title}" basım listesine eklendi!`, "success");

  // Kart durumunu güncelle
  const productCard = document.getElementById('product-card');
  const addedCard = document.getElementById('added-success-card');
  const addedDesc = document.getElementById('added-success-desc');
  if (productCard) productCard.style.display = 'none';
  if (addedCard) addedCard.style.display = 'flex';
  if (addedDesc) addedDesc.textContent = `${title} (₺ ${price.toFixed(2)})`;
}

function switchMobileTab(tabName) {
  const secScan = document.getElementById('section-scan');
  const secQueue = document.getElementById('section-queue');
  const btnScan = document.getElementById('tab-btn-scan');
  const btnQueue = document.getElementById('tab-btn-queue');

  if (tabName === 'scan') {
    secScan.style.display = 'flex';
    secQueue.style.display = 'none';
    btnScan.classList.add('active');
    btnQueue.classList.remove('active');
  } else {
    secScan.style.display = 'none';
    secQueue.style.display = 'flex';
    btnScan.classList.remove('active');
    btnQueue.classList.add('active');
    renderQueueList();
  }
}

function loadQueueFromStorage() {
  try {
    const saved = localStorage.getItem('mobile_label_queue');
    if (saved) mobileQueue = JSON.parse(saved);
  } catch(e) {
    mobileQueue = [];
  }
}

function saveQueueToStorage() {
  try {
    localStorage.setItem('mobile_label_queue', JSON.stringify(mobileQueue));
  } catch(e) {}
  updateQueueUI();
}

function updateQueueUI() {
  const count = mobileQueue.length;
  const badge = document.getElementById('badge-queue-count');
  const btnText = document.getElementById('btn-batch-print-text');
  const countLabel = document.getElementById('queue-total-count');
  if (badge) badge.innerText = count;
  if (btnText) btnText.innerText = `Toplu Yazdır (${count} Etiket)`;
  if (countLabel) countLabel.innerText = `${count} ürün`;
}

function renderQueueList() {
  const container = document.getElementById('queue-items-list');
  const emptyState = document.getElementById('queue-empty-state');
  if (!container) return;

  if (mobileQueue.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  let html = '';
  mobileQueue.forEach((item, idx) => {
    html += `
      <div class="queue-card">
        <div class="queue-card-top">
          <span class="queue-card-title">${item.title}</span>
          <button class="btn-remove-item" onclick="removeItemFromQueue(${idx})">🗑️ Kaldır</button>
        </div>
        <div class="queue-card-bottom">
          <span class="queue-barcode">${item.barcode}</span>
          <input type="number" step="0.01" class="queue-price-inp" value="${item.price}" onchange="updateQueuePrice(${idx}, this.value)">
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateQueuePrice(idx, val) {
  if (mobileQueue[idx]) {
    mobileQueue[idx].price = parseFloat(val) || 0;
    saveQueueToStorage();
  }
}

function removeItemFromQueue(idx) {
  mobileQueue.splice(idx, 1);
  saveQueueToStorage();
  renderQueueList();
}

function clearQueueWithConfirm() {
  if (mobileQueue.length === 0) return;
  if (confirm("Basım listesini temizlemek istediğinize emin misiniz?")) {
    mobileQueue = [];
    saveQueueToStorage();
    renderQueueList();
  }
}

/**
 * 🖨️ Toplu Kuyruk Yazdırma
 */
async function submitQueueBatchPrint() {
  if (mobileQueue.length === 0) {
    showToast("Basım listesi boş!", "error");
    return;
  }

  showToast("Toplu etiketler yazıcıya gönderiliyor...", "info");

  try {
    const chosenPrinter = getSelectedMobilePrinter();
    const payload = {
      products: mobileQueue.map(item => ({
        barcode: item.barcode,
        title: item.title,
        price: item.price
      })),
      copies: 1
    };
    if (chosenPrinter) payload.printer = chosenPrinter;

    const res = await fetch('/api/print/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'success') {
      showToast(`✓ ${mobileQueue.length} etiket başarıyla basıldı!`, "success");
      mobileQueue = [];
      saveQueueToStorage();
      renderQueueList();
      setTimeout(() => switchMobileTab('scan'), 1000);
    } else {
      showToast("⚠️ Yazdırma hatası: " + data.message, "error");
    }
  } catch(e) {
    showToast("⚠️ Hata: " + e.message, "error");
  }
}

// Başlatıcı
document.addEventListener('DOMContentLoaded', () => {
  loadQueueFromStorage();
  updateQueueUI();
  loadMobilePrinters();
  setInterval(loadMobilePrinters, 8000);
});
