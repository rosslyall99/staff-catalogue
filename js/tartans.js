import { SUPABASE_URL, SUPABASE_KEY } from './api.js';
import { activeFilters, getState, setState } from './state.js';
import { renderTartans, renderPaginationControls } from './render.js';
import { updateFiltersFromData, ensureFiltersPopulatedOnce } from './filters.js';

const { itemsPerPage } = getState();

/* =========================
   Build query URL (inner join + or clause)
   ========================= */
export function buildTartansUrl() {
    let url = `${SUPABASE_URL}/rest/v1/tartans?select=*,weavers!inner(*)&order=tartan_name.asc`;

    if (activeFilters.clan) url += `&clan=eq.${encodeURIComponent(activeFilters.clan)}`;
    if (activeFilters.weight) url += `&weight=eq.${encodeURIComponent(activeFilters.weight)}`;
    if (activeFilters.range) url += `&range=eq.${encodeURIComponent(activeFilters.range)}`;
    if (activeFilters.weaver) url += `&weavers.name=eq.${encodeURIComponent(activeFilters.weaver)}`;

    if (activeFilters.query) {
        const q = activeFilters.query.replace(/[^\w\s-]/gi, '').toLowerCase();
        const rawClause = `(tartan_name.ilike.*${q}*)`;
        url += `&or=${encodeURIComponent(rawClause)}`;
        // Alternative: include weaver search too
        // url += `&or=(tartan_name.ilike.*${q}*,weavers.name.ilike.*${q}*)`;
    }

    return url;
}

/* =========================
   Loader with pagination
   ========================= */
export async function loadTartans(page = 1) {
    try {
        const { itemsPerPage } = getState();
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

        // update shared state
        setState({
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / itemsPerPage))
        });

        renderTartans(data);
        renderPaginationControls();

        // Decide which filter population to use
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