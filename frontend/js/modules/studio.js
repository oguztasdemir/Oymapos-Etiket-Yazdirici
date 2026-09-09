// ==========================================================================
// OYMAPOS - ETİKET STÜDYOSU & ŞABLON GALERİSİ MODÜLÜ
// ==========================================================================

let cachedTemplates = [];
let currentActiveTemplate = null;
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

// Şablonlar Galerisi ve Yönetimi
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

      renderTemplatesGrid(cachedTemplates);

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
  const container = document.getElementById('templatesListContainer');
  if (!container) return;

  if (!templates || templates.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8; font-size:12px; padding:20px;">Kayıtlı etiket şablonu bulunamadı.</div>';
    return;
  }

  const marketName = (localStorage.getItem('market_name') || 'YARENLER').toUpperCase();
  const todayDate = getTodayTrDate();

  let html = templates.map(t => {
    const isDef = !!t.is_default;
    const width = t.width_mm || 76;
    const height = t.height_mm || 40;
    const preset = t.preset || 'size-76x40';

    let topRightHtml = '';
    if (t.top_right_mode === 'yerli') {
      topRightHtml = `
        <div class="ml-top-right-box" style="display:flex;">
          <svg viewBox="0 0 160 65" width="55" height="22">
            <rect x="1" y="1" width="158" height="63" rx="3" fill="none" stroke="#000" stroke-width="2.2" />
            <path d="M10 18 L22 30 L34 18 L30 14 L22 22 L14 14 Z" fill="#000" />
            <rect x="6" y="34" width="3" height="20" fill="#000" />
            <rect x="12" y="34" width="5" height="20" fill="#000" />
            <rect x="20" y="34" width="2" height="20" fill="#000" />
            <rect x="25" y="34" width="6" height="20" fill="#000" />
            <text x="42" y="28" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="#000">YERLİ</text>
            <text x="42" y="52" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="#000">ÜRETİM</text>
          </svg>
        </div>
      `;
    } else if (t.top_right_mode === 'discount') {
      topRightHtml = `<div class="ml-top-right-box" style="display:flex;"><div class="tr-badge-dark" style="background:#ef4444; color:#fff; border:1px solid #b91c1c; font-weight:900; font-size:7.5px; padding:1px 4px;">🔥 İNDİRİM</div></div>`;
    } else if (t.top_right_mode === 'unit_price') {
      topRightHtml = `<div class="ml-top-right-box" style="display:flex;"><div class="tr-unit-box"><span class="u-label">Birim F:</span><span class="u-val">250 ₺/Kg</span></div></div>`;
    } else if (t.top_right_mode === 'custom_text') {
      topRightHtml = `<div class="ml-top-right-box" style="display:flex;"><div class="tr-badge-dark" style="font-size:7.5px; padding:1px 4px;">SÜPER FİYAT</div></div>`;
    }

    const showBarcode = t.show_barcode !== false;
    const showUnitPrice = t.show_unit_price !== false;
    const showOrigin = t.show_origin !== false;
    const showDate = t.show_date !== false;
    const titleSize = t.title_size || 12;
    const priceSize = t.price_size || 26;

    return `
      <div class="template-row-card ${isDef ? 'is-default' : ''}">
        <div class="template-row-body">
          
          <div class="template-info-col">
            <div class="template-row-title">
              <span>${t.name || 'İsimsiz Şablon'}</span>
              <span class="badge" style="background:${isDef ? 'rgba(52,211,153,0.15)' : 'rgba(56,189,248,0.15)'}; color:${isDef ? '#34d399' : '#38bdf8'}; font-weight:800; font-size:11px;">
                ${isDef ? '⭐ Varsayılan Şablon' : '📝 Özel Şablon'}
              </span>
            </div>

            <div class="template-row-specs">
              <span>📐 <strong>Boyut:</strong> ${width} × ${height} mm (${preset.replace('size-', '')})</span>
              <span>✏️ <strong>Başlık Punto:</strong> ${titleSize}px</span>
              <span>💰 <strong>Fiyat Punto:</strong> ${priceSize}px</span>
              <span>🏷️ <strong>Barkod:</strong> ${showBarcode ? 'Açık' : 'Kapalı'}</span>
              <span>🇹🇷 <strong>Menşei:</strong> ${showOrigin ? 'Açık' : 'Kapalı'}</span>
              <span>📅 <strong>Tarih:</strong> ${showDate ? 'Açık' : 'Kapalı'}</span>
            </div>

            <div style="font-size:12px; color:#64748b; margin-top:2px;">
              ${isDef ? 'Bu şablon tüm tekli ve çoklu yazdırma işlemlerinde birincil format olarak kullanılır.' : 'Özel olarak yapılandırılmış etiket modeli.'}
            </div>
          </div>

          <div class="template-preview-col">
            <div class="market-label ${preset}" style="transform: scale(1.15); transform-origin: center center; box-shadow:0 8px 24px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.15); border-radius:4px; pointer-events:none;">
              
              <div class="ml-top-row">
                <div class="ml-title-area full-width">
                  <div class="ml-title-line1" style="font-size:${titleSize}px;">ULK 398-6 PIKO PORTAKAL</div>
                  <div class="ml-title-line2">PIR PAT KAP</div>
                </div>
                ${topRightHtml}
              </div>

              <div class="ml-mid-row">
                <div class="ml-brand-col">${marketName}</div>
                <div class="ml-legal-col">
                  ${showOrigin ? `<div>Üretim Yeri: <strong>TURKIYE</strong></div>` : ''}
                  <div>Fiyatlarımıza Kdv Dahildir.</div>
                  ${showDate ? `<div>Fiyat Değiştirme Tarihi: <span>${todayDate}</span></div>` : ''}
                </div>
              </div>

              <div class="ml-bottom-row">
                <div class="ml-barcode-col" style="${showBarcode ? '' : 'display:none;'}">
                  <svg id="tpl-list-barcode-svg-${t.id}"></svg>
                </div>
                <div class="ml-divider-col" style="${showUnitPrice ? '' : 'display:none;'}">
                  <span>Satış</span>
                  <span>Fiyatı</span>
                </div>
                <div class="ml-price-col">
                  <span class="price-val" style="font-size:${priceSize}px;">25,00 TL</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div class="template-row-footer">
          <button class="btn btn-primary btn-sm" onclick="openTemplateInEditor('${t.id}')" style="font-weight:800; padding:6px 14px; background:linear-gradient(135deg, #0284c7, #0369a1);">
            🎨 Şablonu Düzenle & Özelleştir
          </button>
          ${!isDef ? `
            <button class="btn btn-secondary btn-sm" onclick="makeTemplateDefaultById('${t.id}')" title="Bu Şablonu Varsayılan Yap" style="font-weight:700; color:#34d399; padding:6px 12px;">
              ⭐ Varsayılan Yap
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="duplicateTemplateById('${t.id}')" title="Şablonun Kopyasını Oluştur" style="font-weight:700; padding:6px 12px;">
            📋 Kopyasını Çıkar
          </button>
          ${!isDef ? `
            <button class="btn btn-danger btn-sm" onclick="deleteTemplateById('${t.id}')" title="Şablonu Sil" style="font-weight:700; padding:6px 12px;">
              🗑️ Sil
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  html += `
    <div class="template-card-add-banner" onclick="onPromptNewTemplate()">
      <span style="font-size:22px;">➕</span>
      <span>Yeni Özel Etiket Şablonu Oluştur</span>
    </div>
  `;

  container.innerHTML = html;

  setTimeout(() => {
    templates.forEach(t => {
      if (t.show_barcode !== false) {
        renderBarcodeSvg(`#tpl-list-barcode-svg-${t.id}`, "8690504114925");
      }
    });
  }, 60);
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

  const sizeSelect = document.getElementById('studio-size-select');
  if (sizeSelect) {
    sizeSelect.value = tpl.preset || 'size-76x40';
    const labelEl = document.getElementById('editor-shelf-label');
    if (labelEl) labelEl.className = `market-label ${tpl.preset || 'size-76x40'} studio-canvas`;
  }

  const trSelect = document.getElementById('studio-opt-top-right');
  if (trSelect) {
    trSelect.value = tpl.top_right_mode || 'empty';
    onStudioTopRightChange(tpl.top_right_mode || 'empty');
  }

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
        if (typeof makeElementDraggable === 'function') {
          makeElementDraggable(div);
        }
      });
    }
  }

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
