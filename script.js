const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

let currentTartanId = null;

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
            img.alt = tartan.tartan_name;
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
        editBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#333"/></svg>';
        editBtn.addEventListener('click', () => openEditModal(tartan));
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.title = 'Catalogue';
        catBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#333">
        <path d="M3 4c0-1.1.9-2 2-2h6v18H5c-1.1 0-2-.9-2-2V4zm16-2h-6v18h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>`;
        catBtn.addEventListener('click', () => openCatalogueModal(tartan));
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

/* Lightbox */
function openLightbox(url, name) {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-caption').textContent = name;
    document.getElementById('lightbox').classList.add('open');
    document.getElementById('lightbox').setAttribute('aria-hidden', 'false');
}

document.getElementById('lightbox-close')?.addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('lightbox').setAttribute('aria-hidden', 'true');
    document.getElementById('lightbox-img').src = '';
});

/* Edit Modal */
function openEditModal(tartan) {
    currentTartanId = tartan.id;
    document.getElementById('edit-name').value = tartan.tartan_name || '';
    document.getElementById('edit-weight').value = tartan.weight || '';
    document.getElementById('edit-range').value = tartan.range || '';
    document.getElementById('edit-image').value = tartan.image_url || '';
    document.getElementById('edit-weaver').value = tartan.weavers?.name || '';
    document.getElementById('edit-modal').classList.add('open');
    document.getElementById('edit-modal').setAttribute('aria-hidden', 'false');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('open');
    document.getElementById('edit-modal').setAttribute('aria-hidden', 'true');
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

/* Catalogue Modal */
function openCatalogueModal(tartan) {
    const modal = document.getElementById('catalogue-modal');
    const content = document.getElementById('catalogue-content');

    let prices = {};
    try {
        prices = typeof tartan.prices === 'string' ? JSON.parse(tartan.prices) : tartan.prices;
    } catch (err) {
        console.error("Error parsing prices JSON", err);
    }

    let html = `<h3>${tartan.tartan_name}</h3><ul>`;
    for (const [product, price] of Object.entries(prices || {})) {
        html += `<li><strong>${product}</strong>: £${price}</li>`;
    }
    html += '</ul>';
    content.innerHTML = html;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

document.getElementById('catalogue-close')?.addEventListener('click', () => {
    document.getElementById('catalogue-modal').classList.remove('open');
    document.getElementById('catalogue-modal').setAttribute('aria-hidden', 'true');
});

loadTartans();