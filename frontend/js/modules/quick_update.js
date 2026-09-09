// ==========================================================================
// OYMAPOS - DİNAMİK EXCEL SPREADSHEET ÇALIŞMA MASASI (A..Z, AA..ZZ SINIRSIZ SÜTUN)
// ==========================================================================

let numCols = 26; // Başlangıçta A'dan Z'ye 26 sütun
let gridData = []; // Array of arrays: [ [cellA, cellB, cellC...], ... ]
let activeCell = { r: 0, c: 0 };

function getExcelColName(colIdx) {
  let name = '';
  let n = colIdx;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
}

function saveQuickGridToStorage() {
  try {
    const filled = gridData.filter(r => r.some(c => c && c.trim().length > 0));
    if (filled.length > 0) {
      localStorage.setItem('quick_update_grid_data', JSON.stringify(gridData));
      localStorage.setItem('quick_update_grid_cols', String(numCols));
    } else {
      localStorage.removeItem('quick_update_grid_data');
      localStorage.removeItem('quick_update_grid_cols');
    }
  } catch (e) {}
}

function loadQuickGridFromStorage() {
  try {
    const saved = localStorage.getItem('quick_update_grid_data');
    const savedCols = localStorage.getItem('quick_update_grid_cols');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        gridData = parsed;
        if (savedCols) numCols = Math.max(numCols, parseInt(savedCols, 10) || 26);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function initExcelGrid(minRows = 100, minCols = 26) {
  numCols = Math.max(numCols, minCols);
  
  if (gridData.length === 0) {
    const hasRestored = loadQuickGridFromStorage();
    if (!hasRestored) {
      gridData = [];
      for (let i = 0; i < minRows; i++) {
        gridData.push(new Array(numCols).fill(''));
      }
    }
  }

  renderExcelThead();
  renderExcelGrid();
  updateGridStats();
}

function ensureCols(requiredCols) {
  if (requiredCols > numCols) {
    const oldNum = numCols;
    numCols = requiredCols;
    gridData.forEach(row => {
      while (row.length < numCols) {
        row.push('');
      }
    });
    renderExcelThead();
  }
}

function renderExcelThead() {
  const thead = document.getElementById('excelGridThead');
  if (!thead) return;

  let html = `
    <tr style="background: #1e293b; position: sticky; top: 0; z-index: 10; border-bottom: 2px solid #3b82f6; user-select: none;">
      <th style="width: 48px; min-width: 48px; background: #0f172a; border-right: 1px solid #334155; border-bottom: 1px solid #334155; text-align: center; color: #64748b; font-weight: 700; font-size: 11px; position: sticky; left: 0; z-index: 12;">#</th>
  `;

  for (let c = 0; c < numCols; c++) {
    const colName = getExcelColName(c);
    html += `
      <th style="width: 140px; min-width: 140px; border-right: 1px solid #334155; padding: 7px 10px; text-align: center; color: #93c5fd; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 12.5px;">
        ${colName}
      </th>
    `;
  }

  html += `</tr>`;
  thead.innerHTML = html;

  // Tablo genişliğini sütun sayısına göre dinamik ayarla
  const table = document.getElementById('excelSpreadsheetTable');
  if (table) {
    table.style.minWidth = `${48 + numCols * 140}px`;
  }
}

function renderExcelGrid() {
  const tbody = document.getElementById('excelGridTbody');
  if (!tbody) return;

  let html = '';
  gridData.forEach((row, rIdx) => {
    html += `<tr data-row="${rIdx}" style="border-bottom: 1px solid #1e293b; background: ${rIdx % 2 === 0 ? '#0b1120' : '#070c18'};">`;
    
    // Excel Satır Numarası (Sticky)
    html += `
      <td style="background: #0f172a; border-right: 1px solid #334155; text-align: center; color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; user-select: none; padding: 5px; position: sticky; left: 0; z-index: 2;">
        ${rIdx + 1}
      </td>
    `;

    // Sütunlar 0'dan numCols-1'e
    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      const val = row[cIdx] || '';
      html += `
        <td 
          data-row="${rIdx}" 
          data-col="${cIdx}" 
          contenteditable="true" 
          spellcheck="false"
          onfocus="onCellFocus(${rIdx}, ${cIdx})"
          onblur="onCellBlur(${rIdx}, ${cIdx}, this.innerText)"
          onkeydown="onCellKeyDown(event, ${rIdx}, ${cIdx})"
          style="border-right: 1px solid #1e293b; padding: 6px 10px; color: #f1f5f9; font-size: 13px; outline: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 140px; max-width: 320px;"
        >${escapeHtml(val)}</td>
      `;
    }

    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

function onCellFocus(rIdx, cIdx) {
  activeCell = { r: rIdx, c: cIdx };
  const colLetter = getExcelColName(cIdx);
  const labelEl = document.getElementById('excelActiveCellLabel');
  const formulaInput = document.getElementById('excelFormulaInput');
  
  if (labelEl) labelEl.textContent = `${colLetter}${rIdx + 1}`;
  if (formulaInput) {
    formulaInput.value = gridData[rIdx]?.[cIdx] || '';
  }

  // Satır vurgusu
  document.querySelectorAll('#excelGridTbody tr').forEach((tr, idx) => {
    tr.style.backgroundColor = (idx === rIdx) ? 'rgba(59, 130, 246, 0.14)' : (idx % 2 === 0 ? '#0b1120' : '#070c18');
  });
}

function onCellBlur(rIdx, cIdx, text) {
  if (gridData[rIdx]) {
    gridData[rIdx][cIdx] = text.trim();
  }
  updateGridStats();
}

function onFormulaBarInput(val) {
  const { r, c } = activeCell;
  if (gridData[r]) {
    gridData[r][c] = val;
    const cell = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
    if (cell) cell.innerText = val;
    updateGridStats();
  }
}

function onCellKeyDown(e, rIdx, cIdx) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const nextRow = rIdx + 1;
    if (nextRow >= gridData.length) {
      addGridRow();
    }
    setTimeout(() => {
      const nextCell = document.querySelector(`td[data-row="${nextRow}"][data-col="${cIdx}"]`);
      if (nextCell) nextCell.focus();
    }, 20);
  } else if (e.key === 'Tab') {
    if (cIdx + 1 >= numCols) {
      ensureCols(numCols + 5);
      renderExcelGrid();
    }
  } else if (e.key === 'ArrowDown') {
    const nextCell = document.querySelector(`td[data-row="${rIdx + 1}"][data-col="${cIdx}"]`);
    if (nextCell) { e.preventDefault(); nextCell.focus(); }
  } else if (e.key === 'ArrowUp' && rIdx > 0) {
    const prevCell = document.querySelector(`td[data-row="${rIdx - 1}"][data-col="${cIdx}"]`);
    if (prevCell) { e.preventDefault(); prevCell.focus(); }
  }
}

function addGridRow(count = 1) {
  for (let i = 0; i < count; i++) {
    gridData.push(new Array(numCols).fill(''));
  }
  renderExcelGrid();
  updateGridStats();
}

function clearGridData(silent = false) {
  gridData = [];
  numCols = 26;
  activeCell = { r: 0, c: 0 };
  localStorage.removeItem('quick_update_grid_data');
  localStorage.removeItem('quick_update_grid_cols');
  initExcelGrid(100, 26);
  if (!silent) {
    showToast('Excel tablosu temizlendi.', 'info');
  }
}

function updateGridStats() {
  saveQuickGridToStorage();
  const filledRows = gridData.filter(row => row.some(cell => cell && cell.trim().length > 0)).length;
  const badge = document.getElementById('quickPriceUpdateCountBadge');
  const statsEl = document.getElementById('quickPriceUpdateStatsText');

  if (badge) {
    badge.textContent = `${filledRows} Dolu Satır (${gridData.length} Satır, ${numCols} Sütun)`;
  }

  if (statsEl) {
    if (filledRows > 0) {
      statsEl.innerHTML = `<span style="color: #38bdf8; font-weight: 700;">✓ ${filledRows} satır veri hazır.</span> Otomatik sütun eşleştirme (Barkod, Ürün Adı, Fiyat vb.) ile sisteme aktarılacaktır.`;
    } else {
      statsEl.innerHTML = `<span>💡</span> <strong>İpucu:</strong> Excel'deki verinizi seçip <kbd style="background:#1e293b; color:#38bdf8; padding:1px 5px; border-radius:3px;">Ctrl + C</kbd> ile kopyalayın, ardından tablodaki herhangi bir hücreye tıklayıp <kbd style="background:#1e293b; color:#38bdf8; padding:1px 5px; border-radius:3px;">Ctrl + V</kbd> yapın.`;
    }
  }
}

async function clearAndPasteFromClipboard() {
  try {
    let clipboardText = '';

    // 1. Önce modern tarayıcı Clipboard API'sini dene
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        clipboardText = await navigator.clipboard.readText();
      } catch (clipErr) {
        console.warn('Tarayıcı panosuna erişilemedi, sistem API deneniyor:', clipErr);
      }
    }

    // 2. Eğer tarayıcı engellediyse veya boşsa sunucu üzerinden Windows panosunu oku
    if (!clipboardText || !clipboardText.trim()) {
      try {
        const res = await fetch('/api/system/get-clipboard');
        const json = await res.json();
        if (json.status === 'success' && json.data && json.data.clipboard_text) {
          clipboardText = json.data.clipboard_text;
        }
      } catch (apiErr) {
        console.warn('Sistem API panosu okunamadı:', apiErr);
      }
    }

    if (!clipboardText || !clipboardText.trim()) {
      showToast('Panoda kopyalanmış herhangi bir metin veya Excel tablosu bulunamadı. Lütfen önce Excel veya başka bir yerden veri kopyalayın (Ctrl+C).', 'warning');
      return;
    }

    showToast('Pano içeriği okunuyor ve tabloya aktarılıyor...', 'info');

    // Panoyu temizle ve yapıştır (sıfırdan yapıştır)
    await parseAndApplyTextToGrid(clipboardText, true);

  } catch (err) {
    showToast('Pano yapıştırma hatası: ' + err.message, 'error');
  }
}

