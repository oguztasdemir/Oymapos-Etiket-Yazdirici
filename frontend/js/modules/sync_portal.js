// ==========================================================================
// TOPLU ÜRÜN & FİYAT AKTARIM PORTALI (SYNC_PORTAL.JS)
// ==========================================================================

let comparisonData = null;
let currentFilter = 'all';
let searchQuery = '';

// İNTERAKTİF EXCEL TABLO VERİ MODELİ
let gridColumns = [
  { id: 'barcode', title: 'BARKOD', width: '170px', type: 'barcode' },
  { id: 'title', title: 'ÜRÜN ADI (MALINCINSI)', width: 'auto', type: 'title' },
  { id: 'price', title: 'SATIŞ FİYATI', width: '140px', type: 'price' },
  { id: 'stock_code', title: 'STOK KODU', width: '130px', type: 'text' }
];

let gridRows = [
  { barcode: '8690577018120', title: 'SOKE UN 1 KG GELENEKSEL', price: '48,50 TL', stock_code: 'UN001' },
  { barcode: '8691375640100', title: 'BIZIM CORBA EZOGELIN 80 GR', price: '32,00 TL', stock_code: 'CRB002' },
  { barcode: '8690504034016', title: 'ULKER COKOKREM 400 GR', price: '75,00 TL', stock_code: 'KRM003' },
  { barcode: '8690637012345', title: 'DOGUS CAY FILIZ 1000 GR', price: '165,00 TL', stock_code: 'CY004' },
  { barcode: '8690555112233', title: 'PINAR SUT 1 LT TAM YAGLI', price: '42,50 TL', stock_code: 'ST005' },
  { barcode: '8690777889900', title: 'YUDUM AYCICEK YAGI 1 LT', price: '95,00 TL', stock_code: 'YG006' }
];

function saveSyncPortalStorage() {
  try {
    localStorage.setItem('sync_portal_columns', JSON.stringify(gridColumns));
    localStorage.setItem('sync_portal_rows', JSON.stringify(gridRows));
    if (comparisonData) {
      localStorage.setItem('sync_portal_comparison', JSON.stringify(comparisonData));
    } else {
      localStorage.removeItem('sync_portal_comparison');
    }
  } catch (e) {}
}

