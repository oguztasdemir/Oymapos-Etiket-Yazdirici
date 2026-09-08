// ==========================================================================
// ETİKET VE FİŞ YAZDIRICI - MASAÜSTÜ KONTROL MOTORU (Zero AI Slop & Excel Grid)
// Standart: taslak copy/02_KLASOR_HIYERARSISI ve 04_ARAYUZ_TASARIM
// ==========================================================================

let activeTab = 'tab-search';
let searchTimeout = null;
let onlyNewFilter = false;

// BAŞLATICI VE OLAY DİNLEYİCİLERİ
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initShortcuts();
  loadNetworkInfo();
  loadPrinters();
  loadTemplates();
  restoreSavedState();
  searchProducts('');
  loadPriceChanges();
  loadNewProducts();
  initVegaWinDropzone();
  initStudioDragAndDrop();
});

// 1. KLAVYE KISAYOLLARI (taslak copy/07_klavye_kisayollari.md)
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl + K veya / -> Arama Kutusuna Odaklan
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) {
        document.querySelector('[data-tab="tab-search"]').click();
        searchInput.focus();
        searchInput.select();
      }
    }
    // Ctrl + S -> Yazıcı Ayarlarını Kaydet
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      savePrinterSettings();
    }
    // F2 -> Hızlı Test Baskısı
    if (e.key === 'F2') {
      e.preventDefault();
      testPrint();
    }
    // Modal Açıkken Enter (Yazdır) veya Escape (Kapat)
    const modal = document.getElementById('modal-label-preview');
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Enter') {
        e.preventDefault();
        printFromModal();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLabelPreviewModal();
        return;
      }
    }

    // Escape -> Arama Temizle
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchProducts('');
      }
    }
  });
}

// 2. SEKME YÖNETİMİ
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  });

  const savedTab = localStorage.getItem('active_tab');
  if (savedTab && (document.querySelector(`[data-tab="${savedTab}"]`) || document.getElementById(savedTab))) {
    switchTab(savedTab);
  } else {
    switchTab('tab-home');
  }
}

function switchTab(target) {
  if (!target) return;
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.dataset.tab === target) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const pane = document.getElementById(target);
  if (pane) pane.classList.add('active');
  activeTab = target;
  localStorage.setItem('active_tab', target);

  if (target === 'tab-design') {
    loadTemplates();
  }
  if (target === 'tab-home') {
    updateHomeDashboardInfo();
  }
}

// 3. AĞ VE QR KOD YÜKLEYİCİ
async function loadNetworkInfo() {
  try {
    const res = await API.getNetworkInfo();
    const data = res.data || res;
    if (res.status === 'success' || data.ip) {
      const topbarIp = document.getElementById('topbarIp');
      const mobileUrl = document.getElementById('mobileUrlText');
      const syncUrl = document.getElementById('syncUrlText');
      const qrImg = document.getElementById('qrImage');

      if (topbarIp) topbarIp.textContent = data.ip;
      if (mobileUrl) mobileUrl.textContent = data.mobile_url;
      if (syncUrl) syncUrl.textContent = data.sync_url;
      if (qrImg) qrImg.src = data.qr_image;
    }
  } catch (err) {
    console.error('Ağ bilgisi yüklenemedi:', err);
  }
}

// 4. YAZICI LİSTESİ VE AYARLARI (OYMAPOS STANDART)
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

// 5. ÜRÜN ARAMA VE EXCEL GRID BASKI MASASI
let currentFilter = 'all'; // 'all', 'diff', 'new'
let cachedProductsList = [];
let currentModalProduct = null;

function renderBarcodeSvg(target, barcode) {
  try {
    if (!barcode) return;
    const cleanCode = String(barcode).trim();
    if (typeof JsBarcode === 'function') {
      const isEan13 = /^\d{13}$/.test(cleanCode);
      JsBarcode(target, cleanCode, {
        format: isEan13 ? "EAN13" : "CODE128",
        lineColor: "#000",
        width: 1.15,
        height: 22,
        displayValue: true,
        fontSize: 9,
        font: "Inter",
        textMargin: 1,
        margin: 0
      });
    }
  } catch (err) {
    console.warn("Barkod SVG çizim hatası:", err);
  }
}

function toggleFilter(filterType) {
  currentFilter = filterType;
  const btnAll = document.getElementById('filterAllBtn');
  const btnDiff = document.getElementById('filterDiffBtn');
  const btnNew = document.getElementById('filterNewBtn');
  
  if (btnAll) btnAll.classList.toggle('active', filterType === 'all');
  if (btnDiff) btnDiff.classList.toggle('active', filterType === 'diff');
  if (btnNew) btnNew.classList.toggle('active', filterType === 'new');

  const input = document.getElementById('productSearchInput');
  searchProducts(input ? input.value : '');
}

function toggleNewOnlyFilter(isNew) {
  toggleFilter(isNew ? 'new' : 'all');
}

function handleSearchInput(e) {
  clearTimeout(searchTimeout);
  const q = e.target.value;
  localStorage.setItem('search_query', q);
  searchTimeout = setTimeout(() => {
    searchProducts(q);
  }, 180);
}

async function searchProducts(query) {
  try {
    const res = await API.searchProducts(
      query,
      0,
      currentFilter === 'new',
      currentFilter === 'diff'
    );
    const data = res.data || res;
    if (res.status === 'success' || data.products) {
      cachedProductsList = data.products || [];
      renderProductsTable(cachedProductsList);
      const countEl = document.getElementById('totalProductsCount');
      if (countEl) {
        animateCount(countEl, data.total || (data.products ? data.products.length : 0));
      }
      updateHomeDashboardInfo();
    }
  } catch (err) {
    console.error('Ürünler aranamadı:', err);
  }
}

async function syncAllLabelPrices() {
  if (!confirm("Tüm ürünlerin etiket (raf) fiyatlarını kasa satış fiyatına eşitlemek istediğinize emin misiniz?")) {
    return;
  }
  try {
    const res = await API.syncLabelPrices();
    if (res.status === 'success') {
      showToast(res.message || 'Tüm etiket fiyatları satış fiyatına eşitlendi!', 'success');
      searchProducts(document.getElementById('productSearchInput')?.value || '');
    } else {
      showToast(res.message || 'İşlem gerçekleştirilemedi.', 'error');
    }
  } catch (err) {
    showToast('Etiket fiyatları eşitlenemedi.', 'error');
  }
}

function getTodayTrDate() {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const m = months[today.getMonth()];
  const y = today.getFullYear();
  return `${d} ${m} ${y}`;
}

function formatTrDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return getTodayTrDate();
  }
  const str = dateStr.trim();
  try {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      const d = String(dt.getDate()).padStart(2, '0');
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const m = months[dt.getMonth()];
      const y = dt.getFullYear();
      return `${d} ${m} ${y}`;
    }
  } catch (e) {}
  if (/^\d{2}\.\d{2}\.\d{4}/.test(str)) {
    return str.slice(0, 10);
  }
  return str;
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="padding: 36px 16px; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-title">Kayıtlı Ürün Bulunamadı</div>
            <div class="empty-state-desc">Arama teriminizi değiştirebilir veya VegaWin sekmesinden ürün dosyanızı yükleyebilirsiniz.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  const rowsHtml = products.map((p, idx) => {
    const newBadge = p.is_new ? '<span class="badge badge-success" style="font-size:10px; margin-left:8px;">✨ YENİ</span>' : '';
    const posPrice = (typeof p.price === 'number') ? p.price : Number(p.price || 0);
    const posPriceStr = posPrice.toFixed(2);
    const barcodeEscaped = (p.barcode || '').replace(/'/g, "\\'");
    const priceDate = formatTrDate(p.price_updated_at || p.updated_at || p.created_at);

    const hasLabelPrice = (p.label_price !== null && p.label_price !== undefined);
    const labelPrice = hasLabelPrice ? Number(p.label_price) : null;
    const labelPriceStr = hasLabelPrice ? labelPrice.toFixed(2) : '-';

    // Fiyat Farkı Tespiti
    const isMismatch = hasLabelPrice && Math.abs(posPrice - labelPrice) > 0.001;
    const isUnprinted = !p.last_printed_at;

    let labelPriceHtml = '';
    if (hasLabelPrice) {
      if (isMismatch) {
        labelPriceHtml = `<span style="color:#fbbf24; font-weight:800; font-family:var(--font-mono); font-size:13px;">₺ ${labelPriceStr}</span>`;
      } else {
        labelPriceHtml = `<span style="color:#93c5fd; font-weight:700; font-family:var(--font-mono); font-size:13px;">₺ ${labelPriceStr}</span>`;
      }
    } else {
      labelPriceHtml = `<span style="color:var(--text-muted); font-size:11px;">Basılmadı</span>`;
    }

    let printDateHtml = '';
    if (p.last_printed_at) {
      printDateHtml = `
        <div class="print-date-badge" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#38bdf8; background:rgba(2,132,199,0.12); padding:3px 8px; border-radius:6px; border:1px solid rgba(2,132,199,0.25);">
          <span>🖨️</span><span>${p.last_printed_at}</span>
        </div>`;
    } else {
      printDateHtml = `<span style="font-size:11px; color:var(--text-muted); padding:2px 6px;">Henüz basılmadı</span>`;
    }

    let statusHtml = '';
    if (isMismatch) {
      const diffAmt = Math.abs(posPrice - labelPrice).toFixed(2);
      statusHtml = `<span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.4); font-size:10.5px; padding:3px 8px; border-radius:6px; font-weight:700;">⚠️ FARK: ₺${diffAmt}</span>`;
    } else if (isUnprinted) {
      statusHtml = `<span class="badge" style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); font-size:10.5px; padding:3px 8px; border-radius:6px; font-weight:700;">⚠️ Baskı Bekliyor</span>`;
    } else {
      statusHtml = `<span class="badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); font-size:10.5px; padding:3px 8px; border-radius:6px; font-weight:700;">✅ Etiket Güncel</span>`;
    }

    const rowClass = isMismatch ? 'row-price-mismatch' : '';

    return `
      <tr id="row-${barcodeEscaped}" class="${rowClass}">
        <td class="col-idx">${idx + 1}</td>
        <td class="col-barcode">${p.barcode || ''}</td>
        <td class="col-title">${p.title || ''}${newBadge}</td>
        <td class="col-pos-price" id="pos-price-cell-${barcodeEscaped}">₺ ${posPriceStr}</td>
        <td class="col-label-price" id="label-price-cell-${barcodeEscaped}">${labelPriceHtml}</td>
        <td class="col-price-date">
          <div style="font-size:12px; font-weight:700; color:#f8fafc; display:flex; align-items:center; gap:5px;">
            <span style="color:#10b981;">📅</span> <span>${priceDate}</span>
          </div>
        </td>
        <td class="col-print-date" id="print-date-cell-${barcodeEscaped}">${printDateHtml}</td>
        <td class="col-status" id="status-cell-${barcodeEscaped}">${statusHtml}</td>
        <td class="col-action" style="text-align:center;">
          <div style="display:inline-flex; gap:4px; align-items:center; justify-content:center;">
            <button class="btn btn-secondary btn-sm" onclick="openLabelPreviewModal('${barcodeEscaped}')" style="padding:3px 6px; font-size:10.5px; font-weight:700; color:#38bdf8;" title="Etiketi Önizle">
              👁️ Önizle
            </button>
            <button class="btn-excel-print" onclick="printBarcode('${barcodeEscaped}', this, ${posPrice})" style="width:auto; padding:3px 8px; font-size:10.5px;">
              🖨️ Yazdır
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rowsHtml;
}

// 5.1 OYMAPOS TEKLİ ETİKET ÖNİZLEME MODAL FONKSİYONLARI
function openLabelPreviewModal(barcode) {
  const prod = cachedProductsList.find(p => p.barcode === barcode) || {
    barcode: barcode,
    title: "ÖRNEK ÜRÜN",
    price: 25.0,
    brand: "MARKET",
    origin: "TURKIYE"
  };

  currentModalProduct = prod;

  // Başlığı tek satırda en sağa kadar uzat, uzunsa doğal olarak alt satıra geçsin
  const fullTitle = (prod.title || 'ÜRÜN ADI').trim().toUpperCase();

  const title1El = document.getElementById('modal-lbl-title-1');
  const title2El = document.getElementById('modal-lbl-title-2');
  const brandEl = document.getElementById('modal-lbl-brand');
  const originEl = document.getElementById('modal-lbl-origin');
  const dateEl = document.getElementById('modal-lbl-date');
  const priceEl = document.getElementById('modal-lbl-price');
  const modal = document.getElementById('modal-label-preview');

  if (title1El) {
    title1El.textContent = fullTitle;
    title1El.style.width = '100%';
    title1El.style.display = 'block';
    if (fullTitle.length <= 22) {
      title1El.style.fontSize = '14px';
    } else {
      title1El.style.fontSize = '12.5px';
    }
  }
  if (title2El) {
    title2El.textContent = '';
    title2El.style.display = 'none';
  }
  const marketName = localStorage.getItem('market_name') || document.getElementById('marketName')?.value || 'YARENLER';
  if (brandEl) brandEl.textContent = marketName.toUpperCase();
  if (originEl) originEl.textContent = (prod.origin || 'TÜRKİYE').toUpperCase();
  if (dateEl) dateEl.textContent = formatTrDate(prod.price_updated_at || prod.updated_at || prod.created_at || new Date().toISOString());
  
  const priceVal = (typeof prod.price === 'number') ? prod.price : Number(prod.price || 0);
  if (priceEl) priceEl.textContent = `${priceVal.toFixed(2)} TL`.replace('.', ',');

  renderBarcodeSvg("#modal-barcode-svg", prod.barcode);

  // Terazi / Gramaj Rozeti
  const scaleBadge = document.getElementById('modal-scale-badge');
  if (scaleBadge) {
    if (prod.is_scale_product) {
      scaleBadge.style.display = 'block';
      scaleBadge.textContent = `⚖️ Terazi Ürünü: ${prod.scale_summary || 'Gramajlı Satış'}`;
    } else {
      scaleBadge.style.display = 'none';
    }
  }

  // Fiyat Geçmişini Yükle
  loadModalPriceHistory(prod.barcode);

  if (modal) {
    modal.style.display = 'flex';
  }
}

async function loadModalPriceHistory(barcode) {
  const historyList = document.getElementById('modal-history-list');
  const countEl = document.getElementById('modal-history-count');
  if (!historyList) return;
  historyList.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Fiyat geçmişi yükleniyor...</div>';

  try {
    const res = await API.getProductHistory(barcode);
    const data = res.data || {};
    const history = data.history || [];
    if (countEl) countEl.textContent = `${history.length} Değişim`;

    if (history.length === 0) {
      historyList.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Bu ürün için kayıtlı fiyat değişimi bulunmuyor.</div>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach(h => {
      const item = document.createElement('div');
      const diffColor = h.diff_amount > 0 ? '#ef4444' : '#10b981';
      const diffSign = h.diff_amount > 0 ? '+' : '';
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:4px; font-size:11px;';
      item.innerHTML = `
        <span style="color:#94a3b8;">📅 ${h.changed_at}</span>
        <span style="text-decoration:line-through; color:#64748b;">₺ ${Number(h.old_price).toFixed(2)}</span>
        <span style="font-weight:700; color:#fff;">➔ ₺ ${Number(h.new_price).toFixed(2)}</span>
        <span style="color:${diffColor}; font-weight:700;">${diffSign}${h.diff_amount} TL (%${h.diff_percent})</span>
      `;
      historyList.appendChild(item);
    });
  } catch (err) {
    historyList.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Fiyat geçmişi alınamadı.</div>';
  }
}

function closeLabelPreviewModal() {
  const modal = document.getElementById('modal-label-preview');
  if (modal) modal.style.display = 'none';
}

async function printFromModal() {
  if (!currentModalProduct) return;
  const copies = parseInt(document.getElementById('modal-print-copies')?.value || '1', 10);
  const btn = document.getElementById('modal-btn-print');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Basılıyor...';
  }

  try {
    const res = await API.printSingle({ barcode: currentModalProduct.barcode }, copies);
    if (res.status === 'success') {
      showToast(`${copies} adet etiket yazıcıya gönderildi!`, 'success');
      closeLabelPreviewModal();
      searchProducts(document.getElementById('productSearchInput')?.value || '');
    } else {
      showToast('Yazdırma hatası: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Yazıcıya ulaşılamadı: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🖨️ Hemen Yazdır';
    }
  }
}

function openProductInStudio() {
  if (!currentModalProduct) return;
  closeLabelPreviewModal();
  document.querySelector('[data-tab="tab-design"]')?.click();
  loadProductIntoStudio(currentModalProduct);
}


async function printBarcode(barcode, btnElement, currentPrice) {
  try {
    const res = await API.printSingle({ barcode: barcode }, 1);
    if (res.status === 'success') {
      showToast(`${barcode} etiket yazıcıya gönderildi!`, 'success');
      
      const prod = (res.data && res.data.product) || {};
      const nowStr = (res.data && res.data.last_printed_at) || new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const printedPrice = prod.price !== undefined ? Number(prod.price).toFixed(2) : (currentPrice !== undefined ? Number(currentPrice).toFixed(2) : null);

      // Canlı Tablo Hücrelerini Güncelle
      const labelPriceCell = document.getElementById(`label-price-cell-${barcode}`);
      if (labelPriceCell && printedPrice) {
        labelPriceCell.innerHTML = `<span style="color:#93c5fd; font-weight:700; font-family:var(--font-mono); font-size:13px;">₺ ${printedPrice}</span>`;
      }

      const printDateCell = document.getElementById(`print-date-cell-${barcode}`);
      if (printDateCell) {
        printDateCell.innerHTML = `
          <div class="print-date-badge" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; color:#38bdf8; background:rgba(2,132,199,0.12); padding:3px 8px; border-radius:6px; border:1px solid rgba(2,132,199,0.25);">
            <span>🖨️</span><span>${nowStr}</span>
          </div>
        `;
      }

      const statusCell = document.getElementById(`status-cell-${barcode}`);
      if (statusCell) {
        statusCell.innerHTML = `<span class="badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); font-size:10.5px; padding:3px 8px; border-radius:6px; font-weight:700;">✅ Etiket Güncel</span>`;
      }

      const row = document.getElementById(`row-${barcode}`);
      if (row) {
        row.classList.remove('row-price-mismatch');
      }

      if (btnElement) {
        const oldText = btnElement.innerHTML;
        btnElement.innerHTML = '✅ Basıldı';
        btnElement.style.background = '#10b981';
        setTimeout(() => {
          btnElement.innerHTML = oldText;
          btnElement.style.background = '';
        }, 1200);
      }
    } else {
      showToast('Yazdırma hatası: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Yazıcıya ulaşılamadı: ' + err.message, 'error');
  }
}

// 6. VEGAWIN SENKRONİZASYONU (FİYAT DEĞİŞİMİ & YENİ ÜRÜN)
function initVegaWinDropzone() {
  const dz = document.getElementById('vegaDropzone');
  if (!dz) return;

  ['dragenter', 'dragover'].forEach(eName => {
    dz.addEventListener(eName, e => { e.preventDefault(); dz.style.borderColor = '#6366f1'; });
  });
  ['dragleave', 'drop'].forEach(eName => {
    dz.addEventListener(eName, e => { e.preventDefault(); dz.style.borderColor = ''; });
  });

  dz.addEventListener('drop', e => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadVegaWinFile(e.dataTransfer.files[0]);
    }
  });
}

function handleVegaFileSelect(files) {
  if (files && files.length > 0) {
    uploadVegaWinFile(files[0]);
  }
}

async function uploadVegaWinFile(file) {
  const progress = document.getElementById('vegaUploadProgress');
  const statusTxt = document.getElementById('vegaUploadStatus');

  progress.style.display = 'block';
  statusTxt.textContent = 'VegaWin dosyası yükleniyor ve işleniyor...';

  try {
    const res = await API.uploadVegawin(file);
    const data = res.data || res;
    progress.style.display = 'none';

    if (res.status === 'success' || data.total_received !== undefined) {
      showToast(`Aktarım Başarılı! (${data.total_received || 0} Ürün, ${data.new_products || 0} Yeni, ${data.price_changes_count || 0} Fiyat Değişimi)`, 'success');
      searchProducts('');
      loadPriceChanges();
      loadNewProducts();
    } else {
      showToast('Hata: ' + (res.message || 'Dosya işlenemedi.'), 'error');
    }
  } catch (err) {
    progress.style.display = 'none';
    showToast('Sunucu iletişim hatası: ' + err.message, 'error');
  }
}

function switchSyncView(viewType) {
  const tabChanges = document.getElementById('tabChangesToggle');
  const tabNew = document.getElementById('tabNewProdsToggle');
  const viewChanges = document.getElementById('syncChangesView');
  const viewNew = document.getElementById('syncNewProdsView');

  if (viewType === 'changes') {
    if (tabChanges) tabChanges.classList.add('active');
    if (tabNew) tabNew.classList.remove('active');
    if (viewChanges) viewChanges.style.display = 'block';
    if (viewNew) viewNew.style.display = 'none';
  } else {
    if (tabChanges) tabChanges.classList.remove('active');
    if (tabNew) tabNew.classList.add('active');
    if (viewChanges) viewChanges.style.display = 'none';
    if (viewNew) viewNew.style.display = 'block';
  }
}

async function loadPriceChanges() {
  try {
    const res = await API.getPriceChanges(true);
    const data = res.data || res;
    if (res.status === 'success' || data.changes) {
      renderChangesTable(data.changes || []);
      const count = data.count !== undefined ? data.count : (data.changes ? data.changes.length : 0);
      const countEl = document.getElementById('pendingChangesCount');
      if (countEl) animateCount(countEl, count);
      const printAllBtn = document.getElementById('printAllChangesBtn');
      if (printAllBtn) printAllBtn.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.error('Fiyat değişimleri yüklenemedi:', err);
  }
}

function renderChangesTable(changes) {
  const tbody = document.getElementById('changesTableBody') || document.getElementById('priceChangesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (changes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon">✨</div>
            <div class="empty-state-title">Bekleyen Fiyat Değişimi Yok</div>
            <div class="empty-state-desc">Tüm etiketler güncel veya yeni dosya yüklenmedi.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  changes.forEach(c => {
    const tr = document.createElement('tr');
    const diffColor = c.diff_amount > 0 ? '#ef4444' : '#10b981';
    const diffSign = c.diff_amount > 0 ? '+' : '';
    tr.innerHTML = `
      <td class="col-barcode">${c.barcode}</td>
      <td class="col-title">${c.title}</td>
      <td style="color:var(--text-muted); text-decoration:line-through; text-align:right; font-family:var(--font-mono);">₺ ${Number(c.old_price).toFixed(2)}</td>
      <td class="col-price">₺ ${Number(c.new_price).toFixed(2)}</td>
      <td><span style="color:${diffColor}; font-weight:700; font-size:12px;">${diffSign}${c.diff_amount} TL (%${c.diff_percent})</span></td>
      <td class="col-action">
        <button class="btn-excel-print" onclick="printBarcode('${c.barcode}', this)">
          🖨️ Yazdır
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadNewProducts() {
  try {
    const res = await API.getNewProducts(true);
    const data = res.data || res;
    if (res.status === 'success' || data.new_products) {
      renderNewProductsTable(data.new_products || []);
      const count = data.count !== undefined ? data.count : (data.new_products ? data.new_products.length : 0);
      const countEl = document.getElementById('pendingNewProdsCount');
      if (countEl) animateCount(countEl, count);
      const printAllBtn = document.getElementById('printAllNewProdsBtn');
      if (printAllBtn) printAllBtn.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.error('Yeni ürünler yüklenemedi:', err);
  }
}

function renderNewProductsTable(newProducts) {
  const tbody = document.getElementById('newProdsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (newProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding: 24px; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-title">Bekleyen Yeni Ürün Yok</div>
            <div class="empty-state-desc">Tüm yeni ürün etiketleri basıldı veya henüz yeni ürün eklenmedi.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  newProducts.forEach(np => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-barcode">${np.barcode}</td>
      <td class="col-title">${np.title} <span class="badge badge-success" style="font-size:10px;">YENİ</span></td>
      <td class="col-price">₺ ${Number(np.price).toFixed(2)}</td>
      <td class="col-action">
        <button class="btn-excel-print" onclick="printBarcode('${np.barcode}', this)">
          🖨️ Yazdır
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function printAllChangedLabels() {
  try {
    showToast('Değişen etiketler basılıyor...', 'info');
    const res = await API.printPriceChanges();
    if (res.status === 'success') {
      showToast(res.message || 'Etiketler başarıyla basıldı.', 'success');
      loadPriceChanges();
    } else {
      showToast('Hata: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Yazdırma hatası: ' + err.message, 'error');
  }
}

async function printAllNewProdsLabels() {
  try {
    showToast('Yeni ürün etiketleri basılıyor...', 'info');
    const res = await API.printNewProducts();
    if (res.status === 'success') {
      showToast(res.message || 'Yeni ürün etiketleri basıldı.', 'success');
      loadNewProducts();
    } else {
      showToast('Hata: ' + res.message, 'error');
    }
  } catch (err) {
    showToast('Yazdırma hatası: ' + err.message, 'error');
  }
}

// 7. KOPYALAMA VE DIŞA AKTARMA FONKSİYONLARI
function copyUrl(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    showToast('URL panoya kopyalandı!', 'success');
  });
}

function copyTableToClipboard(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  let text = '';
  table.querySelectorAll('tr').forEach(tr => {
    const row = Array.from(tr.children).map(td => td.innerText.trim()).join('\t');
    text += row + '\n';
  });
  navigator.clipboard.writeText(text).then(() => {
    showToast('Tablo panoya kopyalandı!', 'success');
  });
}

function restoreSavedState() {
  const savedQuery = localStorage.getItem('search_query');
  if (savedQuery) {
    const input = document.getElementById('productSearchInput');
    if (input) input.value = savedQuery;
  }

  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  const sidebar = document.getElementById('appSidebar');
  if (sidebar && isCollapsed) {
    sidebar.classList.add('collapsed');
  }
  updateSidebarToggleUI(isCollapsed);
  updateHomeDashboardInfo();
}

// 8. OYMAPOS SIDEBAR VE STÜDYO KONTROLLERİ
function toggleSidebar(forceState) {
  const sidebar = document.getElementById('appSidebar');
  if (!sidebar) return;

  if (typeof forceState === 'boolean') {
    if (forceState) {
      sidebar.classList.remove('collapsed');
    } else {
      sidebar.classList.add('collapsed');
    }
  } else {
    sidebar.classList.toggle('collapsed');
  }

  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
  updateSidebarToggleUI(isCollapsed);
}

function updateSidebarToggleUI(isCollapsed) {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const topbarToggleText = document.getElementById('topbarSidebarText');
  const topbarToggleIcon = document.getElementById('topbarSidebarIcon');
  const homeToggleText = document.getElementById('homeSidebarToggleText');
  const homeToggleIcon = document.getElementById('homeSidebarToggleIcon');
  const homeActionIcon = document.getElementById('homeActionSidebarIcon');

  if (toggleBtn) {
    toggleBtn.textContent = isCollapsed ? '▶' : '◀';
    toggleBtn.title = isCollapsed ? 'Menüyü Aç' : 'Menüyü Gizle (Tam Ekran)';
  }
  if (topbarToggleIcon) topbarToggleIcon.textContent = isCollapsed ? '☰' : '✕';
  if (topbarToggleText) topbarToggleText.textContent = isCollapsed ? 'Menüyü Aç' : 'Menüyü Gizle';
  if (homeToggleIcon) homeToggleIcon.textContent = isCollapsed ? '📂' : '📁';
  if (homeToggleText) homeToggleText.textContent = isCollapsed ? 'Sol Menüyü Aç' : 'Sol Menüyü Gizle (Tam Ekran)';
  if (homeActionIcon) homeActionIcon.textContent = isCollapsed ? '📂' : '📁';
}

function updateHomeDashboardInfo() {
  const countEl = document.getElementById('totalProductsCount');
  const totalCount = countEl && countEl.textContent !== '0' ? countEl.textContent : '4.925';
  
  const homeBadge = document.getElementById('homeBadgeTotalProducts');
  const homeStock = document.getElementById('homeInfoTotalStock');
  if (homeBadge) homeBadge.textContent = `${totalCount} Ürün`;
  if (homeStock) homeStock.textContent = `${totalCount} Ürün`;

  const marketName = localStorage.getItem('market_name') || 'YARENLER';
  const homeMarket = document.getElementById('homeMarketName');
  if (homeMarket) homeMarket.textContent = marketName;

  const printerSelect = document.getElementById('printerSelect');
  const homePrinter = document.getElementById('homeInfoPrinterName');
  if (homePrinter && printerSelect && printerSelect.value) {
    homePrinter.textContent = printerSelect.value;
  }

  const topbarIp = document.getElementById('topbarIp');
  const homeIp = document.getElementById('homeInfoIpAddress');
  const homeMobileUrl = document.getElementById('homeInfoMobileUrl');
  if (topbarIp && topbarIp.textContent && topbarIp.textContent !== '127.0.0.1' && !topbarIp.textContent.includes('{{')) {
    if (homeIp) homeIp.textContent = topbarIp.textContent;
    if (homeMobileUrl) {
      homeMobileUrl.textContent = `http://${topbarIp.textContent}:8000/mobile`;
      homeMobileUrl.href = `http://${topbarIp.textContent}:8000/mobile`;
    }
  }
}

async function refreshAllData() {
  showToast('Sistem ve stok verileri yenileniyor...', 'info');
  await searchProducts(document.getElementById('productSearchInput')?.value || '');
  await loadPriceChanges();
  await loadNetworkInfo();
  await loadPrinters();
  updateHomeDashboardInfo();
  showToast('Tüm veriler başarıyla güncellendi!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleSidebar();
    });
  }

  // İlk SVG barkod çizimini çalıştır
  setTimeout(() => {
    renderBarcodeSvg("#editor-barcode-svg", "8690504114925");
    updateHomeDashboardInfo();
  }, 200);
});

let currentZoom = 135;
function adjustZoom(delta) {
  currentZoom = Math.min(250, Math.max(50, currentZoom + delta));
  const el = document.getElementById('editor-shelf-label');
  const text = document.getElementById('zoomPercentText');
  if (el) el.style.transform = `scale(${currentZoom / 100})`;
  if (text) text.textContent = `${currentZoom}%`;
}

function resetZoom() {
  currentZoom = 135;
  const el = document.getElementById('editor-shelf-label');
  const text = document.getElementById('zoomPercentText');
  if (el) el.style.transform = `scale(1.35)`;
  if (text) text.textContent = '135%';
}

function onStudioSearchProduct(q) {
  const dropdown = document.getElementById('studio-stock-dropdown');
  if (!dropdown) return;

  const clean = (q || '').trim().toLowerCase();
  if (!clean) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }

  const matches = cachedProductsList.filter(p => 
    (p.title && p.title.toLowerCase().includes(clean)) ||
    (p.barcode && p.barcode.includes(clean))
  ).slice(0, 8);

  if (matches.length === 0) {
    dropdown.innerHTML = '<div style="padding:8px 12px; font-size:11px; color:#94a3b8;">Eşleşen ürün bulunamadı.</div>';
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = matches.map(p => `
    <div class="stock-item" onclick="selectProductForStudio('${(p.barcode || '').replace(/'/g, "\\'")}')">
      <div>
        <div class="stock-item-title">${p.title || ''}</div>
        <div class="stock-item-sub">Barkod: ${p.barcode || '-'}</div>
      </div>
      <div class="stock-item-price">₺ ${Number(p.price || 0).toFixed(2)}</div>
    </div>
  `).join('');

  dropdown.style.display = 'block';
}

// ==========================================================================
// 8. OYMAPOS ETİKET STÜDYOSU: CANLI SENKRONİZASYON, SÜRÜKLE-BIRAK & ÖZELLEŞTİRME
// ==========================================================================

let selectedCanvasElement = null;
let isDraggingElement = false;
let dragStartX = 0;
let dragStartY = 0;
let elemStartX = 0;
let elemStartY = 0;

function selectProductForStudio(barcode) {
  const prod = cachedProductsList.find(p => p.barcode === barcode);
  if (prod) {
    loadProductIntoStudio(prod);
  }
  const dropdown = document.getElementById('studio-stock-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

function loadProductIntoStudio(prod) {
  const fullTitle = (prod.title || 'ÜRÜN ADI').trim().toUpperCase();

  const title1El = document.getElementById('editor-lbl-title-1');
  const title2El = document.getElementById('editor-lbl-title-2');
  const brandEl = document.getElementById('editor-lbl-brand');
  const originEl = document.getElementById('editor-lbl-origin');
  const dateEl = document.getElementById('editor-lbl-date');
  const priceEl = document.getElementById('editor-lbl-price');
  const searchInp = document.getElementById('studio-product-search');

  // Sol panel form alanları
  const inpMarket = document.getElementById('studio-inp-market');
  const inpTitle1 = document.getElementById('studio-inp-title1');
  const inpTitle2 = document.getElementById('studio-inp-title2');
  const inpPrice = document.getElementById('studio-inp-price');
  const inpBarcode = document.getElementById('studio-inp-barcode');
  const inpOrigin = document.getElementById('studio-inp-origin');
  const inpDate = document.getElementById('studio-inp-date');

  const marketVal = (localStorage.getItem('market_name') || (inpMarket ? inpMarket.value : '') || document.getElementById('marketName')?.value || 'YARENLER').toUpperCase();
  const originVal = (prod.origin || 'TÜRKİYE').toUpperCase();
  const dateVal = formatTrDate(prod.price_updated_at || prod.updated_at || prod.created_at || new Date().toISOString());
  const priceVal = (typeof prod.price === 'number') ? prod.price : Number(prod.price || 0);
  const formattedPrice = `${priceVal.toFixed(2)} TL`.replace('.', ',');

  // Sahneye aktar
  if (title1El) {
    title1El.textContent = fullTitle;
    title1El.style.width = '100%';
    title1El.style.display = 'block';
  }
  if (title2El) {
    title2El.textContent = '';
    title2El.style.display = 'none';
  }
  if (brandEl) brandEl.textContent = marketVal;
  if (originEl) originEl.textContent = originVal;
  if (dateEl) dateEl.textContent = dateVal;
  if (priceEl) priceEl.textContent = formattedPrice;

  // Sol panel girdilerini canlı doldur
  if (inpMarket) inpMarket.value = marketVal;
  if (inpTitle1) inpTitle1.value = fullTitle;
  if (inpTitle2) inpTitle2.value = '';
  if (inpPrice) inpPrice.value = formattedPrice;
  if (inpBarcode) inpBarcode.value = prod.barcode || '';
  if (inpOrigin) inpOrigin.value = originVal;
  if (inpDate) inpDate.value = dateVal;

  if (searchInp) searchInp.value = prod.title || prod.barcode;

  renderBarcodeSvg("#editor-barcode-svg", prod.barcode);
  showToast(`"${prod.title || prod.barcode}" stüdyo sahnesine yüklendi!`, 'success');
}

// Sol Panel Giriş Değişikliği Fonksiyonları (Canlı Senkronize)
function onStudioMarketNameChange(val) {
  const brandEl = document.getElementById('editor-lbl-brand');
  const text = (val || '').trim() || 'YARENLER';
  if (brandEl) brandEl.textContent = text.toUpperCase();
}

function onStudioTitle1Change(val) {
  const title1El = document.getElementById('editor-lbl-title-1');
  if (title1El) title1El.textContent = (val || '').toUpperCase();
}

function onStudioTitle2Change(val) {
  const title2El = document.getElementById('editor-lbl-title-2');
  if (title2El) {
    const text = (val || '').trim();
    title2El.textContent = text.toUpperCase();
    title2El.style.display = text ? 'block' : 'none';
  }
}

function onStudioPriceInputChange(val) {
  const priceEl = document.getElementById('editor-lbl-price');
  if (priceEl) priceEl.textContent = val || '0,00 TL';
}

function onStudioBarcodeInputChange(val) {
  const code = (val || '').trim() || '8690504114925';
  renderBarcodeSvg("#editor-barcode-svg", code);
}

function onStudioOriginInputChange(val) {
  const originEl = document.getElementById('editor-lbl-origin');
  if (originEl) originEl.textContent = (val || 'TURKIYE').toUpperCase();
}

function onStudioDateInputChange(val) {
  const dateEl = document.getElementById('editor-lbl-date');
  if (dateEl) dateEl.textContent = (val || '').trim() || getTodayTrDate();
}

// Etiket Sahnesinden Sol Panele Çift Yönlü Canlı Metin Senkronu
function syncLabelText(el) {
  if (!el) return;
  const id = el.id;
  const val = el.textContent.trim();

  if (id === 'editor-lbl-title-1') {
    const inp = document.getElementById('studio-inp-title1');
    if (inp) inp.value = val;
  } else if (id === 'editor-lbl-title-2') {
    const inp = document.getElementById('studio-inp-title2');
    if (inp) inp.value = val;
  } else if (id === 'editor-lbl-brand') {
    const inp = document.getElementById('studio-inp-market');
    if (inp) inp.value = val;
  } else if (id === 'editor-lbl-origin') {
    const inp = document.getElementById('studio-inp-origin');
    if (inp) inp.value = val;
  } else if (id === 'editor-lbl-price') {
    const inp = document.getElementById('studio-inp-price');
    if (inp) inp.value = val;
  } else if (id === 'editor-lbl-date') {
    const inp = document.getElementById('studio-inp-date');
    if (inp) inp.value = val;
  }
}

// Boyut ve Punto Değişiklikleri
function onStudioLabelSizeChange(preset) {
  const labelEl = document.getElementById('editor-shelf-label');
  if (labelEl) {
    labelEl.className = `market-label ${preset} studio-canvas`;
  }
  showToast(`Etiket boyutu ${preset.replace('size-', '')} olarak ayarlandı.`, 'info');
}

function onStudioPriceSizeChange(val) {
  const priceEl = document.getElementById('editor-lbl-price');
  const textVal = document.getElementById('studio-price-size-val');
  if (priceEl) priceEl.style.fontSize = `${val}px`;
  if (textVal) textVal.textContent = `${val}px`;
}

function onStudioTitleSizeChange(val) {
  const title1El = document.getElementById('editor-lbl-title-1');
  const textVal = document.getElementById('studio-title-size-val');
  if (title1El) title1El.style.fontSize = `${val}px`;
  if (textVal) textVal.textContent = `${val}px`;
}

function onStudioTopRightChange(mode) {
  const box = document.getElementById('editor-lbl-top-right-box');
  if (!box) return;

  if (mode === 'empty') {
    box.style.display = 'none';
    box.innerHTML = '';
  } else if (mode === 'yerli') {
    box.style.display = 'flex';
    box.innerHTML = `
      <svg viewBox="0 0 160 65" width="70" height="28">
        <rect x="1" y="1" width="158" height="63" rx="3" fill="none" stroke="#000" stroke-width="2.2" />
        <path d="M10 18 L22 30 L34 18 L30 14 L22 22 L14 14 Z" fill="#000" />
        <rect x="6" y="34" width="3" height="20" fill="#000" />
        <rect x="12" y="34" width="5" height="20" fill="#000" />
        <rect x="20" y="34" width="2" height="20" fill="#000" />
        <rect x="25" y="34" width="6" height="20" fill="#000" />
        <text x="42" y="28" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="#000">YERLİ</text>
        <text x="42" y="52" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="#000">ÜRETİM</text>
      </svg>
    `;
  } else if (mode === 'discount') {
    box.style.display = 'flex';
    box.innerHTML = '<div class="tr-badge-dark" style="background:#ef4444; color:#fff; border:1px solid #b91c1c; font-weight:900;">🔥 İNDİRİM</div>';
  } else if (mode === 'unit_price') {
    box.style.display = 'flex';
    box.innerHTML = `
      <div class="tr-unit-box">
        <span class="u-label">Birim F:</span>
        <span class="u-val">250 ₺/Kg</span>
      </div>
    `;
  } else if (mode === 'custom_text') {
    box.style.display = 'flex';
    box.innerHTML = '<div class="tr-badge-dark">SÜPER FİYAT</div>';
  } else if (mode === 'qr') {
    box.style.display = 'flex';
    box.innerHTML = '<div class="tr-badge">📱 QR</div>';
  }
}

function toggleStudioElement(elemType, isVisible) {
  if (elemType === 'barcode') {
    const el = document.querySelector('.ml-barcode-col');
    if (el) el.style.display = isVisible ? 'flex' : 'none';
  } else if (elemType === 'unit-price') {
    const el = document.querySelector('.ml-divider-col');
    if (el) el.style.display = isVisible ? 'flex' : 'none';
  } else if (elemType === 'origin') {
    const el = document.getElementById('editor-lbl-origin');
    if (el && el.parentElement) el.parentElement.style.display = isVisible ? 'block' : 'none';
  } else if (elemType === 'date') {
    const el = document.getElementById('editor-lbl-date');
    if (el && el.parentElement) el.parentElement.style.display = isVisible ? 'block' : 'none';
  }
}

// ==========================================================================
// ETİKET ŞABLONLARI & VARSAYILAN ŞABLON YÖNETİMİ (GALERİ & DÜZENLEME)
// ==========================================================================

let cachedTemplates = [];
let currentActiveTemplate = null;

async function loadTemplates() {
  try {
    const res = await API.getTemplates();
    const data = res.data || res;
    if (res.status === 'success' || data.templates) {
      cachedTemplates = data.templates || [];
      const select = document.getElementById('studio-template-select');
      const activeId = data.active_template_id;

      if (select) {
        select.innerHTML = '';
        cachedTemplates.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = `${t.is_default ? '⭐ ' : ''}${t.name}`;
          if (t.id === activeId || (t.is_default && !currentActiveTemplate)) {
            opt.selected = true;
          }
          select.appendChild(opt);
        });
      }

      // Şablon kartları galerisini doldur
      renderTemplatesGrid(cachedTemplates);

      // Seçili veya varsayılan şablonu stüdyoya hazırla
      let targetTpl = cachedTemplates.find(t => t.id === (select ? select.value : activeId));
      if (!targetTpl) targetTpl = cachedTemplates.find(t => t.is_default) || cachedTemplates[0];
      if (targetTpl && !currentActiveTemplate) {
        currentActiveTemplate = targetTpl;
      }
    }
  } catch (err) {
    console.error('Şablonlar yüklenemedi:', err);
  }
}

function renderTemplatesGrid(templates) {
  const container = document.getElementById('templatesGridContainer');
  if (!container) return;

  if (!templates || templates.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8; font-size:12px; padding:20px;">Kayıtlı etiket şablonu bulunamadı.</div>';
    return;
  }

  let html = templates.map(t => {
    const isDef = !!t.is_default;
    const width = t.width_mm || 76;
    const height = t.height_mm || 40;
    return `
      <div class="template-card ${isDef ? 'is-default' : ''}">
        <div class="template-card-header">
          <span class="badge" style="background:${isDef ? 'rgba(52,211,153,0.15)' : 'rgba(56,189,248,0.15)'}; color:${isDef ? '#34d399' : '#38bdf8'}; font-weight:800; font-size:10px;">
            ${isDef ? '⭐ Varsayılan Şablon' : '📝 Özel Şablon'}
          </span>
          <span style="font-size:11px; font-weight:800; color:#94a3b8; background:rgba(255,255,255,0.06); padding:2px 7px; border-radius:4px;">
            📐 ${width} × ${height} mm
          </span>
        </div>

        <div>
          <div class="template-card-title">${t.name || 'İsimsiz Şablon'}</div>
          <div class="template-card-specs" style="margin-top:8px;">
            <span>🏷️ Barkod: <strong>${t.show_barcode !== false ? 'Açık' : 'Kapalı'}</strong></span>
            <span>💰 Fiyat: <strong>${t.price_size || 26}px</strong></span>
            <span>✏️ Başlık: <strong>${t.title_size || 12}px</strong></span>
          </div>
        </div>

        <div class="template-card-actions" style="margin-top:4px;">
          <button class="btn btn-primary btn-sm" onclick="openTemplateInEditor('${t.id}')" style="flex:1; font-weight:800; padding:6px 10px; font-size:11.5px; background:linear-gradient(135deg, #0284c7, #0369a1);">
            🎨 Düzenle & Özelleştir
          </button>
          ${!isDef ? `
            <button class="btn btn-secondary btn-sm" onclick="makeTemplateDefaultById('${t.id}')" title="Varsayılan Yap" style="font-size:11px; padding:6px 9px; color:#34d399;">
              ⭐
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="duplicateTemplateById('${t.id}')" title="Kopyasını Oluştur" style="font-size:11px; padding:6px 9px;">
            📋
          </button>
          ${!isDef ? `
            <button class="btn btn-danger btn-sm" onclick="deleteTemplateById('${t.id}')" title="Şablonu Sil" style="font-size:11px; padding:6px 9px;">
              🗑️
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Yeni Ekle Kartı
  html += `
    <div class="template-card-add" onclick="onPromptNewTemplate()">
      <div style="font-size:26px;">➕</div>
      <div>Yeni Etiket Şablonu Oluştur</div>
      <span style="font-size:10.5px; opacity:0.7;">Özel boyut ve yerleşim tanımla</span>
    </div>
  `;

  container.innerHTML = html;
}

function showTemplatesListView() {
  const listView = document.getElementById('studio-view-list');
  const editorView = document.getElementById('studio-view-editor');
  if (listView) listView.style.display = 'block';
  if (editorView) editorView.style.display = 'none';
  renderTemplatesGrid(cachedTemplates);
}

function openTemplateInEditor(tplId) {
  const tpl = cachedTemplates.find(t => t.id === tplId) || cachedTemplates[0];
  if (!tpl) return;

  const listView = document.getElementById('studio-view-list');
  const editorView = document.getElementById('studio-view-editor');
  const titleEl = document.getElementById('editor-active-tpl-title');
  const select = document.getElementById('studio-template-select');

  if (listView) listView.style.display = 'none';
  if (editorView) editorView.style.display = 'block';
  if (titleEl) titleEl.textContent = tpl.name || '';
  if (select) select.value = tpl.id;

  applyTemplateToStudio(tpl);
  showToast(`"${tpl.name}" düzenleme sahnesinde açıldı.`, 'info');
}

function onStudioTemplateSelect(tplId) {
  openTemplateInEditor(tplId);
}

function applyTemplateToStudio(tpl) {
  if (!tpl) return;
  currentActiveTemplate = tpl;

  const titleEl = document.getElementById('editor-active-tpl-title');
  if (titleEl) titleEl.textContent = tpl.name || '';

  // 1. Rozet ve Şablon Başlık Rozeti
  const tplBadge = document.getElementById('studio-tpl-badge');
  const previewBadge = document.getElementById('editor-preview-name');
  const btnSetDef = document.getElementById('btn-set-default-tpl');
  const editorBtnDef = document.getElementById('editor-btn-make-default');

  const isDef = !!tpl.is_default;
  if (tplBadge) {
    if (isDef) {
      tplBadge.textContent = '⭐ Varsayılan Şablon';
      tplBadge.style.background = 'rgba(52,211,153,0.15)';
      tplBadge.style.color = '#34d399';
    } else {
      tplBadge.textContent = '📝 Özel Şablon';
      tplBadge.style.background = 'rgba(56,189,248,0.15)';
      tplBadge.style.color = '#38bdf8';
    }
  }

  if (btnSetDef) btnSetDef.disabled = isDef;
  if (editorBtnDef) {
    editorBtnDef.disabled = isDef;
    editorBtnDef.style.opacity = isDef ? '0.5' : '1';
    editorBtnDef.textContent = isDef ? '⭐ Varsayılan Şablon' : '⭐ Varsayılan Yap';
  }

  if (previewBadge) {
    previewBadge.textContent = `${isDef ? '⭐ ' : ''}${tpl.name}`;
  }

  // 2. Etiket Ebadı Preset
  const sizeSelect = document.getElementById('studio-size-select');
  if (sizeSelect) {
    sizeSelect.value = tpl.preset || 'size-76x40';
    const labelEl = document.getElementById('editor-shelf-label');
    if (labelEl) labelEl.className = `market-label ${tpl.preset || 'size-76x40'} studio-canvas`;
  }

  // 3. Sağ Üst Rozet
  const trSelect = document.getElementById('studio-opt-top-right');
  if (trSelect) {
    trSelect.value = tpl.top_right_mode || 'empty';
    onStudioTopRightChange(tpl.top_right_mode || 'empty');
  }

  // 4. Fiyat ve Başlık Punto Sürgüleri
  const priceSlider = document.getElementById('studio-price-size-slider');
  const priceValText = document.getElementById('studio-price-size-val');
  const priceEl = document.getElementById('editor-lbl-price');
  if (priceSlider) {
    const pSize = tpl.price_size || 26;
    priceSlider.value = pSize;
    if (priceValText) priceValText.textContent = `${pSize}px`;
    if (priceEl) priceEl.style.fontSize = `${pSize}px`;
  }

  const titleSlider = document.getElementById('studio-title-size-slider');
  const titleValText = document.getElementById('studio-title-size-val');
  const title1El = document.getElementById('editor-lbl-title-1');
  if (titleSlider) {
    const tSize = tpl.title_size || 12;
    titleSlider.value = tSize;
    if (titleValText) titleValText.textContent = `${tSize}px`;
    if (title1El) title1El.style.fontSize = `${tSize}px`;
  }

  // 5. Görünür Alan Onay Kutuları
  const chkBarcode = document.getElementById('studio-chk-show-barcode');
  const chkUnit = document.getElementById('studio-chk-show-unit-price');
  const chkOrigin = document.getElementById('studio-chk-show-origin');
  const chkDate = document.getElementById('studio-chk-show-date');

  if (chkBarcode) {
    chkBarcode.checked = tpl.show_barcode !== false;
    toggleStudioElement('barcode', chkBarcode.checked);
  }
  if (chkUnit) {
    chkUnit.checked = tpl.show_unit_price !== false;
    toggleStudioElement('unit-price', chkUnit.checked);
  }
  if (chkOrigin) {
    chkOrigin.checked = tpl.show_origin !== false;
    toggleStudioElement('origin', chkOrigin.checked);
  }
  if (chkDate) {
    chkDate.checked = tpl.show_date !== false;
    toggleStudioElement('date', chkDate.checked);
  }

  // 6. Özel Eklenen Katmanları Sıfırla ve Geri Yükle
  const customLayers = document.getElementById('editor-custom-layers');
  if (customLayers) {
    customLayers.innerHTML = '';
    if (Array.isArray(tpl.custom_layers)) {
      tpl.custom_layers.forEach(l => {
        const div = document.createElement('div');
        div.className = l.className || 'custom-canvas-element draggable-item';
        div.style.left = l.left || '16px';
        div.style.top = l.top || '16px';
        div.style.fontSize = l.fontSize || '11px';
        div.style.fontWeight = l.fontWeight || 'bold';
        div.style.color = l.color || '#000';
        div.style.width = l.width || 'auto';
        div.style.height = l.height || 'auto';
        div.style.border = l.border || 'none';
        div.style.background = l.background || 'transparent';
        div.style.pointerEvents = 'auto';
        if (l.contentEditable) {
          div.contentEditable = 'true';
          div.spellcheck = false;
        }
        div.textContent = l.text || '';
        customLayers.appendChild(div);
        makeElementDraggable(div);
      });
    }
  }

  // Sürüklenen öğelerin konumlarını geri yükle
  if (tpl.offsets) {
    Object.keys(tpl.offsets).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        const off = tpl.offsets[selector];
        el.dataset.dragX = off.x || 0;
        el.dataset.dragY = off.y || 0;
        el.style.transform = `translate(${off.x || 0}px, ${off.y || 0}px)`;
      }
    });
  }
}

async function makeTemplateDefaultById(tplId) {
  try {
    const res = await API.setDefaultTemplate(tplId);
    if (res.status === 'success') {
      const target = cachedTemplates.find(t => t.id === tplId);
      showToast(`⭐ "${target ? target.name : 'Şablon'}" sistem varsayılanı yapıldı!`, 'success');
      await loadTemplates();
      if (currentActiveTemplate && currentActiveTemplate.id === tplId) {
        applyTemplateToStudio(currentActiveTemplate);
      }
    } else {
      showToast(res.message || 'Varsayılan şablon ayarlanamadı.', 'error');
    }
  } catch (err) {
    showToast('İşlem başarısız oldu.', 'error');
  }
}

async function onMakeTemplateDefault() {
  if (!currentActiveTemplate) return;
  await makeTemplateDefaultById(currentActiveTemplate.id);
}

async function onPromptNewTemplate() {
  const name = prompt('Yeni etiket şablonu için bir isim girin:', 'Özel Raf Etiketi');
  if (!name || !name.trim()) return;

  try {
    const baseId = currentActiveTemplate ? currentActiveTemplate.id : null;
    const res = await API.newTemplate(name.trim(), baseId);
    if (res.status === 'success' && res.data && res.data.template) {
      showToast(`"${name}" yeni şablon olarak oluşturuldu!`, 'success');
      await loadTemplates();
      openTemplateInEditor(res.data.template.id);
    } else {
      showToast(res.message || 'Şablon oluşturulamadı.', 'error');
    }
  } catch (err) {
    showToast('Yeni şablon oluşturulamadı.', 'error');
  }
}

async function saveCurrentTemplate() {
  if (!currentActiveTemplate) {
    showToast('Kayıt yapılacak aktif şablon bulunamadı.', 'error');
    return;
  }

  // Özel eklenen katmanları topla
  const customLayers = document.getElementById('editor-custom-layers');
  const layersData = [];
  if (customLayers) {
    customLayers.querySelectorAll('.custom-canvas-element').forEach(el => {
      layersData.push({
        className: el.className,
        left: el.style.left,
        top: el.style.top,
        fontSize: el.style.fontSize,
        fontWeight: el.style.fontWeight,
        color: el.style.color,
        width: el.style.width,
        height: el.style.height,
        border: el.style.border,
        background: el.style.background,
        contentEditable: el.isContentEditable,
        text: el.textContent
      });
    });
  }

  // Sürükleme ofsetlerini topla
  const offsets = {};
  const draggables = document.querySelectorAll('#editor-shelf-label .draggable-item');
  draggables.forEach(el => {
    const x = parseFloat(el.dataset.dragX || 0);
    const y = parseFloat(el.dataset.dragY || 0);
    if (el.id && (x !== 0 || y !== 0)) {
      offsets[`#${el.id}`] = { x, y };
    }
  });

  const tplData = {
    ...currentActiveTemplate,
    preset: document.getElementById('studio-size-select')?.value || 'size-76x40',
    top_right_mode: document.getElementById('studio-opt-top-right')?.value || 'empty',
    price_size: parseInt(document.getElementById('studio-price-size-slider')?.value || '26', 10),
    title_size: parseInt(document.getElementById('studio-title-size-slider')?.value || '12', 10),
    show_barcode: document.getElementById('studio-chk-show-barcode')?.checked !== false,
    show_unit_price: document.getElementById('studio-chk-show-unit-price')?.checked !== false,
    show_origin: document.getElementById('studio-chk-show-origin')?.checked !== false,
    show_date: document.getElementById('studio-chk-show-date')?.checked !== false,
    custom_layers: layersData,
    offsets: offsets
  };

  try {
    const res = await API.saveTemplate(tplData);
    if (res.status === 'success') {
      showToast(`💾 "${tplData.name}" şablonu ve özelleştirmeleri başarıyla kaydedildi!`, 'success');
      await loadTemplates();
      currentActiveTemplate = tplData;
    } else {
      showToast(res.message || 'Kayıt başarısız oldu.', 'error');
    }
  } catch (err) {
    showToast('Şablon kaydedilirken hata oluştu.', 'error');
  }
}

async function duplicateTemplateById(tplId) {
  const target = cachedTemplates.find(t => t.id === tplId);
  if (!target) return;
  const name = prompt('Kopya şablon için bir isim girin:', `${target.name} (Kopya)`);
  if (!name || !name.trim()) return;

  try {
    const res = await API.newTemplate(name.trim(), tplId);
    if (res.status === 'success') {
      showToast(`📋 "${name}" kopyalandı ve şablonlara eklendi.`, 'success');
      await loadTemplates();
      openTemplateInEditor(res.data?.template?.id);
    }
  } catch (err) {
    showToast('Kopyalama başarısız oldu.', 'error');
  }
}

async function duplicateCurrentTemplate() {
  if (!currentActiveTemplate) return;
  await duplicateTemplateById(currentActiveTemplate.id);
}

async function deleteTemplateById(tplId) {
  const target = cachedTemplates.find(t => t.id === tplId);
  if (!target) return;
  if (!confirm(`"${target.name}" şablonunu silmek istediğinize emin misiniz?`)) {
    return;
  }

  try {
    const res = await API.deleteTemplate(tplId);
    if (res.status === 'success') {
      showToast('Şablon başarıyla silindi.', 'info');
      currentActiveTemplate = null;
      await loadTemplates();
      showTemplatesListView();
    } else {
      showToast(res.message || 'Şablon silinemedi.', 'error');
    }
  } catch (err) {
    showToast('Şablon silinemedi.', 'error');
  }
}

async function deleteCurrentTemplate() {
  if (!currentActiveTemplate) return;
  await deleteTemplateById(currentActiveTemplate.id);
}



// ==========================================================================
// SÜRÜKLE - BIRAK & ÖĞE SEÇİM MOTORU (Canvas Drag & Drop)
// ==========================================================================

function selectCanvasElement(el) {
  if (selectedCanvasElement) {
    selectedCanvasElement.classList.remove('selected-element');
  }
  selectedCanvasElement = el;
  const delBtn = document.getElementById('btn-delete-selected-el');
  if (el) {
    el.classList.add('selected-element');
    if (delBtn) delBtn.style.display = 'inline-flex';
  } else {
    if (delBtn) delBtn.style.display = 'none';
  }
}

function onCanvasBackgroundClick(e) {
  if (e.target.classList.contains('studio-canvas-area') || e.target.id === 'editor-shelf-label' || e.target.id === 'editor-custom-layers') {
    selectCanvasElement(null);
  }
}

function deleteSelectedElement() {
  if (!selectedCanvasElement) return;
  
  if (selectedCanvasElement.classList.contains('custom-canvas-element')) {
    selectedCanvasElement.remove();
    selectCanvasElement(null);
    showToast('Öğe etiket sahnesinden silindi.', 'info');
  } else {
    selectedCanvasElement.style.display = 'none';
    selectCanvasElement(null);
    showToast('Öğe gizlendi.', 'info');
  }
}

function makeElementDraggable(el) {
  if (!el || el.dataset.draggableInitialized === 'true') return;
  el.dataset.draggableInitialized = 'true';
  el.classList.add('draggable-item');

  el.addEventListener('pointerdown', (e) => {
    if (e.target.isContentEditable && document.activeElement === e.target) {
      selectCanvasElement(el);
      return;
    }

    e.stopPropagation();
    selectCanvasElement(el);

    isDraggingElement = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const transform = window.getComputedStyle(el).transform;
    let curX = 0;
    let curY = 0;
    if (transform && transform !== 'none') {
      const matrix = transform.match(/^matrix\((.+)\)$/);
      if (matrix) {
        const parts = matrix[1].split(', ');
        curX = parseFloat(parts[4]) || 0;
        curY = parseFloat(parts[5]) || 0;
      }
    } else {
      curX = parseFloat(el.dataset.dragX || 0);
      curY = parseFloat(el.dataset.dragY || 0);
    }

    elemStartX = curX;
    elemStartY = curY;

    el.classList.add('dragging');

    const onPointerMove = (moveEvt) => {
      if (!isDraggingElement) return;
      const zoomFactor = (currentZoom || 135) / 100;
      const dx = (moveEvt.clientX - dragStartX) / zoomFactor;
      const dy = (moveEvt.clientY - dragStartY) / zoomFactor;

      const newX = Math.round(elemStartX + dx);
      const newY = Math.round(elemStartY + dy);

      el.dataset.dragX = newX;
      el.dataset.dragY = newY;
      el.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const onPointerUp = () => {
      isDraggingElement = false;
      el.classList.remove('dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

function initStudioDragAndDrop() {
  const draggables = document.querySelectorAll(
    '#editor-shelf-label .draggable-item, ' +
    '#editor-shelf-label .ml-top-row, ' +
    '#editor-shelf-label .ml-mid-row, ' +
    '#editor-shelf-label .ml-bottom-row, ' +
    '#editor-shelf-label .ml-title-area, ' +
    '#editor-shelf-label .ml-brand-col, ' +
    '#editor-shelf-label .ml-legal-col, ' +
    '#editor-shelf-label .ml-barcode-col, ' +
    '#editor-shelf-label .ml-divider-col, ' +
    '#editor-shelf-label .ml-price-col'
  );
  draggables.forEach(el => makeElementDraggable(el));

  // İlk SVG Barkodu oluştur
  renderBarcodeSvg("#editor-barcode-svg", "8690504114925");

  // Bugünün güncel dinamik tarihini yerleştir
  const todayDate = getTodayTrDate();
  const dateEl = document.getElementById('editor-lbl-date');
  const inpDate = document.getElementById('studio-inp-date');
  if (dateEl) dateEl.textContent = todayDate;
  if (inpDate) inpDate.value = todayDate;

  // Klavye Delete / Backspace ile seçili öğeyi silme desteği
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCanvasElement) {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return;
      }
      e.preventDefault();
      deleteSelectedElement();
    }
  });
}

function addTextElement() {
  const layers = document.getElementById('editor-custom-layers');
  if (!layers) return;
  const div = document.createElement('div');
  div.className = 'custom-canvas-element draggable-item editable-text';
  div.contentEditable = 'true';
  div.spellcheck = false;
  div.style.left = '16px';
  div.style.top = '16px';
  div.style.fontSize = '12px';
  div.style.fontWeight = '900';
  div.style.color = '#000';
  div.style.padding = '2px 4px';
  div.style.background = 'rgba(255,255,255,0.7)';
  div.style.pointerEvents = 'auto';
  div.textContent = 'ÖZEL METİN';
  
  div.addEventListener('input', () => syncLabelText(div));
  layers.appendChild(div);
  makeElementDraggable(div);
  selectCanvasElement(div);
  showToast('Yeni metin alanı eklendi (sürükleyip düzenleyebilirsiniz).', 'success');
}

function addLineElement() {
  const layers = document.getElementById('editor-custom-layers');
  if (!layers) return;
  const line = document.createElement('div');
  line.className = 'custom-canvas-element draggable-item';
  line.style.left = '16px';
  line.style.top = '35px';
  line.style.width = '120px';
  line.style.height = '2px';
  line.style.background = '#000';
  line.style.pointerEvents = 'auto';
  
  layers.appendChild(line);
  makeElementDraggable(line);
  selectCanvasElement(line);
  showToast('Çizgi eklendi (sürükleyip yerleştirebilirsiniz).', 'success');
}

function addBoxElement() {
  const layers = document.getElementById('editor-custom-layers');
  if (!layers) return;
  const box = document.createElement('div');
  box.className = 'custom-canvas-element draggable-item editable-text';
  box.contentEditable = 'true';
  box.spellcheck = false;
  box.style.left = '16px';
  box.style.top = '20px';
  box.style.width = '70px';
  box.style.height = '24px';
  box.style.border = '1.5px solid #000';
  box.style.background = 'rgba(255,255,255,0.9)';
  box.style.fontSize = '9px';
  box.style.fontWeight = '900';
  box.style.display = 'flex';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'center';
  box.style.pointerEvents = 'auto';
  box.textContent = 'KUTU';

  layers.appendChild(box);
  makeElementDraggable(box);
  selectCanvasElement(box);
  showToast('Kutu eklendi (sürükleyip düzenleyebilirsiniz).', 'success');
}

// ==========================================================================
// 8. A4 ÇOKLU ETİKET DİZGİSİ VE YAZDIRMA (24'lü, 40'lı, 65'li A4 ŞABLONLARI)
// ==========================================================================

function openA4SheetModal() {
  const modal = document.getElementById('modal-a4-sheet');
  if (modal) modal.style.display = 'flex';
}

function closeA4SheetModal() {
  const modal = document.getElementById('modal-a4-sheet');
  if (modal) modal.style.display = 'none';
}

async function generateAndPrintA4Sheet() {
  const preset = document.getElementById('a4-sheet-preset-select')?.value || 'a4-24';
  const scope = document.querySelector('input[name="a4-scope"]:checked')?.value || 'filtered';

  closeA4SheetModal();
  showToast('A4 etiket sayfası hazırlanıyor...', 'info');

  try {
    const searchVal = document.getElementById('productSearchInput')?.value || '';
    const onlyDiff = scope === 'diff_only';
    const res = await API.searchProducts(searchVal, 200, false, onlyDiff);
    const products = (res.data && res.data.products) || [];

    if (products.length === 0) {
      showToast('Yazdırılacak ürün bulunamadı.', 'error');
      return;
    }

    let cols = 3, rows = 8, cellW = '70mm', cellH = '37mm';
    if (preset === 'a4-40') {
      cols = 4; rows = 10; cellW = '52.5mm'; cellH = '29.7mm';
    } else if (preset === 'a4-65') {
      cols = 5; rows = 13; cellW = '38mm'; cellH = '21.2mm';
    }

    const marketName = (localStorage.getItem('market_name') || 'YARENLER').toUpperCase();
    const dateStr = new Date().toLocaleDateString('tr-TR');

    const printWin = window.open('', '_blank', 'width=1000,height=800');
    if (!printWin) {
      showToast('Pop-up tarayıcı tarafından engellendi. Lütfen izin verin.', 'error');
      return;
    }

    let itemsHtml = '';
    products.forEach((p, idx) => {
      const priceStr = Number(p.price || 0).toFixed(2).replace('.', ',') + ' TL';
      const cleanTitle = (p.title || '').slice(0, cols === 3 ? 32 : (cols === 4 ? 24 : 18)).toUpperCase();
      
      itemsHtml += `
        <div class="a4-label-cell">
          <div class="a4-lbl-header">
            <span class="a4-lbl-brand">${marketName}</span>
            <span class="a4-lbl-date">${dateStr}</span>
          </div>
          <div class="a4-lbl-title">${cleanTitle}</div>
          <div class="a4-lbl-bottom">
            <div class="a4-lbl-bc">
              <svg id="bc-svg-${idx}" class="barcode-svg"></svg>
            </div>
            <div class="a4-lbl-price">${priceStr}</div>
          </div>
        </div>
      `;
    });

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>A4 Etiket Dizgisi - OYMAPOS</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <style>
          @page { size: A4 portrait; margin: 8mm 5mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
          body { background: #fff; color: #000; padding: 0; }
          .a4-grid {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: 1.5mm;
            page-break-inside: avoid;
          }
          .a4-label-cell {
            border: 1px dashed #999;
            height: ${cellH};
            padding: 2mm 2.5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            background: #fff;
          }
          .a4-lbl-header {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            font-weight: 800;
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
            text-transform: uppercase;
          }
          .a4-lbl-title {
            font-size: ${cols === 3 ? '11px' : (cols === 4 ? '9px' : '7.5px')};
            font-weight: 900;
            margin: 1.5px 0;
            line-height: 1.15;
            color: #000;
          }
          .a4-lbl-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
          }
          .a4-lbl-bc svg {
            max-height: ${cols === 3 ? '22px' : (cols === 4 ? '18px' : '14px')};
            width: auto;
          }
          .a4-lbl-price {
            font-size: ${cols === 3 ? '16px' : (cols === 4 ? '13px' : '10px')};
            font-weight: 900;
            white-space: nowrap;
            letter-spacing: -0.3px;
          }
          @media print {
            .no-print { display: none !important; }
            .a4-label-cell { border-color: #ddd; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background:#0f172a; color:#fff; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <strong>📄 A4 Çoklu Etiket Dizgisi (${products.length} Ürün)</strong>
            <span style="font-size:12px; color:#94a3b8; margin-left:10px;">${cols} Sütun × ${rows} Satır</span>
          </div>
          <button onclick="window.print()" style="background:#0284c7; color:#fff; font-weight:800; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; font-size:14px;">🖨️ Sayfayı Yazdır (PDF)</button>
        </div>
        <div class="a4-grid">
          ${itemsHtml}
        </div>
        <script>
          window.onload = function() {
            ${products.map((p, idx) => `
              try {
                if ('${p.barcode}') {
                  JsBarcode("#bc-svg-${idx}", "${p.barcode}", { format: "${(p.barcode && p.barcode.length === 13 && !isNaN(p.barcode)) ? 'EAN13' : 'CODE128'}", width: 1.2, height: 25, displayValue: false, margin: 0 });
                }
              } catch(e) {}
            `).join('\n')}
          };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
    showToast(`${products.length} ürün A4 etiket dizgisine aktarıldı!`, 'success');
  } catch (err) {
    showToast('A4 dizgi hatası: ' + err.message, 'error');
  }
}

// ==========================================================================
// 9. SİSTEM VE VERİTABANI YEDEKTEN GERİ YÜKLEME
// ==========================================================================

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