function showQuickUpdateProgress(title, subtitle, icon = '📋') {
  const overlay = document.getElementById('quickUpdateProgressOverlay');
  if (!overlay) return;
  const tEl = document.getElementById('quickUpdateProgressTitle');
  const sEl = document.getElementById('quickUpdateProgressSubtitle');
  const iEl = document.getElementById('quickUpdateProgressIcon');
  const fill = document.getElementById('quickUpdateProgressBarFill');
  const count = document.getElementById('quickUpdateProgressCount');
  const percent = document.getElementById('quickUpdateProgressPercent');

  if (tEl) tEl.textContent = title;
  if (sEl) sEl.textContent = subtitle;
  if (iEl) iEl.textContent = icon;
  if (fill) fill.style.width = '0%';
  if (count) count.textContent = '0 / 0 Ürün';
  if (percent) percent.textContent = '%0';

  overlay.style.display = 'flex';
}

function updateQuickUpdateProgress(current, total, statusText = '') {
  const fill = document.getElementById('quickUpdateProgressBarFill');
  const count = document.getElementById('quickUpdateProgressCount');
  const percent = document.getElementById('quickUpdateProgressPercent');
  const sEl = document.getElementById('quickUpdateProgressSubtitle');

  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (fill) fill.style.width = `${pct}%`;
  if (count) count.textContent = `${current.toLocaleString('tr-TR')} / ${total.toLocaleString('tr-TR')} Ürün`;
  if (percent) percent.textContent = `%${pct}`;
  if (statusText && sEl) sEl.textContent = statusText;
}

