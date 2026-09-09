// ==========================================================================
// OYMAPOS - YAZDIRMA & A4 DİZGİ MODÜLÜ
// ==========================================================================

async function printBarcode(barcode, btnElement, currentPrice) {
  try {
    const res = await API.printSingle({ barcode: barcode }, 1);
    if (res.status === 'success') {
      showToast(`${barcode} etiket yazıcıya gönderildi!`, 'success');
      
      const prod = (res.data && res.data.product) || {};
      const nowStr = (res.data && res.data.last_printed_at) || new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const printedPrice = prod.price !== undefined ? Number(prod.price).toFixed(2) : (currentPrice !== undefined ? Number(currentPrice).toFixed(2) : null);

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

function printSingleLabelAction(barcode) {
  printBarcode(barcode);
}

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

    // A4 çıktısı alınan ürünlerin etiket fiyatlarını arka planda basıldı olarak onayla
    try {
      const printedBarcodes = products.map(p => p.barcode).filter(Boolean);
      for (const b of printedBarcodes) {
        API.confirmProductPrinted(b).catch(() => {});
      }
      setTimeout(() => {
        if (typeof searchProducts === 'function') {
          searchProducts(document.getElementById('productSearchInput')?.value || '');
        }
      }, 1000);
    } catch(e) {}
  } catch (err) {
    showToast('A4 dizgi hatası: ' + err.message, 'error');
  }
}
