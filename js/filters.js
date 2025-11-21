import { SUPABASE_URL, SUPABASE_KEY } from './api.js';
import { activeFilters } from './state.js';
import { fillSelect } from './utils.js';

let filtersPopulated = false;

export function updateFiltersFromData(rows) {
    const clans = [...new Set(rows.map(r => r.clan).filter(Boolean))].sort();
    const weights = [...new Set(rows.map(r => r.weight).filter(Boolean))].sort();
    const ranges = [...new Set(rows.map(r => r.range).filter(Boolean))].sort();
    const weavers = [...new Set(rows.map(r => r.weavers?.name).filter(Boolean))].sort();

    fillSelect('filter-clan', clans, activeFilters.clan);
    fillSelect('filter-weight', weights, activeFilters.weight);
    fillSelect('filter-range', ranges, activeFilters.range);
    fillSelect('filter-weaver', weavers, activeFilters.weaver);
}

export async function ensureFiltersPopulatedOnce(force = false) {
    if (filtersPopulated && !force) return;
    try {
        const url = `${SUPABASE_URL}/rest/v1/tartans?select=clan,weight,range,weavers!inner(name)&order=clan.asc`;
        const res = await fetch(url, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Range: '0-999' }
        });
        if (!res.ok) throw new Error(`Filters HTTP ${res.status}`);
        const rows = await res.json();
        updateFiltersFromData(rows);
        filtersPopulated = true;
    } catch (err) {
        console.error('Error populating filters:', err);
    }
}