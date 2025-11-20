const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

let itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let currentTartanId = null;

const activeFilters = { query: '', clan: '', weight: '', weaver: '', range: '' };

/* =========================
   Build query URL (inner join + or clause)
   ========================= */
function buildTartansUrl() {
    let url = `${SUPABASE_URL}/rest/v1/tartans?select=*,weavers!inner(*)&order=tartan_name.asc`;

    if (activeFilters.clan) url += `&clan=eq.${encodeURIComponent(activeFilters.clan)}`;
    if (activeFilters.weight) url += `&weight=eq.${encodeURIComponent(activeFilters.weight)}`;
    if (activeFilters.range) url += `&range=eq.${encodeURIComponent(activeFilters.range)}`;
    if (activeFilters.weaver) url += `&weavers.name=eq.${encodeURIComponent(activeFilters.weaver)}`;

    if (activeFilters.query) {
        const q = activeFilters.query.replace(/[^\w\s-]/gi, '').toLowerCase();
        // Option A: fully encode
        const rawClause = `(tartan_name.ilike.*${q}*)`;
        url += `&or=${encodeURIComponent(rawClause)}`;

        // Option B: leave raw (works too)
        // url += `&or=(tartan_name.ilike.*${q}*,weavers.name.ilike.*${q}*)`;
    }

    return url;
}

/* =========================
   Loader with pagination
   ========================= */
async function loadTartans(page = 1) {
    try {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;
        const url = buildTartansUrl();

        console.log('[tartans GET]', `${url} [Range ${start}-${end}]`);

        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: 'count=exact',
                Range: `${start}-${end}`
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const cr = res.headers.get('Content-Range');
        const total = cr?.includes('/') ? parseInt(cr.split('/')[1], 10) : data.length;

        totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
        currentPage = page;

        renderTartans(data);
        renderPaginationControls();
        // 👇 Decide which filter population to use
        if (activeFilters.query) {
            updateFiltersFromData(data);   // only show options from current results
        } else {
            ensureFiltersPopulatedOnce();  // show full global options
        }

    } catch (err) {
        console.error('Error loading tartans:', err);
        document.getElementById('tartan-list').innerHTML = '';
        document.getElementById('pagination-controls').innerHTML = '';
    }
}

/* =========================
   Render table
   ========================= */
function renderTartans(tartans) {
    const tbody = document.getElementById('tartan-list');
    tbody.innerHTML = '';

    tartans.forEach(t => {
        const tr = document.createElement('tr');

        const tdThumb = document.createElement('td');
        if (t.image_url) {
            const img = document.createElement('img');
            img.src = t.image_url; img.className = 'thumbnail';
            img.addEventListener('click', () => openLightbox(t.image_url, t.tartan_name));
            tdThumb.appendChild(img);
        } else { tdThumb.textContent = '—'; }
        tr.appendChild(tdThumb);

        const tdName = document.createElement('td');
        tdName.textContent = t.tartan_name || '—'; tr.appendChild(tdName);

        const tdWeight = document.createElement('td');
        tdWeight.textContent = t.weight || '—'; tr.appendChild(tdWeight);

        const tdWeaver = document.createElement('td');
        tdWeaver.textContent = t.weavers?.name || 'Unknown'; tr.appendChild(tdWeaver);

        const tdRange = document.createElement('td');
        tdRange.textContent = t.range || '—'; tr.appendChild(tdRange);

        const tdActions = document.createElement('td');
        tdActions.className = 'actions';
        const editBtn = document.createElement('button');
        editBtn.title = 'Edit';
        editBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/3642/3642467.png" alt="Edit" width="22" height="22">`;
        editBtn.addEventListener('click', () => openEditModal(t));
        tdActions.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.title = 'Catalogue';
        catBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png" alt="Catalogue" width="22" height="22">`;
        catBtn.addEventListener('click', () => openCatalogueModal(t));
        tdActions.appendChild(catBtn);

        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

/* =========================
   Pagination (windowed)
   ========================= */
function renderPaginationControls() {
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

/* =========================
   Filters + search wiring
   ========================= */
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-search');

document.getElementById('toggle-filters')?.addEventListener('click', () => {
    const container = document.getElementById('filters-container');
    // Force flex so it shows regardless of prior inline/CSS
    const nowHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
    container.style.display = nowHidden ? 'flex' : 'none';
});

searchInput?.addEventListener('input', (e) => {
    activeFilters.query = (e.target.value || '').toLowerCase().trim();
    loadTartans(1);

    // Show/hide clear button
    if (activeFilters.query) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }
});

clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    activeFilters.query = '';
    clearBtn.style.display = 'none';

    // Reset filter selections and state
    activeFilters.clan = '';
    activeFilters.weight = '';
    activeFilters.weaver = '';
    activeFilters.range = '';

    // Reset filters to global options
    ensureFiltersPopulatedOnce(true);

    // Reload tartans with no search filter
    loadTartans(1);
});

['filter-clan', 'filter-weight', 'filter-weaver', 'filter-range'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
        const val = (e.target.value || '').trim();
        if (id === 'filter-clan') activeFilters.clan = val;
        if (id === 'filter-weight') activeFilters.weight = val;
        if (id === 'filter-weaver') activeFilters.weaver = val;
        if (id === 'filter-range') activeFilters.range = val;
        loadTartans(1);
    });
});