function loadSyncPortalStorage() {
  try {
    const savedCols = localStorage.getItem('sync_portal_columns');
    const savedRows = localStorage.getItem('sync_portal_rows');
    const savedComp = localStorage.getItem('sync_portal_comparison');

    if (savedCols) {
      const parsedCols = JSON.parse(savedCols);
      if (Array.isArray(parsedCols) && parsedCols.length > 0) gridColumns = parsedCols;
    }
    if (savedRows) {
      const parsedRows = JSON.parse(savedRows);
      if (Array.isArray(parsedRows)) gridRows = parsedRows;
    }
    if (savedComp) {
      const parsedComp = JSON.parse(savedComp);
      if (parsedComp && parsedComp.items) {
        comparisonData = parsedComp;
        setTimeout(() => {
          renderComparisonView();
        }, 50);
      }
    }
  } catch (e) {}
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// TABLOYU EKRANA ÇİZ (RENDER)
function renderExcelGrid() {
  const thead = document.getElementById('gridThead');
  const tbody = document.getElementById('gridTbody');
  if (!thead || !tbody) return;

  // Başlıkları çiz
  let thHtml = `<tr>
    <th style="width: 44px; text-align: center;">#</th>`;
  
  gridColumns.forEach((col, cIdx) => {
    thHtml += `
      <th style="min-width: ${col.width || '120px'};">
        <div class="th-content">
          <span style="color: #38bdf8; font-weight: 800;">${col.title}</span>
          ${gridColumns.length > 2 ? `<span class="btn-del-col" onclick="gridDeleteColumn(${cIdx})" title="Bu sütunu sil">✕</span>` : ''}
        </div>
      </th>
    `;
  });
  thHtml += `<th style="width: 40px; text-align:center;">İşlem</th></tr>`;
  thead.innerHTML = thHtml;

  // Satırları çiz
  let tbHtml = '';
  gridRows.forEach((row, rIdx) => {
    tbHtml += `<tr>
      <td class="row-num-cell">${rIdx + 1}</td>`;

    gridColumns.forEach((col) => {
      const val = row[col.id] !== undefined ? row[col.id] : '';
      let inputClass = 'grid-cell-input';
      if (col.type === 'price') inputClass += ' price-input';
      else if (col.type === 'barcode') inputClass += ' barcode-input';
      else if (col.type === 'title') inputClass += ' title-input';

      tbHtml += `
        <td>
          <input type="text" class="${inputClass}" value="${escapeHtml(val)}" 
            oninput="onCellInput(${rIdx}, '${col.id}', this.value)"
            data-row="${rIdx}" data-col="${col.id}">
        </td>
      `;
    });

    tbHtml += `
      <td class="row-action-cell">
        <button type="button" onclick="gridDeleteRow(${rIdx})" title="Bu satırı sil">🗑️</button>
      </td>
    </tr>`;
  });

  tbody.innerHTML = tbHtml;
  updateGridStats();
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function onCellInput(rowIdx, colId, value) {
  if (gridRows[rowIdx]) {
    gridRows[rowIdx][colId] = value;
  }
}

function updateGridStats() {
  saveSyncPortalStorage();
  const statsEl = document.getElementById('clipboardStatsText');
  const badge = document.getElementById('clipboardCountBadge');
  const count = gridRows.length;
  const colCount = gridColumns.length;

  if (badge) {
    badge.textContent = `${count} Satır (${colCount} Sütun)`;
  }
  if (statsEl) {
    if (count === 0) {
      statsEl.innerHTML = '<span>ℹ️</span> Tablo boş. <strong>"Satır Ekle"</strong> butonuna basabilir veya doğrudan klavyeden <strong>Ctrl + V</strong> ile Excel verinizi yapıştırabilirsiniz.';
    } else {
      statsEl.innerHTML = `<span style="color: #38bdf8; font-weight: 700;">✓ ${count} adet ürün hazır.</span> Sağ üstteki <strong>"Veri Gönder & Karşılaştır"</strong> butonuna tıklayarak ana bilgisayara aktarabilirsiniz.`;
    }
  }
}

// YENİ SATIR EKLE
function gridAddRow() {
  const newBarcode = '8690000' + Math.floor(100000 + Math.random() * 900000);
  const newRow = {};
  gridColumns.forEach(c => {
    if (c.id === 'barcode') newRow[c.id] = newBarcode;
    else if (c.id === 'title') newRow[c.id] = 'YENİ ÜRÜN';
    else if (c.id === 'price') newRow[c.id] = '50,00 TL';
    else if (c.id === 'stock_code') newRow[c.id] = 'STK' + Math.floor(100 + Math.random() * 900);
    else newRow[c.id] = '-';
  });
  gridRows.push(newRow);
  renderExcelGrid();
  showToast('Yeni satır eklendi.', 'info');
  const container = document.getElementById('excelSheetWrapper');
  if (container) container.scrollTop = container.scrollHeight;
}

// YENİ SÜTUN EKLE
function gridAddColumn() {
  const colTitle = prompt('Eklemek istediğiniz yeni sütun adını girin (Örn: MARKA, KDV, KATEGORİ, ALIŞ FİYATI):', 'MARKA');
  if (!colTitle || !colTitle.trim()) return;

  const newId = 'col_' + Date.now();
  gridColumns.push({
    id: newId,
    title: colTitle.trim().toUpperCase(),
    width: '140px',
    type: colTitle.toLowerCase().includes('fiyat') ? 'price' : 'text'
  });

  gridRows.forEach(row => {
    row[newId] = '-';
  });

  renderExcelGrid();
  showToast(`'${colTitle.trim().toUpperCase()}' sütunu eklendi.`, 'success');
}

// SATIR SİL
function gridDeleteRow(idx) {
  if (idx >= 0 && idx < gridRows.length) {
    gridRows.splice(idx, 1);
    renderExcelGrid();
  }
}

// SÜTUN SİL
function gridDeleteColumn(colIdx) {
  if (gridColumns.length <= 2) {
    showToast('En az 2 sütun kalmalıdır.', 'error');
    return;
  }
  const col = gridColumns[colIdx];
  if (confirm(`'${col.title}' sütununu silmek istediğinizden emin misiniz?`)) {
    const delId = col.id;
    gridColumns.splice(colIdx, 1);
    gridRows.forEach(r => { delete r[delId]; });
    renderExcelGrid();
    showToast(`'${col.title}' sütunu silindi.`, 'info');
  }
}

// ÖRNEK VERİLERİ YÜKLE
function gridInsertSample() {
  gridColumns = [
    { id: 'barcode', title: 'BARKOD', width: '170px', type: 'barcode' },
    { id: 'title', title: 'ÜRÜN ADI (MALINCINSI)', width: 'auto', type: 'title' },
    { id: 'price', title: 'SATIŞ FİYATI', width: '140px', type: 'price' },
    { id: 'stock_code', title: 'STOK KODU', width: '130px', type: 'text' }
  ];
  gridRows = [
    { barcode: '8690577018120', title: 'SOKE UN 1 KG GELENEKSEL', price: '48,50 TL', stock_code: 'UN001' },
    { barcode: '8691375640100', title: 'BIZIM CORBA EZOGELIN 80 GR', price: '32,00 TL', stock_code: 'CRB002' },
    { barcode: '8690504034016', title: 'ULKER COKOKREM 400 GR', price: '75,00 TL', stock_code: 'KRM003' },
    { barcode: '8690637012345', title: 'DOGUS CAY FILIZ 1000 GR', price: '165,00 TL', stock_code: 'CY004' },
    { barcode: '8690555112233', title: 'PINAR SUT 1 LT TAM YAGLI', price: '42,50 TL', stock_code: 'ST005' },
    { barcode: '8690777889900', title: 'YUDUM AYCICEK YAGI 1 LT', price: '95,00 TL', stock_code: 'YG006' }
  ];
  renderExcelGrid();
  showToast('Örnek ürün tablosu yüklendi.', 'success');
}

// TÜMÜNÜ TEMİZLE
function gridClearAll() {
  gridRows = [];
  renderExcelGrid();
  saveSyncPortalStorage();
  showToast('Tablo temizlendi.', 'info');
}

// PANODAN OTOMATİK OKU VE YAPIŞTIR
async function gridClearAndPaste() {
  try {
    let clipboardText = '';
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        clipboardText = await navigator.clipboard.readText();
      } catch (e) {}
    }
    if (!clipboardText || !clipboardText.trim()) {
      try {
        const res = await fetch('/api/system/get-clipboard');
        const json = await res.json();
        if (json.status === 'success' && json.data?.clipboard_text) {
          clipboardText = json.data.clipboard_text;
        }
      } catch (e) {}
    }

    if (!clipboardText || !clipboardText.trim()) {
      showToast('Panoda kopyalanmış herhangi bir metin bulunamadı. Lütfen önce Excel\'den kopyalayın.', 'warning');
      return;
    }

    gridRows = [];
    parseAndPopulateGridFromText(clipboardText);
  } catch (err) {
    showToast('Yapıştırma hatası: ' + err.message, 'error');
  }
}

