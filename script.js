const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

let currentTartanId = null;

/* Load + render */
async function loadTartans() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/tartans?select=*,weavers(*)`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });
        const tartans = await res.json();
        renderTartans(tartans);
    } catch (err) {
        console.error('Error loading tartans:', err);
    }
}

function renderTartans(tartans) {
    const tbody = document.getElementById('tartan-list');
    tbody.innerHTML = '';

    tartans.forEach(tartan => {
        const row = document.createElement('tr');

        // Thumbnail
        const thumbCell = document.createElement('td');
        if (tartan.image_url) {
            const img = document.createElement('img');
            img.src = tartan.image_url;
            img.className = 'thumbnail';
            img.alt = tartan.tartan_name || 'Tartan image';
            img.addEventListener('click', () => openLightbox(tartan.image_url, tartan.tartan_name));
            thumbCell.appendChild(img);
        } else {
            thumbCell.textContent = '—';
        }
        row.appendChild(thumbCell);

        // Name
        const nameCell = document.createElement('td');
        nameCell.textContent = tartan.tartan_name || '—';
        row.appendChild(nameCell);

        // Weight
        const weightCell = document.createElement('td');
        weightCell.textContent = tartan.weight || '—';
        row.appendChild(weightCell);

        // Weaver
        const weaverCell = document.createElement('td');
        weaverCell.textContent = tartan.weavers?.name || '—';
        row.appendChild(weaverCell);

        // Range
        const rangeCell = document.createElement('td');
        rangeCell.textContent = tartan.range || '—';
        row.appendChild(rangeCell);

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.title = 'Edit';
        editBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/3642/3642467.png" alt="Edit" width="22" height="22">`;
        editBtn.addEventListener('click', () => openEditModal(tartan));
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.title = 'Catalogue';
        catBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png" alt="Catalogue" width="22" height="22">`;
        catBtn.addEventListener('click', () => openCatalogueModal(tartan));
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

/* Lightbox */
function openLightbox(url, name) {
    document.getElementById('lightbox-img').src = url || '';
    document.getElementById('lightbox-caption').textContent = name || '';
    const modal = document.getElementById('lightbox');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

document.getElementById('lightbox-close')?.addEventListener('click', () => {
    const modal = document.getElementById('lightbox');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.getElementById('lightbox-img').src = '';
});

/* Edit modal */
function openEditModal(tartan) {
    currentTartanId = tartan.id;
    document.getElementById('edit-name').value = tartan.tartan_name || '';
    document.getElementById('edit-weight').value = tartan.weight || '';
    document.getElementById('edit-range').value = tartan.range || '';
    document.getElementById('edit-image').value = tartan.image_url || '';
    document.getElementById('edit-weaver').value = tartan.weavers?.name || '';
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

document.getElementById('cancel-btn')?.addEventListener('click', closeEditModal);

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

        const result = await res.json();
        console.log("PATCH result", res.status, result);
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        closeEditModal();
        loadTartans();
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
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        });

        console.log("Delete result", res.status);
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        closeEditModal();
        loadTartans();
    } catch (err) {
        console.error('Error deleting tartan:', err);
    }
});

/* Catalogue modal (styled to match edit modal) */
function openCatalogueModal(tartan) {
    const modal = document.getElementById('catalogue-modal');
    const title = document.getElementById('catalogue-title');
    const list = document.getElementById('catalogue-list');

    title.textContent = `Catalogue: ${tartan.tartan_name || ''}`;
    list.innerHTML = '';

    let prices = {};
    try {
        prices = typeof tartan.prices === 'string' ? JSON.parse(tartan.prices) : (tartan.prices || {});
    } catch (err) {
        console.error('Error parsing prices JSON', err);
        prices = {};
    }

    Object.entries(prices).forEach(([product, price]) => {
        const item = document.createElement('div');
        item.className = 'catalogue-item';
        item.innerHTML = `
      <span class="label">${product}</span>
      <span class="value">£${price}</span>
    `;
        list.appendChild(item);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

document.getElementById('catalogue-close')?.addEventListener('click', () => {
    const modal = document.getElementById('catalogue-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
});

/* Init */
loadTartans();