function updateFiltersFromData(rows) {
    const clans = [...new Set(rows.map(r => r.clan).filter(Boolean))].sort();
    const weights = [...new Set(rows.map(r => r.weight).filter(Boolean))].sort();
    const ranges = [...new Set(rows.map(r => r.range).filter(Boolean))].sort();
    const weavers = [...new Set(rows.map(r => r.weavers?.name).filter(Boolean))].sort();

    fillSelect('filter-clan', clans);
    fillSelect('filter-weight', weights);
    fillSelect('filter-range', ranges);
    fillSelect('filter-weaver', weavers);
}

/* =========================
   Populate filter dropdowns (inner join for weavers)
   ========================= */
let filtersPopulated = false;

async function ensureFiltersPopulatedOnce(force = false) {
    if (filtersPopulated && !force) return;

    try {
        const url = `${SUPABASE_URL}/rest/v1/tartans?select=clan,weight,range,weavers!inner(name)&order=clan.asc`;
        console.log('[filters GET]', url);
        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Range: '0-999'
            }
        });
        if (!res.ok) throw new Error(`Filters HTTP ${res.status}`);
        const rows = await res.json();

        const clans = [...new Set(rows.map(r => r.clan).filter(Boolean))].sort();
        const weights = [...new Set(rows.map(r => r.weight).filter(Boolean))].sort();
        const ranges = [...new Set(rows.map(r => r.range).filter(Boolean))].sort();
        const weavers = [...new Set(rows.map(r => r.weavers?.name).filter(Boolean))].sort();

        fillSelect('filter-clan', clans);
        fillSelect('filter-weight', weights);
        fillSelect('filter-range', ranges);
        fillSelect('filter-weaver', weavers);

        filtersPopulated = true;
    } catch (err) {
        console.error('Error populating filters:', err);
    }
}

function fillSelect(id, values) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = select.getAttribute('data-label') || 'Select';
    select.appendChild(defaultOption);

    values.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
    });
}

/* =========================
   Lightbox
   ========================= */
function openLightbox(url, name) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = url || '';
    caption.textContent = name || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    img.src = '';
}

/* =========================
   Edit modal + save/delete
   ========================= */
function openEditModal(t) {
    currentTartanId = t.id;
    document.getElementById('edit-name').value = t.tartan_name || '';
    document.getElementById('edit-weight').value = t.weight || '';
    document.getElementById('edit-range').value = t.range || '';
    document.getElementById('edit-image').value = t.image_url || '';
    document.getElementById('edit-weaver').value = t.weavers?.name || 'Unknown';
    const modal = document.getElementById('edit-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    currentTartanId = null;
}

function openCatalogueModal(t) {
    const modal = document.getElementById('catalogue-modal');
    const nameEl = document.getElementById('catalogue-name');
    const itemsBody = document.getElementById('catalogue-items');

    nameEl.value = t.tartan_name || '';
    itemsBody.innerHTML = '';

    const raw = t.prices; // JSONB from Supabase

    const rows = normalizePrices(raw);

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

// Convert JSONB into a uniform array of { name, price }
function normalizePrices(raw) {
    if (!raw) return [];

    // If Supabase returns JSON already parsed:
    if (typeof raw === 'object') {
        // Array of objects
        if (Array.isArray(raw)) {
            return raw.map(item => ({
                name: item.name ?? item.product ?? '',
                price: item.price ?? item.amount ?? null
            })).filter(r => r.name);
        }
        // Object map: { "Kilt Hire": 95, "Jacket Hire": 45 }
        return Object.entries(raw).map(([key, val]) => ({
            name: key,
            price: typeof val === 'object' ? (val.price ?? val.amount ?? null) : val
        }));
    }

    // If JSONB came through as a string, try to parse
    try {
        const parsed = JSON.parse(raw);
        return normalizePrices(parsed);
    } catch {
        return [];
    }
}

function formatGBP(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function closeCatalogueModal() {
    const modal = document.getElementById('catalogue-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentTartanId) return;

    const updated = {
        tartan_name: document.getElementById('edit-name').value,
        weight: document.getElementById('edit-weight').value,
        range: document.getElementById('edit-range').value,
        image_url: document.getElementById('edit-image').value
    };

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tartans?id=eq.${currentTartanId}`, {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify(updated)
        });
        if (!res.ok) throw new Error(`Save HTTP ${res.status}`);
        closeEditModal();
        loadTartans(currentPage);
    } catch (err) {
        console.error('Error saving tartan:', err);
    }
});

document.getElementById('delete-btn')?.addEventListener('click', async () => {
    if (!currentTartanId) return;
    if (!confirm('Delete this tartan?')) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tartans?id=eq.${currentTartanId}`, {
            method: 'DELETE',
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        if (!res.ok) throw new Error(`Delete HTTP ${res.status}`);
        closeEditModal();
        loadTartans(currentPage);
    } catch (err) {
        console.error('Error deleting tartan:', err);
    }
});

/* =========================
   Init + modal close wiring
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
    loadTartans(currentPage);

    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    const lightbox = document.getElementById('lightbox');
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    const editModal = document.getElementById('edit-modal');
    editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

    // ✅ Add this line for the cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', closeEditModal);

    document.getElementById('catalogue-close')?.addEventListener('click', closeCatalogueModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox(); closeEditModal();
            const cat = document.getElementById('catalogue-modal');
            cat?.classList.remove('open'); cat?.setAttribute('aria-hidden', 'true');
        }
    });
});