// EVRENSEL PASTE (CTRL+V) DİNLENMESİ
document.addEventListener('paste', function (e) {
  if (e.target && e.target.id === 'tableSearchInput') return;
  if (e.target && e.target.id === 'deviceNameInput') return;

  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  const pastedData = clipboardData.getData('Text');
  if (!pastedData || !pastedData.trim()) return;

  const lines = pastedData.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return;

  const firstLine = lines[0];
  const hasDelim = firstLine.includes('\t') || firstLine.includes(';') || (firstLine.includes(',') && lines.length > 1);

  if (lines.length > 1 || hasDelim) {
    e.preventDefault();
    parseAndPopulateGridFromText(pastedData);
  }
});

function showSyncProgress(title, subtitle, icon = '📋') {
  const overlay = document.getElementById('syncPortalProgressOverlay');
  if (!overlay) return;
  const tEl = document.getElementById('syncPortalProgressTitle');
  const sEl = document.getElementById('syncPortalProgressSubtitle');
  const iEl = document.getElementById('syncPortalProgressIcon');
  const fill = document.getElementById('syncPortalProgressBarFill');
  const count = document.getElementById('syncPortalProgressCount');
  const percent = document.getElementById('syncPortalProgressPercent');

  if (tEl) tEl.textContent = title;
  if (sEl) sEl.textContent = subtitle;
  if (iEl) iEl.textContent = icon;
  if (fill) fill.style.width = '0%';
  if (count) count.textContent = '0 / 0 Ürün';
  if (percent) percent.textContent = '%0';

  overlay.style.display = 'flex';
}

