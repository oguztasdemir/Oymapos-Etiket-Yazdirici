// ==========================================================================
// OYMAPOS - ANA UYGULAMA BAŞLATICI, SEKME VE KISAYOL YÖNETİCİSİ
// ==========================================================================

let activeTab = 'tab-search';

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
  loadSyncHistory();
  initVegaWinDropzone();
  initStudioDragAndDrop();

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

// 1. KLAVYE KISAYOLLARI
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl + K veya / -> Arama Kutusuna Odaklan
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) {
        document.querySelector('[data-tab="tab-search"]')?.click();
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
  if (target === 'tab-vegawin') {
    if (typeof loadVegawinDevicesAndData === 'function') loadVegawinDevicesAndData();
    loadPriceChanges();
    loadSyncHistory();
  }
  if (target === 'tab-devices') {
    loadNetworkInfo();
    loadConnectedDevicesTable();
  }
}

// 3. DIŞA AKTAR VE KOPYALA
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

  // Tema yükleme
  const savedTheme = localStorage.getItem('theme_mode') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
  updateThemeIcon();

  updateHomeDashboardInfo();
}

function toggleThemeMode() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme_mode', isLight ? 'light' : 'dark');
  updateThemeIcon();
  showToast(isLight ? 'Açık tema etkinleştirildi' : 'Koyu tema etkinleştirildi', 'info');
}

function updateThemeIcon() {
  const icon = document.getElementById('themeToggleIcon');
  const btn = document.getElementById('themeToggleBtn');
  const isLight = document.body.classList.contains('light-theme');
  if (icon) icon.textContent = isLight ? '☀️' : '🌙';
  if (btn) btn.title = isLight ? 'Koyu Temaya Geç' : 'Açık Temaya Geç';
}

// 4. SIDEBAR KONTROLÜ
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

  if (toggleBtn) {
    toggleBtn.textContent = isCollapsed ? '▶' : '◀';
    toggleBtn.title = isCollapsed ? 'Menüyü Aç' : 'Menüyü Gizle (Tam Ekran)';
  }
  if (topbarToggleIcon) topbarToggleIcon.textContent = isCollapsed ? '☰' : '✕';
  if (topbarToggleText) topbarToggleText.textContent = isCollapsed ? 'Menü' : 'Gizle';
}

function updateHomeDashboardInfo() {
  const countEl = document.getElementById('totalProductsCount');
  const totalCount = countEl && countEl.textContent !== '0' ? countEl.textContent : '4.925';
  
  const homeBadge = document.getElementById('homeBadgeTotalProducts');
  if (homeBadge) homeBadge.textContent = `${totalCount} Ürün`;

  const marketName = localStorage.getItem('market_name') || 'YARENLER';
  const homeMarket = document.getElementById('homeMarketName');
  const topbarMarket = document.getElementById('topbarMarketName');
  if (homeMarket) homeMarket.textContent = marketName;
  if (topbarMarket) topbarMarket.textContent = marketName;

  const printerSelect = document.getElementById('printerSelect');
  const homePrinter = document.getElementById('homeInfoPrinterName');
  if (homePrinter && printerSelect && printerSelect.value) {
    homePrinter.textContent = printerSelect.value;
  }

  const topbarIp = document.getElementById('topbarIp');
  const homeIp = document.getElementById('homeInfoIpAddress');
  if (topbarIp && topbarIp.textContent && topbarIp.textContent !== '127.0.0.1' && !topbarIp.textContent.includes('{{')) {
    if (homeIp) homeIp.textContent = topbarIp.textContent;
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
