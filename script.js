// ===== CONFIG =====
const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWJuYmx1Y2Z0eXpidHplcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE2MDcsImV4cCI6MjA3ODY5NzYwN30.f60ZZIQh0lntvTACdKU0HuLUHgtsbQbwq_csFdeQcRc'; // staff-only page: okay for now if RLS limits data

// Base select for grid
const GRID_SELECT = [
    'id',
    'tartan_name',
    'range',
    'weight',
    'image_url',
    'weavers(name)'
].join(',');

// Full select for modal
const FULL_SELECT = [
    'id',
    'tartan_name',
    'range',
    'weight',
    'image_url',
    'cloth_width',
    'primary_color',
    'secondary_color',
    'description',
    'prices',
    'weavers(name,address,phone,email,website,notes)'
].join(',');

// ===== UTIL =====
const headers = {
    apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWJuYmx1Y2Z0eXpidHplcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE2MDcsImV4cCI6MjA3ODY5NzYwN30.f60ZZIQh0lntvTACdKU0HuLUHgtsbQbwq_csFdeQcRc,
    Authorization: `Bearer ${eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWJuYmx1Y2Z0eXpidHplcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE2MDcsImV4cCI6MjA3ODY5NzYwN30.f60ZZIQh0lntvTACdKU0HuLUHgtsbQbwq_csFdeQcRc}`
};

const debounce = (fn, delay = 250) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
};

const qs = (o) =>
    Object.entries(o)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

// ===== API =====
async function fetchGrid(q = '') {
    const base = `${SUPABASE_URL}/rest/v1/tartans`;
    const params = {
        select: GRID_SELECT,
        order: 'tartan_name.asc',
        limit: '100'
    };

    if (q && q.trim().length > 0) {
        const term = q.trim();
        // Search across name, range, and weaver name
        params.or = `(tartan_name.ilike.*${term}*,range.ilike.*${term}*,weavers.name.ilike.*${term}*)`;
    }

    const url = `${base}?${qs(params)}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Grid fetch failed: ${res.status}`);
    return res.json();
}

async function fetchDetail(id) {
    const base = `${SUPABASE_URL}/rest/v1/tartans`;
    const params = {
        select: FULL_SELECT,
        id: `eq.${id}`,
        limit: '1'
    };
    const url = `${base}?${qs(params)}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Detail fetch failed: ${res.status}`);
    const data = await res.json();
    return data[0];
}

// ===== RENDER =====
function renderRows(rows) {
    const tbody = document.getElementById('tartanTable');
    tbody.innerHTML = '';

    rows.forEach((row) => {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.textContent = row.tartan_name ?? '';
        tr.appendChild(tdName);

        const tdWeaver = document.createElement('td');
        tdWeaver.textContent = row.weavers?.name ?? '';
        tr.appendChild(tdWeaver);

        const tdRange = document.createElement('td');
        tdRange.textContent = row.range ?? '';
        tr.appendChild(tdRange);

        const tdWeight = document.createElement('td');
        tdWeight.textContent = row.weight ?? '';
        tr.appendChild(tdWeight);

        const tdThumb = document.createElement('td');
        const img = document.createElement('img');
        img.src = row.image_url || 'https://placehold.co/64x64?text=Tartan';
        img.alt = row.tartan_name ?? 'tartan';
        tdThumb.appendChild(img);
        tr.appendChild(tdThumb);

        const tdAction = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'button';
        btn.textContent = 'View';
        btn.addEventListener('click', () => openModal(row.id));
        tdAction.appendChild(btn);
        tr.appendChild(tdAction);

        document.getElementById('tartanTable').appendChild(tr);
    });
}

function renderModal(data) {
    document.getElementById('modalName').textContent = data.tartan_name ?? '';
    const img = document.getElementById('modalImage');
    img.src = data.image_url || 'https://placehold.co/800x300?text=Tartan';
    img.alt = data.tartan_name ?? 'tartan';

    const weaver = data.weavers || {};
    document.getElementById('modalWeaver').innerHTML = `
    <strong>Weaver:</strong> ${weaver.name ?? ''}
    <br /><strong>Website:</strong> ${weaver.website ? `<a href="${weaver.website}" target="_blank">${weaver.website}</a>` : '—'}
    <br /><strong>Email:</strong> ${weaver.email ?? '—'}
    <br /><strong>Phone:</strong> ${weaver.phone ?? '—'}
  `;

    document.getElementById('modalDescription').textContent = data.description ?? '';

    const prices = data.prices || {};
    const pricesEl = document.getElementById('modalPrices');
    pricesEl.innerHTML = '';
    Object.entries(prices).forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'price-item';
        div.innerHTML = `<strong>${label}:</strong> ${value}`;
        pricesEl.appendChild(div);
    });

    const productUrlEl = document.getElementById('modalProductUrl');
    productUrlEl.style.display = 'none'; // show later if you add product_url

    document.getElementById('modal').classList.remove('hidden');
}

async function openModal(id) {
    try {
        const data = await fetchDetail(id);
        renderModal(data);
    } catch (e) {
        alert(`Failed to load details: ${e.message}`);
    }
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// ===== INIT =====
async function init() {
    // Seed table
    try {
        const rows = await fetchGrid('');
        renderRows(rows);
    } catch (e) {
        alert(`Initial load failed: ${e.message}`);
    }

    // Wire search
    const onInput = debounce(async (e) => {
        try {
            const q = e.target.value;
            const rows = await fetchGrid(q);
            renderRows(rows);
        } catch (err) {
            console.error(err);
        }
    }, 250);
    document.getElementById('search').addEventListener('input', onInput);

    // Wire modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.querySelector('#modal .overlay').addEventListener('click', closeModal);
}

init();