function updateSyncProgress(current, total, statusText = '') {
  const fill = document.getElementById('syncPortalProgressBarFill');
  const count = document.getElementById('syncPortalProgressCount');
  const percent = document.getElementById('syncPortalProgressPercent');
  const sEl = document.getElementById('syncPortalProgressSubtitle');

  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (fill) fill.style.width = `${pct}%`;
  if (count) count.textContent = `${current.toLocaleString('tr-TR')} / ${total.toLocaleString('tr-TR')} Ürün`;
  if (percent) percent.textContent = `%${pct}`;
  if (statusText && sEl) sEl.textContent = statusText;
}

function hideSyncProgress() {
  const overlay = document.getElementById('syncPortalProgressOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

async function parseAndPopulateGridFromText(rawText) {
  const lines = rawText.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return;

  showSyncProgress('Pano Tablosu Yapıştırılıyor...', 'Satırlar ayrıştırılıyor ve tabloya yükleniyor...', '📋');
  updateSyncProgress(0, lines.length, `${lines.length} satır hazırlandı...`);
  await new Promise(r => setTimeout(r, 20));

  const sample = lines.slice(0, 10);
  const tabCount = sample.reduce((acc, l) => acc + (l.split('\t').length - 1), 0);
  const semiCount = sample.reduce((acc, l) => acc + (l.split(';').length - 1), 0);
  const commaCount = sample.reduce((acc, l) => acc + (l.split(',').length - 1), 0);

  let delim = '\t';
  if (semiCount > tabCount && semiCount > commaCount) delim = ';';
  else if (commaCount > tabCount && commaCount > semiCount) delim = ',';

  const splitRows = lines.map(line => line.split(delim).map(c => c.trim()));
  if (splitRows.length === 0) {
    hideSyncProgress();
    return;
  }

  const firstRow = splitRows[0];
  const firstRowLower = firstRow.map(c => c.toLowerCase());
  const hasHeaders = firstRowLower.some(c => 
    c.includes('barkod') || c.includes('barcode') || c.includes('fiyat') || c.includes('satis') || c.includes('urun') || c.includes('malin') || c.includes('stok')
  );

  let headers = [];
  let dataRows = [];

  if (hasHeaders) {
    headers = firstRow;
    dataRows = splitRows.slice(1);
  } else {
    headers = firstRow.map((_, i) => {
      if (i === 0) return 'BARKOD';
      if (i === 1) return 'ÜRÜN ADI';
      if (i === 2) return 'SATIŞ FİYATI';
      if (i === 3) return 'STOK KODU';
      return `SÜTUN ${i + 1}`;
    });
    dataRows = splitRows;
  }

  gridColumns = headers.map((h, i) => {
    const hLower = h.toLowerCase();
    let colType = 'text';
    if (hLower.includes('barkod') || hLower.includes('barcode') || hLower.includes('ean')) colType = 'barcode';
    else if (hLower.includes('fiyat') || hLower.includes('price') || hLower.includes('satis') || hLower.includes('tutar')) colType = 'price';
    else if (hLower.includes('urun') || hLower.includes('ürün') || hLower.includes('malin') || hLower.includes('ad') || hLower.includes('title')) colType = 'title';

    return {
      id: 'col_' + i,
      title: h.toUpperCase(),
      width: colType === 'title' ? 'auto' : (colType === 'barcode' ? '170px' : '140px'),
      type: colType
    };
  });

  const parsedRows = [];
  const CHUNK_SIZE = 500;
  for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, dataRows.length);
    for (let idx = i; idx < end; idx++) {
      const rowVals = dataRows[idx];
      const rowObj = {};
      gridColumns.forEach((col, cIdx) => {
        rowObj[col.id] = rowVals[cIdx] !== undefined ? rowVals[cIdx] : '';
      });
      parsedRows.push(rowObj);
    }
    updateSyncProgress(end, dataRows.length, `${end} / ${dataRows.length} ürün işlendi...`);
    await new Promise(r => setTimeout(r, 10));
  }

  gridRows = parsedRows;
  updateSyncProgress(dataRows.length, dataRows.length, 'Tablo render ediliyor...');
  await new Promise(r => setTimeout(r, 20));

  renderExcelGrid();
  hideSyncProgress();
  showToast(`Excel'den ${gridRows.length} satır ve ${gridColumns.length} sütun başarıyla yapıştırıldı!`, 'success');
}

