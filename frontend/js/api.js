// ==========================================================================
// REST API İSTEMCİSİ - api.js (taslak copy/02_KLASOR_HIYERARSISI)
// ==========================================================================

const API = {
  // 1. Ağ & QR Bilgisi
  async getNetworkInfo() {
    const res = await fetch('/api/network/info');
    return await res.json();
  },

  // 2. Yazıcı İşlemleri
  async getPrinters() {
    const res = await fetch('/api/printers');
    return await res.json();
  },

  async savePrinterSettings(settings) {
    const res = await fetch('/api/printer/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  async testPrint() {
    const res = await fetch('/api/printer/test', { method: 'POST' });
    return await res.json();
  },

  async purgePrinterQueue() {
    const res = await fetch('/api/printer/purge', { method: 'POST' });
    return await res.json();
  },

  // 3. Ürün İşlemleri
  async searchProducts(query = '', limit = 0, onlyNew = false, onlyDiff = false) {
    const newParam = onlyNew ? '&only_new=true' : '';
    const diffParam = onlyDiff ? '&only_diff=true' : '';
    const limitParam = limit > 0 ? `&limit=${limit}` : '';
    const res = await fetch(`/api/products?q=${encodeURIComponent(query)}${limitParam}${newParam}${diffParam}`);
    return await res.json();
  },

  async getProduct(barcode) {
    const res = await fetch(`/api/products/${encodeURIComponent(barcode)}`);
    return await res.json();
  },

  async getProductHistory(barcode) {
    const res = await fetch(`/api/products/${encodeURIComponent(barcode)}/history`);
    return await res.json();
  },

  async syncLabelPrices() {
    const res = await fetch('/api/products/sync-label-prices', { method: 'POST' });
    return await res.json();
  },

  // 4. Baskı İşlemleri
  async printSingle(productData, copies = 1) {
    const res = await fetch('/api/print/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productData, copies })
    });
    return await res.json();
  },

  async printBatch(products, copies = 1) {
    const res = await fetch('/api/print/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, copies })
    });
    return await res.json();
  },

  async mobileScan(barcode, autoPrint = true, copies = 1) {
    const res = await fetch('/api/print/mobile_scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, auto_print: autoPrint, copies })
    });
    return await res.json();
  },

  // 5. VegaWin Senkronizasyon (Stok, Fiyat Değişimi & Yeni Ürünler)
  async uploadVegawin(file, deviceName = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (deviceName && deviceName.trim()) {
      formData.append('device_name', deviceName.trim());
    }
    const res = await fetch('/api/vegawin/upload', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async getPriceChanges(unprintedOnly = false) {
    const res = await fetch(`/api/vegawin/changes?unprinted=${unprintedOnly}`);
    return await res.json();
  },

  async printPriceChanges() {
    const res = await fetch('/api/vegawin/print_changes', { method: 'POST' });
    return await res.json();
  },

  async getNewProducts(unprintedOnly = false) {
    const res = await fetch(`/api/vegawin/new-products?unprinted=${unprintedOnly}`);
    return await res.json();
  },

  async printNewProducts() {
    const res = await fetch('/api/vegawin/print_new_products', { method: 'POST' });
    return await res.json();
  },

  // 6. Etiket Şablonları & Varsayılan Yönetimi
  async getTemplates() {
    const res = await fetch('/api/templates');
    return await res.json();
  },

  async saveTemplate(tplData) {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tplData)
    });
    return await res.json();
  },

  async newTemplate(name, baseId = null) {
    const res = await fetch('/api/templates/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base_id: baseId })
    });
    return await res.json();
  },

  async setDefaultTemplate(templateId) {
    const res = await fetch(`/api/templates/${encodeURIComponent(templateId)}/set-default`, {
      method: 'POST'
    });
    return await res.json();
  },

  async deleteTemplate(templateId) {
    const res = await fetch(`/api/templates/${encodeURIComponent(templateId)}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // 7. Sistem, Yedekleme & Kapatma
  async restoreSystem(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/system/restore', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async shutdownServer() {
    const res = await fetch('/api/system/shutdown', { method: 'POST' });
    return await res.json();
  }
};
