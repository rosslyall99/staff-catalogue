import { getState, setState } from './state.js';
import { normalizePrices, formatGBP } from './utils.js';

const productLabels = {
    kilt: 'Kilt',
    outfit: 'Full Outfit',
    trousers_standard: 'Standard Trousers',
    trousers_fishtail: 'Fishtail Trousers',
    trousers_argyll: 'Argyll Trousers',
    cloth: 'Cloth (per metre)',
    tie: 'Tartan Tie'
};

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
    const itemsBody = document.getElementById('catalogue-items');
    const closeBtn = document.getElementById('catalogue-close');

    if (!modal || !itemsBody || !closeBtn) {
        console.error('Modal elements missing');
        return;
    }

    const modalBox = modal.querySelector('.modal-box');
    if (!modalBox) {
        console.error('Modal box not found');
        return;
    }

    // 🧼 Remove all previous headings and summaries
    modalBox.querySelectorAll('h2, #catalogue-summary').forEach(el => el.remove());

    // 🧵 Inject fresh heading
    const heading = document.createElement('h2');
    heading.textContent = t.tartan_name || '';
    modalBox.insertBefore(heading, modalBox.firstChild);

    // 🧵 Inject fresh summary
    const summary = `${t.range?.weavers?.name ?? ''} • ${t.range?.range_name ?? ''} • ${t.range?.weight?.name ?? ''}`;
    const summaryEl = document.createElement('p');
    summaryEl.id = 'catalogue-summary';
    summaryEl.textContent = summary;
    summaryEl.style.textAlign = 'center';
    summaryEl.style.margin = '0.5rem 0 1rem';
    summaryEl.style.fontStyle = 'italic';
    heading.insertAdjacentElement('afterend', summaryEl);

    // 🧼 Clear product list
    itemsBody.innerHTML = '';

    // 🧵 Filter products with valid price
    const products = (t.range?.range_products || []).filter(p => p.price != null && p.price !== '');

    if (products.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'No products available';
        tr.appendChild(td);
        itemsBody.appendChild(tr);
    } else {
        products.forEach(p => {
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.textContent = productLabels[p.product_type] ?? formatProductLabel(p.product_type);

            const tdPrice = document.createElement('td');
            tdPrice.textContent = formatGBP(p.price);

            const tdLink = document.createElement('td');
            tdLink.innerHTML = p.url
                ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">
                      <img src="https://cdn-icons-png.flaticon.com/512/25/25284.png" alt="Link" width="18" height="18" style="vertical-align:middle;">
                   </a>`
                : '—';

            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            tr.appendChild(tdLink);
            itemsBody.appendChild(tr);
        });
    }

    // 🧼 Style Close button
    closeBtn.className = 'btn btn-catalogue';
    closeBtn.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" alt="Close" width="18" height="18">
        <span>Close</span>
    `;

    // ✅ Show modal
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

export function closeCatalogueModal() {
    const modal = document.getElementById('catalogue-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}