// TABLODAKİ VERİLERİ GÖNDER & KARŞILAŞTIR
async function processClipboardData() {
  if (gridRows.length === 0) {
    showToast('Tabloda gönderilecek ürün verisi bulunmuyor. Lütfen satır ekleyin veya Ctrl+V ile yapıştırın.', 'error');
    return;
  }

  const headerLine = gridColumns.map(c => c.title).join('\t');
  const dataLines = gridRows.map(row => {
    return gridColumns.map(col => row[col.id] || '').join('\t');
  });
  const rawTsv = [headerLine, ...dataLines].join('\n');

  const devName = (document.getElementById('deviceNameInput')?.value || 'Dükkan Kasa Bilgisayarı').trim();
  const btn = document.getElementById('btnProcessClipboard');
  const originalText = btn ? btn.innerHTML : '';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Çözümleniyor...';
  }

  showSyncProgress('Ürünler Gönderiliyor & Karşılaştırılıyor...', `${gridRows.length} ürün ana bilgisayara iletiliyor...`, '🚀');
  updateSyncProgress(0, gridRows.length, 'Sunucuya gönderiliyor...');

  try {
    const formData = new FormData();
    formData.append('raw_text', rawTsv);
    formData.append('device_name', devName);

    updateSyncProgress(Math.floor(gridRows.length * 0.5), gridRows.length, 'Ana PC fiyatları ve isimleri karşılaştırıyor...');

    const res = await fetch('/api/vegawin/preview-clipboard', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    updateSyncProgress(gridRows.length, gridRows.length, 'Karşılaştırma tamamlandı!');
    await new Promise(r => setTimeout(r, 200));
    hideSyncProgress();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }

    if (result.status === 'success' && result.data) {
      comparisonData = result.data;
      renderComparisonView();
      showToast(`Tablodan ${comparisonData.total_incoming || 0} ürün başarıyla çözümlendi ve karşılaştırıldı!`, 'success');
    } else {
      showToast('Okuma Hatası: ' + (result.message || 'Ürünler ayrıştırılamadı.'), 'error');
    }
  } catch (err) {
    hideSyncProgress();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
    showToast('Bağlantı hatası: ' + err.message, 'error');
  }
}

