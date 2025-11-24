import { SUPABASE_URL, SUPABASE_KEY } from './api.js';
import { activeFilters, getState, setState } from './state.js';
import { renderTartans, renderPaginationControls } from './render.js';
import { updateFiltersFromData, ensureFiltersPopulatedOnce } from './filters.js';

/* =========================
   Responsive items per page
   ========================= */
function getItemsPerPage() {
    const width = window.innerWidth;

    if (width >= 1440) return 18;   // Extra‑Large screens → 18 cards (6 per row)
    if (width >= 1024) return 12;   // Large screens → 12 cards (4 per row)
    if (width >= 600) return 12;    // Medium screens → 12 cards (4 per row)
    return 8;                       // Small screens → 8 cards (1 per row)
}

/* =========================
   Build query URL for cards
   ========================= */
export function buildTartansUrl() {
    let url = `${SUPABASE_URL}/rest/v1/tartans?select=*,range!inner(range_name,weight!inner(name),weavers!inner(name),range_products(*))&order=tartan_name.asc`;

    if (activeFilters.clan) {
        url += `&clan=eq.${encodeURIComponent(activeFilters.clan)}`;
    }
    if (activeFilters.weight) {
        url += `&range.weight.name=eq.${encodeURIComponent(activeFilters.weight)}`;
    }
    if (activeFilters.range) {
        url += `&range.range_name=eq.${encodeURIComponent(activeFilters.range)}`;
    }
    if (activeFilters.weaver) {
        url += `&range.weavers.name=eq.${encodeURIComponent(activeFilters.weaver)}`;
    }

    if (activeFilters.query) {
        const q = activeFilters.query.replace(/[^\w\s-]/gi, '').toLowerCase();
        const rawClause = `(tartan_name.ilike.*${q}*)`;
        url += `&or=${encodeURIComponent(rawClause)}`;
        // Optional: include weaver search too
        // url += `&or=${encodeURIComponent(`(tartan_name.ilike.*${q}*,range.weavers.name.ilike.*${q}*)`)}`;
    }

    return url;
}

/* =========================================
   Build slim URL for filter option population
   ========================================= */
function buildFilterOptionsUrl() {
    let url = `${SUPABASE_URL}/rest/v1/tartans?select=clan,range!inner(range_name,weight!inner(name),weavers!inner(name))&order=clan.asc`;

    if (activeFilters.clan) {
        url += `&clan=eq.${encodeURIComponent(activeFilters.clan)}`;
    }
    if (activeFilters.weight) {
        url += `&range.weight.name=eq.${encodeURIComponent(activeFilters.weight)}`;
    }
    if (activeFilters.range) {
        url += `&range.range_name=eq.${encodeURIComponent(activeFilters.range)}`;
    }
    if (activeFilters.weaver) {
        url += `&range.weavers.name=eq.${encodeURIComponent(activeFilters.weaver)}`;
    }

    if (activeFilters.query) {
        const q = activeFilters.query.replace(/[^\w\s-]/gi, '').toLowerCase();
        const rawClause = `(tartan_name.ilike.*${q}*)`;
        url += `&or=${encodeURIComponent(rawClause)}`;
    }

    return url;
}

/* =========================
   Loader with pagination
   ========================= */
export async function loadTartans(page = 1) {
    try {
        const itemsPerPage = getItemsPerPage();
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;

        // Page-limited fetch for visible cards
        const url = buildTartansUrl();
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

        setState({
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / itemsPerPage))
        });

        renderTartans(data);
        renderPaginationControls();

        // ✅ Fetch all filtered rows in chunks for filter dropdowns
        const optionsUrl = buildFilterOptionsUrl();
        const chunkSize = 1000;
        let allRows = [];
        let chunkStart = 0;
        let done = false;

        while (!done) {
            const resChunk = await fetch(optionsUrl, {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    Range: `${chunkStart}-${chunkStart + chunkSize - 1}`
                }
            });
            if (!resChunk.ok) break;

            const chunk = await resChunk.json();
            allRows.push(...chunk);
            if (chunk.length < chunkSize) done = true;
            chunkStart += chunkSize;
        }

        updateFiltersFromData(allRows);
    } catch (err) {
        console.error('Error loading tartans:', err);
        const cards = document.getElementById('tartan-cards');
        const pager = document.getElementById('pagination-controls');
        if (cards) cards.innerHTML = '';
        if (pager) pager.innerHTML = '';
    }
}

/* =========================
   Update record
   ========================= */
export async function updateTartan(id, updates) {
    const url = `${SUPABASE_URL}/rest/v1/tartans?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(updates)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed: ${res.status} ${text}`);
    }
    return res.json();
}

export async function deleteTartan(id) {
    const url = `${SUPABASE_URL}/rest/v1/tartans?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${res.status} ${text}`);
    }
    return true;
}

/* =========================
   Recalculate on resize
   ========================= */
window.addEventListener('resize', () => {
    const { currentPage } = getState();
    loadTartans(currentPage);
});