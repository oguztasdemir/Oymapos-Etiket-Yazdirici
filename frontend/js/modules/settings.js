// ==========================================================================
// OYMAPOS - YAZICI AYARLARI VE SİSTEM YEDEKLEME MODÜLÜ
// ==========================================================================

async function loadPrinters() {
  try {
    const res = await API.getPrinters();
    const data = res.data || res;
    if (res.status === 'success' || data.printers) {
      const select = document.getElementById('printerSelect');
      const receiptSelect = document.getElementById('receiptPrinterSelect');
      const studioSelect = document.getElementById('studio-active-printer-select');
      const printers = data.printers || [];

      if (select) {
        select.innerHTML = '';
        printers.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p;
          if (p === data.active_printer) opt.selected = true;
          select.appendChild(opt);
        });
      }

      if (studioSelect) {
        studioSelect.innerHTML = '';
        printers.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p;
          if (p === data.active_printer) opt.selected = true;
          studioSelect.appendChild(opt);
        });
      }

      if (receiptSelect) {
        receiptSelect.innerHTML = '';
        printers.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p;
          if (p === (data.settings && data.settings.receipt_printer) || p === data.active_printer) opt.selected = true;
          receiptSelect.appendChild(opt);
        });
      }

      if (data.settings) {
        const s = data.settings;
        if (document.getElementById('marketName')) document.getElementById('marketName').value = s.market_name || 'MARKET';
        if (document.getElementById('labelPresetSelect')) document.getElementById('labelPresetSelect').value = s.label_size_preset || '76x40';
        if (document.getElementById('labelWidth')) document.getElementById('labelWidth').value = s.width_mm || 76;
        if (document.getElementById('labelHeight')) document.getElementById('labelHeight').value = s.height_mm || 40;
        if (document.getElementById('labelDarkness')) document.getElementById('labelDarkness').value = s.darkness || 22;
        if (document.getElementById('labelOrientation')) document.getElementById('labelOrientation').value = s.orientation || 'POR';
        if (document.getElementById('labelXOffset')) document.getElementById('labelXOffset').value = s.x_offset || 0;
        if (document.getElementById('labelYOffset')) document.getElementById('labelYOffset').value = s.y_offset || 0;
        updateLabelPreview();
      }
    }
  } catch (err) {
    console.error('Yazıcılar yüklenemedi:', err);
  }
}

function handlePresetChange(preset) {
  const widthInput = document.getElementById('labelWidth');
  const heightInput = document.getElementById('labelHeight');
  if (!widthInput || !heightInput) return;

  const presets = {
    '60x40': { w: 60, h: 40 },
    '76x40': { w: 76, h: 40 },
    '85x45': { w: 85, h: 45 },
    '50x30': { w: 50, h: 30 }
  };

  if (presets[preset]) {
    widthInput.value = presets[preset].w;
    heightInput.value = presets[preset].h;
  }
  updateLabelPreview(preset);
}

function updateLabelPreview(preset) {
  const marketName = document.getElementById('marketName') ? document.getElementById('marketName').value.trim() : 'MARKET';
  const selPreset = preset || (document.getElementById('labelPresetSelect') ? document.getElementById('labelPresetSelect').value : '60x40');

  const previewBrand = document.getElementById('previewBrandText');
  if (previewBrand) previewBrand.textContent = (marketName || 'YARENLER').slice(0, 16);

  const card = document.getElementById('labelPreviewCard');
  if (card) {
    card.className = 'market-label';
    if (['60x40', '76x40', '85x45', '50x30'].includes(selPreset)) {
      card.classList.add(`size-${selPreset}`);
    } else {
      card.classList.add('size-60x40');
    }
  }
}

async function savePrinterSettings() {
  const settings = {
    market_name: document.getElementById('marketName') ? document.getElementById('marketName').value.trim() : 'MARKET',
    printer: document.getElementById('printerSelect') ? document.getElementById('printerSelect').value : 'Termal Etiket Yazici',
    receipt_printer: document.getElementById('receiptPrinterSelect') ? document.getElementById('receiptPrinterSelect').value : 'Termal Etiket Yazici',
    label_size_preset: document.getElementById('labelPresetSelect') ? document.getElementById('labelPresetSelect').value : '60x40',
    width_mm: parseInt(document.getElementById('labelWidth').value) || 60,
    height_mm: parseInt(document.getElementById('labelHeight').value) || 40,
    darkness: parseInt(document.getElementById('labelDarkness').value) || 22,
    orientation: document.getElementById('labelOrientation') ? document.getElementById('labelOrientation').value : 'POR',
    x_offset: parseInt(document.getElementById('labelXOffset').value) || 0,
    y_offset: parseInt(document.getElementById('labelYOffset').value) || 0
  };

  try {
    const res = await API.savePrinterSettings(settings);
    if (res.status === 'success') {
      showToast('Yazıcı ve kalibrasyon ayarları kaydedildi!', 'success');
      localStorage.setItem('printer_settings', JSON.stringify(settings));
    } else {
      showToast('Ayar kaydedilemedi: ' + (res.message || 'Bilinmeyen hata'), 'error');
    }
  } catch (err) {
    showToast('Ayar kaydedilemedi: ' + err.message, 'error');
  }
}

async function testPrint() {
  try {
    showToast('Test etiketi yazıcıya gönderiliyor...', 'info');
    const res = await API.testPrint();
    if (res.status === 'success') {
      showToast('Test etiketi yazıcıya iletildi!', 'success');
    } else {
      showToast('Hata: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Yazıcı iletişim hatası: ' + err.message, 'error');
  }
}

async function purgeQueue() {
  try {
    showToast('Yazıcı kuyruğu temizleniyor...', 'info');
    const res = await API.purgePrinterQueue();
    if (res.status === 'success') {
      showToast(res.message || 'Yazıcı kuyruğu başarıyla temizlendi.', 'success');
    } else {
      showToast('Hata: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Kuyruk temizlenemedi: ' + err.message, 'error');
  }
}

async function handleSystemRestoreUpload(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!confirm(`"${file.name}" dosyasını geri yüklemek istediğinize emin misiniz?\nMevcut veritabanı ve ayarlar yedeğin içeriğiyle güncellenecektir.`)) {
    return;
  }

  showToast('Yedek geri yükleniyor...', 'info');
  try {
    const res = await API.restoreSystem(file);
    if (res.status === 'success') {
      showToast(res.message || 'Sistem başarıyla geri yüklendi!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      showToast('Hata: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Geri yükleme hatası: ' + err.message, 'error');
  }
}