// Karşılaştırma Ekranını Doldur
function renderComparisonView() {
  if (!comparisonData) return;

  document.getElementById('stepUploadCard').style.display = 'none';
  document.getElementById('stepComparisonCard').style.display = 'block';
  document.getElementById('stepResultCard').style.display = 'none';

  document.getElementById('previewSourceLabel').textContent = `${comparisonData.source_filename || 'Kopyalanan Tablo'} (${comparisonData.device_name || 'Bu PC'})`;

  document.getElementById('statTotalPreview').textContent = comparisonData.total_incoming || 0;
  document.getElementById('statPriceChangePreview').textContent = comparisonData.price_changes || comparisonData.price_change_count || 0;
  document.getElementById('statNewProductPreview').textContent = comparisonData.new_products || comparisonData.new_product_count || 0;
  document.getElementById('statIdenticalPreview').textContent = comparisonData.identical || comparisonData.identical_count || 0;

  document.getElementById('chipCountAll').textContent = `(${comparisonData.total_incoming || 0})`;
  document.getElementById('chipCountChanges').textContent = `(${comparisonData.price_changes || comparisonData.price_change_count || 0})`;
  document.getElementById('chipCountNew').textContent = `(${comparisonData.new_products || comparisonData.new_product_count || 0})`;
  document.getElementById('chipCountIdentical').textContent = `(${comparisonData.identical || comparisonData.identical_count || 0})`;

  renderTableRows();
}

function setFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`filter-btn-${filterType}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderTableRows();
}

function onSearchTable(query) {
  searchQuery = (query || '').toLowerCase().trim();
  renderTableRows();
}

function formatPrice(val) {
  if (val === null || val === undefined) return '-';
  return Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

let comparisonCurrentPage = 1;
const COMPARISON_PAGE_SIZE = 100;

function renderTableRows() {
  if (!comparisonData || !comparisonData.items) return;
  const tbody = document.getElementById('diffTableBody');
  const items = comparisonData.items;

  let filtered = items.filter(item => {
    if (currentFilter !== 'all' && item.status !== currentFilter) return false;
    if (searchQuery) {
      const b = (item.barcode || '').toLowerCase();
      const mt = (item.main_title || '').toLowerCase();
      const it = (item.incoming_title || '').toLowerCase();
      const sc = (item.stock_code || '').toLowerCase();
      if (!b.includes(searchQuery) && !mt.includes(searchQuery) && !it.includes(searchQuery) && !sc.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / COMPARISON_PAGE_SIZE));
  if (comparisonCurrentPage > totalPages) comparisonCurrentPage = 1;

  const startIndex = (comparisonCurrentPage - 1) * COMPARISON_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + COMPARISON_PAGE_SIZE);

  document.getElementById('tableShowingText').innerHTML = `
    Görüntülenen: <strong>${Math.min(startIndex + 1, totalFiltered)} - ${Math.min(startIndex + pageItems.length, totalFiltered)}</strong> / <strong>${totalFiltered}</strong> ürün (Toplam: ${items.length})
    ${totalPages > 1 ? `
      <span style="margin-left: 12px; display: inline-flex; gap: 4px; align-items: center;">
        <button class="btn btn-secondary btn-sm" onclick="changeComparisonPage(1)" ${comparisonCurrentPage === 1 ? 'disabled' : ''} style="padding: 2px 6px; font-size: 11px;">⏮</button>
        <button class="btn btn-secondary btn-sm" onclick="changeComparisonPage(${comparisonCurrentPage - 1})" ${comparisonCurrentPage === 1 ? 'disabled' : ''} style="padding: 2px 8px; font-size: 11px;">◀</button>
        <span style="font-size: 11px; font-weight: 700; color: #38bdf8; padding: 0 4px;">Sayfa ${comparisonCurrentPage} / ${totalPages}</span>
        <button class="btn btn-secondary btn-sm" onclick="changeComparisonPage(${comparisonCurrentPage + 1})" ${comparisonCurrentPage >= totalPages ? 'disabled' : ''} style="padding: 2px 8px; font-size: 11px;">▶</button>
        <button class="btn btn-secondary btn-sm" onclick="changeComparisonPage(${totalPages})" ${comparisonCurrentPage >= totalPages ? 'disabled' : ''} style="padding: 2px 6px; font-size: 11px;">⏭</button>
      </span>
    ` : ''}
  `;

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:36px; color:#94a3b8;">
          🔍 Seçilen filtrelere uygun ürün bulunamadı.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  pageItems.forEach(item => {
    let badgeHtml = '';
    let diffHtml = '';
    let mainPriceStr = item.main_price !== null ? formatPrice(item.main_price) : '<span style="color:#64748b;">(Yok)</span>';
    let incomingPriceStr = formatPrice(item.incoming_price);

    if (item.status === 'price_change') {
      badgeHtml = `<span class="badge-pill badge-price-change">⚡ Fiyat Değişti</span>`;
      const sign = item.diff_amount > 0 ? '+' : '';
      const diffClass = item.diff_amount > 0 ? 'price-diff-up' : 'price-diff-down';
      diffHtml = `<span class="${diffClass}">${sign}${item.diff_amount.toFixed(2)} TL (%${item.diff_percent > 0 ? '+' : ''}${item.diff_percent})</span>`;
    } else if (item.status === 'new_product') {
      badgeHtml = `<span class="badge-pill badge-new-product">✨ Yeni Ürün</span>`;
      diffHtml = `<span class="price-diff-up">+${incomingPriceStr}</span>`;
    } else if (item.status === 'title_change') {
      badgeHtml = `<span class="badge-pill" style="background: rgba(37, 99, 235, 0.15); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.3);">📝 İsim Değişti</span>`;
      diffHtml = `<span class="price-diff-zero">0,00 TL</span>`;
    } else {
      badgeHtml = `<span class="badge-pill badge-identical">✅ Birebir Aynı</span>`;
      diffHtml = `<span class="price-diff-zero">0,00 TL</span>`;
    }

    const mainTitle = item.main_title ? item.main_title : '<span style="color:#64748b; font-style:italic;">(Ana sistemde henüz kayıtlı değil)</span>';
    const incomingTitle = item.incoming_title || '-';

    html += `
      <tr>
        <td style="font-family:'JetBrains Mono', monospace; font-weight:700; color:#818cf8; font-size:12px;">
          ${item.barcode || '<span style="color:#64748b;">Barkodsuz</span>'}
        </td>
        <td style="color:${item.main_title ? '#f1f5f9' : '#64748b'}; font-weight:600;">
          ${mainTitle}
        </td>
        <td style="color:#38bdf8; font-weight:700;">
          ${incomingTitle}
        </td>
        <td style="text-align:right; font-family:'JetBrains Mono', monospace; color:#cbd5e1;">
          ${mainPriceStr}
        </td>
        <td style="text-align:right; font-family:'JetBrains Mono', monospace; font-weight:800; color:#fbbf24;">
          ${incomingPriceStr}
        </td>
        <td style="text-align:right;">
          ${diffHtml}
        </td>
        <td style="text-align:center;">
          ${badgeHtml}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function changeComparisonPage(newPage) {
  comparisonCurrentPage = newPage;
  renderTableRows();
  const scrollEl = document.querySelector('.table-scroll');
  if (scrollEl) scrollEl.scrollTop = 0;
}

