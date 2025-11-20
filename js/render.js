import { getState } from './state.js';
import { loadTartans } from './tartans.js';

export function renderTartans(tartans) {
    const tbody = document.getElementById('tartan-list');
    tbody.innerHTML = '';

    tartans.forEach(t => {
        const tr = document.createElement('tr');

        const tdThumb = document.createElement('td');
        if (t.image_url) {
            const img = document.createElement('img');
            img.src = t.image_url;
            img.className = 'thumbnail';
            img.addEventListener('click', () => {
                import('./modals.js').then(({ openLightbox }) => openLightbox(t.image_url, t.tartan_name));
            });
            tdThumb.appendChild(img);
        } else {
            tdThumb.textContent = '—';
        }
        tr.appendChild(tdThumb);

        const tdName = document.createElement('td');
        tdName.textContent = t.tartan_name || '—';
        tr.appendChild(tdName);

        const tdWeight = document.createElement('td');
        tdWeight.textContent = t.weight || '—';
        tr.appendChild(tdWeight);

        const tdWeaver = document.createElement('td');
        tdWeaver.textContent = t.weavers?.name || 'Unknown';
        tr.appendChild(tdWeaver);

        const tdRange = document.createElement('td');
        tdRange.textContent = t.range || '—';
        tr.appendChild(tdRange);

        const tdActions = document.createElement('td');
        tdActions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.title = 'Edit';
        editBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/3642/3642467.png" alt="Edit" width="22" height="22">`;
        editBtn.addEventListener('click', () => {
            import('./modals.js').then(({ openEditModal }) => openEditModal(t));
        });
        tdActions.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.title = 'Catalogue';
        catBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png" alt="Catalogue" width="22" height="22">`;
        catBtn.addEventListener('click', () => {
            import('./modals.js').then(({ openCatalogueModal }) => openCatalogueModal(t));
        });
        tdActions.appendChild(catBtn);

        tr.appendChild(tdActions);
        tbody.appendChild(tr);
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