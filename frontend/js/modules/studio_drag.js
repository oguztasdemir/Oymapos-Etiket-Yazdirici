// ==========================================================================
// OYMAPOS - STÜDYO SÜRÜKLE-BIRAK, ELEMAN SEÇİMİ VE ÖZEL KATMAN MOTORU
// ==========================================================================

let selectedCanvasElement = null;
let isDraggingElement = false;
let dragStartX = 0;
let dragStartY = 0;
let elemStartX = 0;
let elemStartY = 0;

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

  renderBarcodeSvg("#editor-barcode-svg", "8690504114925");

  const todayDate = getTodayTrDate();
  const dateEl = document.getElementById('editor-lbl-date');
  const inpDate = document.getElementById('studio-inp-date');
  if (dateEl) dateEl.textContent = todayDate;
  if (inpDate) inpDate.value = todayDate;

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
  
  div.addEventListener('input', () => {
    if (typeof syncLabelText === 'function') syncLabelText(div);
  });
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