// Onayla ve Sisteme Aktar
async function commitSync() {
  if (!comparisonData || !comparisonData.parsed_items) return;
  const items = comparisonData.parsed_items;
  const totalItems = items.length;

  const confirmBtns = [document.getElementById('confirmSyncBtn'), document.getElementById('confirmSyncBtnBottom')];
  
  confirmBtns.forEach(btn => {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Veriler Ana Bilgisayara Aktarılıyor...';
    }
  });

  showSyncProgress('Veriler Ana Bilgisayara Aktarılıyor...', `${totalItems.toLocaleString('tr-TR')} ürün ana sisteme kaydediliyor...`, '🚀');
  updateSyncProgress(0, totalItems, 'Bağlantı kuruluyor ve ürünler paketleniyor...');

  try {
    // Görsel geri bildirim için ilk adım
    await new Promise(r => setTimeout(r, 100));
    updateSyncProgress(Math.floor(totalItems * 0.4), totalItems, `${Math.floor(totalItems * 0.4).toLocaleString('tr-TR')} / ${totalItems.toLocaleString('tr-TR')} ürün ana PC'ye gönderildi...`);

    const res = await API.confirmVegawinSync(
      comparisonData.parsed_items,
      comparisonData.source_filename || 'Kopyalanan Tablo',
      comparisonData.device_name || 'Dükkan PC'
    );

    const data = res.data || res;

    updateSyncProgress(totalItems, totalItems, 'Tüm ürünler başarıyla işlendi ve veritabanına yazıldı!');
    await new Promise(r => setTimeout(r, 300));
    hideSyncProgress();

    if (res.status === 'success' || data.total_received !== undefined) {
      document.getElementById('stepUploadCard').style.display = 'none';
      document.getElementById('stepComparisonCard').style.display = 'none';
      document.getElementById('stepResultCard').style.display = 'block';

      document.getElementById('resTotal').textContent = data.total_received || comparisonData.total_incoming || 0;
      document.getElementById('resNew').textContent = data.new_products || 0;
      document.getElementById('resChanges').textContent = data.price_changes_count || 0;

      document.getElementById('resultSummaryText').textContent = 
        `${comparisonData.device_name} cihazından aktarılan ${data.total_received || 0} adet ürünün güncel fiyatları ve stok bilgileri başarıyla ana sisteme kaydedildi.`;

      showToast('Ürünler başarıyla ana sisteme aktarıldı!', 'success');
    } else {
      showToast('Hata: ' + (res.message || 'Aktarım başarısız oldu.'), 'error');
      confirmBtns.forEach(btn => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>🚀</span> Onayla & Ana Bilgisayara Aktar';
        }
      });
    }
  } catch (err) {
    hideSyncProgress();
    confirmBtns.forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀</span> Onayla & Ana Bilgisayara Aktar';
      }
    });
    showToast('Bağlantı hatası: ' + err.message, 'error');
  }
}

function resetToUpload() {
  document.getElementById('stepUploadCard').style.display = 'block';
  document.getElementById('stepComparisonCard').style.display = 'none';
  document.getElementById('stepResultCard').style.display = 'none';
  comparisonData = null;
}

// Cihazı Ana Bilgisayara Bağlı Olarak Kaydet ve Canlı Tut
async function registerCurrentDevice() {
  const devName = (document.getElementById('deviceNameInput')?.value || 'Dükkan Kasa Bilgisayarı').trim();
  try {
    await API.registerDevice({
      device_id: 'sync_client_' + window.location.hostname,
      device_name: devName,
      device_type: 'sync_client'
    });
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', () => {
  loadSyncPortalStorage();
  renderExcelGrid();
  const savedDev = localStorage.getItem('saved_device_name');
  if (savedDev && document.getElementById('deviceNameInput')) {
    document.getElementById('deviceNameInput').value = savedDev;
  }
});

document.getElementById('deviceNameInput')?.addEventListener('input', (e) => {
  localStorage.setItem('saved_device_name', e.target.value);
});

registerCurrentDevice();
setInterval(registerCurrentDevice, 15000);