function hideQuickUpdateProgress() {
  const overlay = document.getElementById('quickUpdateProgressOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

/**
 * Verilen metni (TSV / CSV / Tablo) güvenli, donmayan (chunked / non-blocking) bir şekilde grid'e aktarır.
 */
async function parseAndApplyTextToGrid(text, isClearFirst = false) {
  if (!text || !text.trim()) return;

  const rawLines = text.split(/\r?\n/);
  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i].trim().length > 0) {
      lines.push(rawLines[i]);
    }
  }

  if (lines.length === 0) return;

  showQuickUpdateProgress('Pano Verisi Yapıştırılıyor...', 'Satırlar ayrıştırılıyor ve tabloya işleniyor...', '📋');
  updateQuickUpdateProgress(0, lines.length, `${lines.length} satır hazırlandı...`);

  await new Promise(r => setTimeout(r, 20));

  if (isClearFirst) {
    gridData = [];
    numCols = 26;
    activeCell = { r: 0, c: 0 };
  }

  const startR = isClearFirst ? 0 : (activeCell.r || 0);
  const startC = isClearFirst ? 0 : (activeCell.c || 0);

  // Maksimum gelen sütun sayısını hesapla
  let maxIncomingCols = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let count = (line.match(/\t/g) || []).length + 1;
    if (count === 1 && line.includes(';')) {
      count = (line.match(/;/g) || []).length + 1;
    }
    if (count > maxIncomingCols) maxIncomingCols = count;
  }

  const requiredTotalCols = Math.max(26, startC + maxIncomingCols);
  ensureCols(requiredTotalCols);

  // İhtiyaç kadar satır ekle
  while (gridData.length < startR + lines.length) {
    gridData.push(new Array(numCols).fill(''));
  }

  // Tarayıcı donmasını engellemek için satırları parçalı (async chunk) işle
  const CHUNK_SIZE = 500;
  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, lines.length);
    for (let idx = i; idx < end; idx++) {
      const line = lines[idx];
      let cells = line.split('\t');
      if (cells.length === 1 && line.includes(';')) {
        cells = line.split(';');
      }

      const targetRow = startR + idx;
      if (!gridData[targetRow]) {
        gridData[targetRow] = new Array(numCols).fill('');
      }

      for (let c = 0; c < cells.length; c++) {
        const targetCol = startC + c;
        if (targetCol < numCols) {
          gridData[targetRow][targetCol] = (cells[c] || '').trim();
        }
      }
    }

    updateQuickUpdateProgress(end, lines.length, `${end} / ${lines.length} satır tabloya yerleştirildi...`);

    // Event loop'a nefes aldır (UI donmasını önle ve progress bar animasyonunu göster)
    await new Promise(r => setTimeout(r, 10));
  }

  // Minimum 100 satır olsun
  while (gridData.length < 100) {
    gridData.push(new Array(numCols).fill(''));
  }

  updateQuickUpdateProgress(lines.length, lines.length, 'Tablo görünümü hazırlanıyor...');
  await new Promise(r => setTimeout(r, 20));

  renderExcelGrid();
  updateGridStats();
  hideQuickUpdateProgress();
  showToast(`✓ ${lines.length} satır, ${maxIncomingCols} sütun başarıyla yapıştırıldı!`, 'success');
}

