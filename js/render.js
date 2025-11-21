import { getState } from './state.js';
import { loadTartans } from './tartans.js';

/**
 * Render tartans as cards only.
 * @param {Array} tartans - Array of tartan objects
 */
export function renderTartans(tartans) {
    const container = document.getElementById('tartan-cards');
    if (!container) return;
    container.innerHTML = '';

    tartans.forEach(t => {
        const card = document.createElement('div');
        card.className = 'card';

        // Thumbnail
        if (t.image_url) {
            const img = document.createElement('img');
            img.src = t.image_url;
            img.className = 'card-image';
            img.addEventListener('click', () => {
                import('./modal.js').then(({ openLightbox }) =>
                    openLightbox(t.image_url, t.tartan_name)
                );
            });
            card.appendChild(img);
        }

        // Name
        const title = document.createElement('h2');
        title.className = 'card-title';
        title.textContent = t.tartan_name || '—';
        card.appendChild(title);

        // Meta info
        const weight = document.createElement('p');
        weight.textContent = `Weight: ${t.weight || '—'}`;
        card.appendChild(weight);

        const weaver = document.createElement('p');
        weaver.textContent = `Weaver: ${t.weavers?.name || 'Unknown'}`;
        card.appendChild(weaver);

        const range = document.createElement('p');
        range.textContent = `Range: ${t.range || '—'}`;
        card.appendChild(range);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-edit';
        editBtn.title = 'Edit';
        editBtn.innerHTML = `
          <img src="https://cdn-icons-png.flaticon.com/512/3642/3642467.png" alt="Edit" width="18" height="18">
          <span>Edit</span>
        `;
        editBtn.addEventListener('click', () => {
            import('./modal.js').then(({ openEditModal }) => openEditModal(t));
        });
        actions.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.className = 'btn btn-catalogue';
        catBtn.title = 'Catalogue';
        catBtn.innerHTML = `
          <img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png" alt="Catalogue" width="18" height="18">
          <span>Catalogue</span>
        `;
        catBtn.addEventListener('click', () => {
            import('./modal.js').then(({ openCatalogueModal }) => openCatalogueModal(t));
        });
        actions.appendChild(catBtn);

        card.appendChild(actions);
        container.appendChild(card);
    });
}

export function renderPaginationControls() {
    const { currentPage, totalPages } = getState();
    const controls = document.getElementById('pagination-controls');
    controls.innerHTML = '';

    const prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.disabled = currentPage === 1;
    prev.onclick = () => loadTartans(currentPage - 1);
    controls.appendChild(prev);

    const windowSize = 5;
    let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let endPage = Math.min(totalPages, startPage + windowSize - 1);
    if (endPage - startPage < windowSize - 1) {
        startPage = Math.max(1, endPage - windowSize + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.disabled = i === currentPage;
        btn.onclick = () => loadTartans(i);
        controls.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = 'Next';
    next.disabled = currentPage === totalPages;
    next.onclick = () => loadTartans(currentPage + 1);
    controls.appendChild(next);

    const info = document.createElement('span');
    info.style.marginLeft = '12px';
    info.textContent = `Page ${currentPage} of ${totalPages}`;
    controls.appendChild(info);
}