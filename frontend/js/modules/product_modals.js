// ==========================================================================
// OYMAPOS - MODAL PENCERELERİ (ÖNİZLEME, GEÇMİŞ, DÜZENLEME) MODÜLÜ
// ==========================================================================

// 1. TEKLİ ETİKET ÖNİZLEME MODALI
function openLabelPreviewModal(barcode) {
  const prod = cachedProductsList.find(p => p.barcode === barcode) || {
    barcode: barcode,
    title: "ÖRNEK ÜRÜN",
    price: 25.0,
    brand: "MARKET",
    origin: "TURKIYE"
  };

  currentModalProduct = prod;

  const fullTitle = cleanProductTitle(prod.title || 'ÜRÜN ADI').trim().toUpperCase();

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

  const scaleBadge = document.getElementById('modal-scale-badge');
  if (scaleBadge) {
    if (prod.is_scale_product) {
      scaleBadge.style.display = 'block';
      scaleBadge.textContent = `⚖️ Terazi Ürünü: ${prod.scale_summary || 'Gramajlı Satış'}`;
    } else {
      scaleBadge.style.display = 'none';
    }
  }

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

// 2. ÜRÜN DETAYLI DEĞİŞİKLİK GEÇMİŞİ (AUDIT TIMELINE) MODALI
let activeHistoryBarcode = null;

async function openProductHistoryModal(barcode) {
  activeHistoryBarcode = barcode;
  const modal = document.getElementById('modal-product-history');
  const listEl = document.getElementById('histTimelineList');
  const barEl = document.getElementById('histModalBarcode');
  const titleEl = document.getElementById('histCurrentTitle');
  const priceEl = document.getElementById('histCurrentPrice');

  if (barEl) barEl.textContent = `Barkod: ${barcode}`;
  if (listEl) listEl.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">⏳ Geçmiş hareketler yükleniyor...</div>';
  if (modal) modal.style.display = 'flex';

  try {
    const res = await API.getProductHistory(barcode);
    const data = res.data || res;
    const prod = data.product || cachedProductsList.find(p => p.barcode === barcode);
    const history = data.history || [];

    if (prod) {
      if (titleEl) titleEl.textContent = prod.title || '-';
      if (priceEl) priceEl.textContent = `${Number(prod.price || 0).toFixed(2)} TL`;
    }

    if (!history || history.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:32px 16px; background:rgba(0,0,0,0.25); border-radius:10px; border:1px dashed rgba(255,255,255,0.1);">
          <div style="font-size:32px; margin-bottom:8px;">🕒</div>
          <div style="font-size:14px; font-weight:700; color:#fff;">Henüz Değişiklik Kaydı Yok</div>
          <div style="font-size:12px; color:#94a3b8; margin-top:4px;">Bu ürün için kaydedilmiş bir fiyat veya isim değişikliği bulunmuyor.</div>
        </div>
      `;
      return;
    }

    let html = '';
    history.forEach((h) => {
      let badgeHtml = '';
      let descHtml = '';
      const eventType = h.event_type || 'price_change';

      if (eventType === 'price_change') {
        badgeHtml = '<span class="badge" style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); font-weight:700; font-size:11px;">⚡ Fiyat Değişimi</span>';
        const sign = (h.diff_amount > 0) ? '+' : '';
        const oldP = h.old_price !== null ? Number(h.old_price).toFixed(2) : '-';
        const newP = h.new_price !== null ? Number(h.new_price).toFixed(2) : '-';
        descHtml = `
          <div style="font-size:13px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; margin:4px 0;">
            <span style="color:#94a3b8; text-decoration:line-through;">₺ ${oldP}</span>
            <span style="color:#38bdf8;">➔</span>
            <span style="color:#fbbf24; font-size:14px; font-weight:800;">₺ ${newP}</span>
            <span style="font-size:11.5px; color:${h.diff_amount > 0 ? '#f87171' : '#34d399'};">(${sign}${h.diff_amount} TL / %${h.diff_percent})</span>
          </div>
        `;
      } else if (eventType === 'title_change') {
        badgeHtml = '<span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); font-weight:700; font-size:11px;">📝 İsim Değişimi</span>';
        descHtml = `
          <div style="font-size:12.5px; color:#fff; margin:4px 0;">
            <div style="color:#94a3b8; text-decoration:line-through;">${h.old_title || '-'}</div>
            <div style="color:#34d399; font-weight:700; margin-top:2px;">➔ ${h.new_title || '-'}</div>
          </div>
        `;
      } else if (eventType === 'manual_edit') {
        badgeHtml = '<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-weight:700; font-size:11px;">✏️ El İle Düzenlendi</span>';
        descHtml = `
          <div style="font-size:12.5px; color:#fff; margin:4px 0;">
            ${h.old_title && h.new_title ? `<div style="color:#94a3b8; text-decoration:line-through;">${h.old_title}</div><div style="color:#c084fc; font-weight:700;">➔ ${h.new_title}</div>` : ''}
            ${h.old_price !== null && h.new_price !== null ? `<div style="color:#fbbf24; font-weight:700; margin-top:2px;">Fiyat: ₺${Number(h.old_price).toFixed(2)} ➔ ₺${Number(h.new_price).toFixed(2)}</div>` : ''}
          </div>
        `;
      } else if (eventType === 'restored') {
        badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); font-weight:700; font-size:11px;">↩️ Geri Yüklendi (Undo)</span>';
        descHtml = `
          <div style="font-size:12.5px; color:#34d399; font-weight:700; margin:4px 0;">
            ${h.details || 'Önceki kayıt durumuna geri döndürüldü.'}
          </div>
        `;
      } else if (eventType === 'created') {
        badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); font-weight:700; font-size:11px;">✨ İlk Kayıt</span>';
        descHtml = `
          <div style="font-size:12.5px; color:#fff; margin:4px 0;">
            <strong>${h.new_title || prod?.title || ''}</strong> (Fiyat: ₺${Number(h.new_price || prod?.price || 0).toFixed(2)})
          </div>
        `;
      } else {
        badgeHtml = `<span class="badge badge-secondary">${eventType}</span>`;
        descHtml = `<div style="font-size:12px; color:#94a3b8; margin:4px 0;">${h.details || '-'}</div>`;
      }

      const hasRevertTarget = (h.old_price !== null && h.old_price !== undefined) || (h.old_title);
      const canRevert = hasRevertTarget && eventType !== 'created' && eventType !== 'restored';

      html += `
        <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 16px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              ${badgeHtml}
              <span style="font-size:11.5px; color:#94a3b8;">📅 ${h.created_at || '-'}</span>
              <span style="font-size:11px; color:#64748b;">• ${h.device_name || h.source || 'Sistem'}</span>
            </div>
            ${descHtml}
            ${h.details && eventType !== 'restored' ? `<div style="font-size:11px; color:#64748b; margin-top:2px;">${h.details}</div>` : ''}
          </div>
          ${canRevert ? `
            <button class="btn btn-secondary btn-sm" onclick="revertHistoryItem(${h.id}, '${barcode}')" style="font-weight:700; font-size:11px; color:#34d399; border-color:rgba(52,211,153,0.4); background:rgba(52,211,153,0.1); white-space:nowrap; padding:6px 10px;" title="Bu tarihteki eski fiyata ve ada geri dön">
              ↩️ Geri Dön
            </button>
          ` : ''}
        </div>
      `;
    });

    listEl.innerHTML = html;
  } catch (err) {
    listEl.innerHTML = `<div style="color:#f87171; text-align:center; padding:20px;">Geçmiş yüklenemedi: ${err.message}</div>`;
  }
}

function closeProductHistoryModal() {
  const modal = document.getElementById('modal-product-history');
  if (modal) modal.style.display = 'none';
  activeHistoryBarcode = null;
}

async function revertHistoryItem(historyId, barcode) {
  if (!confirm('Bu geçmiş kaydındaki eski başlık ve satış fiyatına geri dönmek istediğinize emin misiniz?')) {
    return;
  }

  try {
    const res = await API.revertProductHistory(historyId);
    if (res.status === 'success') {
      showToast(res.message || 'Ürün başarıyla önceki durumuna döndürüldü!', 'success');
      searchProducts(document.getElementById('productSearchInput')?.value || '');
      openProductHistoryModal(barcode);
    } else {
      showToast('Geri alma başarısız: ' + (res.message || 'Hata oluştu'), 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası: ' + err.message, 'error');
  }
}

// 3. HIZLI ÜRÜN DÜZENLEME (INLINE EDIT) MODALI
let activeEditBarcode = null;

function openProductEditModal(barcode) {
  activeEditBarcode = barcode;
  const prod = cachedProductsList.find(p => p.barcode === barcode);
  const modal = document.getElementById('modal-product-edit');
  
  document.getElementById('editModalBarcode').value = barcode;
  const rawTitleEl = document.getElementById('editModalRawTitle');
  if (rawTitleEl) rawTitleEl.value = prod ? (prod.raw_system_title || prod.title || '') : '';
  document.getElementById('editModalTitle').value = prod ? prod.title : '';
  document.getElementById('editModalPrice').value = prod ? Number(prod.price || 0).toFixed(2) : '0.00';
  document.getElementById('editModalBrand').value = prod ? (prod.brand || 'YARENLER') : 'YARENLER';

  if (modal) modal.style.display = 'flex';
}

function closeProductEditModal() {
  const modal = document.getElementById('modal-product-edit');
  if (modal) modal.style.display = 'none';
  activeEditBarcode = null;
}

async function saveProductEdit() {
  if (!activeEditBarcode) return;
  const barcode = activeEditBarcode;
  const title = document.getElementById('editModalTitle').value.trim();
  const price = parseFloat(document.getElementById('editModalPrice').value);
  const brand = document.getElementById('editModalBrand').value.trim();

  if (!title) {
    showToast('Ürün adı boş bırakılamaz.', 'error');
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Geçerli bir fiyat giriniz.', 'error');
    return;
  }

  const saveBtn = document.getElementById('editModalSaveBtn');
  if (saveBtn) saveBtn.disabled = true;

  try {
    const res = await API.updateProduct(barcode, {
      title: title,
      price: price,
      brand: brand,
      device_name: 'Ana PC Kontrol Masası'
    });

    if (saveBtn) saveBtn.disabled = false;
    if (res.status === 'success') {
      showToast('Ürün başarıyla güncellendi ve geçmişe işlendi!', 'success');
      closeProductEditModal();
      searchProducts(document.getElementById('productSearchInput')?.value || '');
    } else {
      showToast('Güncelleme hatası: ' + (res.message || 'Hata oluştu'), 'error');
    }
  } catch (err) {
    if (saveBtn) saveBtn.disabled = false;
    showToast('Sunucu hatası: ' + err.message, 'error');
  }
}

// ==========================================================================
// 5. KARA LİSTE & FİLTRE YÖNETİMİ MODALI
// ==========================================================================
let currentBlacklistData = {
  words: [],
  barcodes: [],
  min_barcode_length: 3,
  block_negative_prices: true,
  block_zero_prices: true
};

async function openBlacklistModal() {
  const modal = document.getElementById('blacklistModal');
  if (!modal) return;
  modal.style.display = 'flex';

  try {
    const res = await fetch('/api/system/blacklist');
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      currentBlacklistData = json.data;
      renderBlacklistItems();
    }
  } catch (err) {
    console.error('Kara liste yüklenemedi:', err);
  }
}

function closeBlacklistModal() {
  const modal = document.getElementById('blacklistModal');
  if (modal) modal.style.display = 'none';
}

function renderBlacklistItems() {
  const wordsContainer = document.getElementById('blacklistWordsContainer');
  const barcodesContainer = document.getElementById('blacklistBarcodesContainer');
  const minLenSelect = document.getElementById('minBarcodeLengthSelect');
  const negPriceCheck = document.getElementById('blockNegativePricesCheck');
  const zeroPriceCheck = document.getElementById('blockZeroPricesCheck');
  const cigarettesCheck = document.getElementById('blockCigarettesCheck');
  const scaleCheck = document.getElementById('blockScaleProductsCheck');

  if (minLenSelect) minLenSelect.value = String(currentBlacklistData.min_barcode_length || 3);
  if (negPriceCheck) negPriceCheck.checked = currentBlacklistData.block_negative_prices !== false;
  if (zeroPriceCheck) zeroPriceCheck.checked = currentBlacklistData.block_zero_prices !== false;
  if (cigarettesCheck) cigarettesCheck.checked = currentBlacklistData.block_cigarettes !== false;
  if (scaleCheck) scaleCheck.checked = currentBlacklistData.block_scale_products !== false;

  if (wordsContainer) {
    wordsContainer.innerHTML = '';
    const words = currentBlacklistData.words || [];
    if (words.length === 0) {
      wordsContainer.innerHTML = '<span style="color: #64748b; font-size: 11.5px; padding: 4px;">Engellenen kelime yok.</span>';
    } else {
      words.forEach((w, idx) => {
        const tag = document.createElement('span');
        tag.style.cssText = 'background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.35); font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;';
        tag.innerHTML = `<span>${escapeHtml(w)}</span><span onclick="removeBlacklistWord(${idx})" style="cursor: pointer; color: #ef4444; font-weight: 800;" title="Kaldır">✕</span>`;
        wordsContainer.appendChild(tag);
      });
    }
  }

  if (barcodesContainer) {
    barcodesContainer.innerHTML = '';
    const barcodes = currentBlacklistData.barcodes || [];
    if (barcodes.length === 0) {
      barcodesContainer.innerHTML = '<span style="color: #64748b; font-size: 11.5px; padding: 4px;">Engellenen özel barkod yok.</span>';
    } else {
      barcodes.forEach((b, idx) => {
        const tag = document.createElement('span');
        tag.style.cssText = 'background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.35); font-size: 11.5px; font-weight: 700; font-family: monospace; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;';
        tag.innerHTML = `<span>${escapeHtml(b)}</span><span onclick="removeBlacklistBarcode(${idx})" style="cursor: pointer; color: #ef4444; font-weight: 800;" title="Kaldır">✕</span>`;
        barcodesContainer.appendChild(tag);
      });
    }
  }
}

function addBlacklistWord() {
  const input = document.getElementById('newBlacklistWordInput');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (!val) return;
  if (!currentBlacklistData.words) currentBlacklistData.words = [];
  if (!currentBlacklistData.words.includes(val)) {
    currentBlacklistData.words.push(val);
    renderBlacklistItems();
  }
  input.value = '';
}

function removeBlacklistWord(idx) {
  if (currentBlacklistData.words && currentBlacklistData.words[idx] !== undefined) {
    currentBlacklistData.words.splice(idx, 1);
    renderBlacklistItems();
  }
}

function addBlacklistBarcode() {
  const input = document.getElementById('newBlacklistBarcodeInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (!currentBlacklistData.barcodes) currentBlacklistData.barcodes = [];
  if (!currentBlacklistData.barcodes.includes(val)) {
    currentBlacklistData.barcodes.push(val);
    renderBlacklistItems();
  }
  input.value = '';
}

function removeBlacklistBarcode(idx) {
  if (currentBlacklistData.barcodes && currentBlacklistData.barcodes[idx] !== undefined) {
    currentBlacklistData.barcodes.splice(idx, 1);
    renderBlacklistItems();
  }
}

async function saveAndApplyBlacklist() {
  const minLenSelect = document.getElementById('minBarcodeLengthSelect');
  const negPriceCheck = document.getElementById('blockNegativePricesCheck');
  const zeroPriceCheck = document.getElementById('blockZeroPricesCheck');
  const cigarettesCheck = document.getElementById('blockCigarettesCheck');
  const scaleCheck = document.getElementById('blockScaleProductsCheck');

  currentBlacklistData.min_barcode_length = parseInt(minLenSelect?.value || '3', 10);
  currentBlacklistData.block_negative_prices = !!negPriceCheck?.checked;
  currentBlacklistData.block_zero_prices = !!zeroPriceCheck?.checked;
  currentBlacklistData.block_cigarettes = !!cigarettesCheck?.checked;
  currentBlacklistData.block_scale_products = !!scaleCheck?.checked;

  showToast('Kara liste güncelleniyor ve veritabanı temizleniyor...', 'info');

  try {
    const res = await fetch('/api/system/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentBlacklistData)
    });
    const json = await res.json();
    if (json.status === 'success') {
      showToast(json.message || 'Kara liste kuralları uygulandı!', 'success');
      closeBlacklistModal();
      if (typeof searchProducts === 'function') {
        searchProducts(document.getElementById('productSearchInput')?.value || '');
      }
    } else {
      showToast('Hata: ' + (json.message || 'Kara liste kaydedilemedi.'), 'error');
    }
  } catch (err) {
    showToast('Sunucu hatası: ' + err.message, 'error');
  }
}