function handleGridPaste(e) {
  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const pastedText = clipboardData.getData('text');
  if (!pastedText || (!pastedText.includes('\t') && !pastedText.includes('\n'))) {
    return; // Düz tek hücre metin yapıştırma
  }

  e.preventDefault();
  parseAndApplyTextToGrid(pastedText, false);
}


function insertSampleToGrid() {
  const sample = [
    ['8690577018120', 'SOKE UN 1 KG GELENEKSEL', '52,00 TL', 'UN001', 'SÖKE', 'ADET', '', ''],
    ['8691375640100', 'BIZIM CORBA EZOGELIN 80 GR', '35,00 TL', 'CRB002', 'BİZİM', 'ADET', '', ''],
    ['8690504034016', 'ULKER COKOKREM 400 GR KAKAOLU FINDIK KREMASI', '82,50 TL', 'KRM003', 'ÜLKER', 'ADET', '', ''],
    ['8690637012345', 'DOGUS CAY FILIZ 1000 GR KARADENIZ', '175,00 TL', 'CY004', 'DOĞUŞ', 'ADET', '', ''],
    ['8690555112233', 'PINAR SUT 1 LT TAM YAGLI UHT', '45,00 TL', 'ST005', 'PINAR', 'ADET', '', ''],
    ['8690777889900', 'YUDUM AYCICEK YAGI 1 LT SAF', '99,50 TL', 'YG006', 'YUDUM', 'ADET', '', ''],
    ['8001480021822', 'ACE 1 LT KLASIK CAMASIR SUYU', '79,00 TL', 'ACE01', 'ACE', 'ADET', '', '']
  ];

  gridData = sample;
  while (gridData.length < 100) {
    gridData.push(new Array(numCols).fill(''));
  }

  renderExcelGrid();
  updateGridStats();
  showToast('Örnek veri eklendi.', 'success');
}

