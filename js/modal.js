import { getState, setState } from './state.js';
import { normalizePrices, formatGBP } from './utils.js';

export function openLightbox(url, name) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = url || '';
    caption.textContent = name || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

export function closeLightbox() {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    img.src = '';
}

export function openEditModal(t) {
    setState({ currentTartanId: t.id });
    document.getElementById('edit-name').value = t.tartan_name || '';
    document.getElementById('edit-weight').value = t.weight || '';
    document.getElementById('edit-range').value = t.range || '';
    document.getElementById('edit-image').value = t.image_url || '';
    document.getElementById('edit-weaver').value = t.weavers?.name || 'Unknown';
    const modal = document.getElementById('edit-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

export function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    setState({ currentTartanId: null });
}

export function openCatalogueModal(t) {
    const modal = document.getElementById('catalogue-modal');
    const nameEl = document.getElementById('catalogue-name');
    const itemsBody = document.getElementById('catalogue-items');

    nameEl.value = t.tartan_name || '';
    itemsBody.innerHTML = '';

    const rows = normalizePrices(t.prices);

    if (rows.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.textContent = 'No products available';
        tr.appendChild(td);
        itemsBody.appendChild(tr);
    } else {
        rows.forEach(({ name, price }) => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            tdName.textContent = name ?? '—';
            const tdPrice = document.createElement('td');
            tdPrice.textContent = price != null && price !== '' ? formatGBP(price) : '—';
            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            itemsBody.appendChild(tr);
        });
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

export function closeCatalogueModal() {
    const modal = document.getElementById('catalogue-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}