async function executeQuickPriceUpdate() {
  const filledRows = gridData.filter(row => row.some(c => c && c.trim().length > 0));
  const btn = document.getElementById('btnExecuteQuickPriceUpdate');

  if (filledRows.length === 0) {
    showToast('Lütfen tablodaki hücrelere veri girin veya Excel\'den yapıştırın.', 'error');
    return;
  }

  // TSV biçiminde arka plandaki otomatik ayrıştırıcıya gönder (parse_raw_text_products otomatik algılar)
  const tsvLines = filledRows.map(row => row.join('\t'));
  const rawText = tsvLines.join('\n');

  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Fiyatlar Güncelleniyor...';
  }

  showQuickUpdateProgress('Fiyatlar & Ürünler Güncelleniyor...', `${filledRows.length} ürün veritabanına aktarılıyor...`, '🚀');
  updateQuickUpdateProgress(0, filledRows.length, 'Sunucuya aktarılıyor...');

  try {
    const formData = new FormData();
    formData.append('raw_text', rawText);
    formData.append('device_name', 'Ana PC - Excel Güncelleme Masası');

    updateQuickUpdateProgress(Math.floor(filledRows.length * 0.5), filledRows.length, 'Veritabanı kayıtları ve fiyat değişimleri işleniyor...');

    const res = await fetch('/api/products/quick-update-clipboard', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    updateQuickUpdateProgress(filledRows.length, filledRows.length, 'İşlem tamamlandı!');
    await new Promise(r => setTimeout(r, 250));
    hideQuickUpdateProgress();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }

    if (result.status === 'success' && result.data) {
      const d = result.data;
      showToast(
        `✓ ${d.total_items} ürün işlendi! (${d.price_changes_count} fiyat değişimi, ${d.new_products} yeni ürün).`,
        'success'
      );
      if (typeof searchProducts === 'function') {
        searchProducts(document.getElementById('productSearchInput')?.value || '');
      }
      if (typeof loadPriceChanges === 'function') {
        loadPriceChanges();
      }
      
      setTimeout(() => {
        if (typeof switchTab === 'function') {
          switchTab('tab-search');
        }
      }, 1000);
    } else {
      showToast('Güncelleme Hatası: ' + (result.message || 'İşlem gerçekleştirilemedi.'), 'error');
    }
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
    showToast('Sunucu bağlantı hatası: ' + err.message, 'error');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupInfiniteScroll() {
  const container = document.getElementById('excelGridScrollContainer');
  if (!container) return;

  container.addEventListener('scroll', () => {
    // Kullanıcı listenin sonuna yaklaştığında (son 300 piksel) otomatik yeni satırlar ekle (Excel gibi sonsuz aşağı inme)
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 300) {
      addGridRowsBatch(50);
    }
  });
}

function addGridRowsBatch(count = 50) {
  const tbody = document.getElementById('excelGridTbody');
  if (!tbody) return;

  const startIdx = gridData.length;
  let html = '';

  for (let i = 0; i < count; i++) {
    const rIdx = startIdx + i;
    const newRow = new Array(numCols).fill('');
    gridData.push(newRow);

    html += `<tr data-row="${rIdx}" style="border-bottom: 1px solid #1e293b; background: ${rIdx % 2 === 0 ? '#0b1120' : '#070c18'};">`;
    html += `
      <td style="background: #0f172a; border-right: 1px solid #334155; text-align: center; color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; user-select: none; padding: 5px; position: sticky; left: 0; z-index: 2;">
        ${rIdx + 1}
      </td>
    `;
    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      html += `
        <td 
          data-row="${rIdx}" 
          data-col="${cIdx}" 
          contenteditable="true" 
          spellcheck="false"
          onfocus="onCellFocus(${rIdx}, ${cIdx})"
          onblur="onCellBlur(${rIdx}, ${cIdx}, this.innerText)"
          onkeydown="onCellKeyDown(event, ${rIdx}, ${cIdx})"
          style="border-right: 1px solid #1e293b; padding: 6px 10px; color: #f1f5f9; font-size: 13px; outline: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 140px; max-width: 320px;"
        ></td>
      `;
    }
    html += `</tr>`;
  }

  tbody.insertAdjacentHTML('beforeend', html);
  updateGridStats();
}

document.addEventListener('DOMContentLoaded', () => {
  initExcelGrid(100, 26);
  setupInfiniteScroll();
});


