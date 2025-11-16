const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

let currentTartanId = null;

async function loadTartans() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/tartans?select=*,weavers(*)`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        renderTartans(data);
    } catch (error) {
        console.error('Error loading tartans:', error);
    }
}

function renderTartans(tartans) {
    const container = document.getElementById('tartan-list');
    container.innerHTML = '';

    tartans.forEach(tartan => {
        const row = document.createElement('tr');

        // Thumbnail
        const thumbCell = document.createElement('td');
        if (tartan.image_url) {
            const img = document.createElement('img');
            img.src = tartan.image_url;
            img.className = 'thumbnail';
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
        weaverCell.textContent = tartan.weavers?.name || 'Unknown';
        row.appendChild(weaverCell);

        // Range
        const rangeCell = document.createElement('td');
        rangeCell.textContent = tartan.range || '—';
        row.appendChild(rangeCell);

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.title = "Edit"; // tooltip
        editBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#333"/></svg>';
        editBtn.addEventListener('click', () => openEditModal(tartan));
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.title = "Catalogue";
        catBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
        <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
      </svg>`;
        catBtn.addEventListener('click', () => alert('Catalogue modal not wired yet'));
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);

        container.appendChild(row);
    });
}

/* Lightbox */
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
    document.activeElement.blur(); // clear focus to avoid aria-hidden warning
}

/* Edit modal */
function openEditModal(tartan) {
    currentTartanId = tartan.id;
    document.getElementById('edit-name').value = tartan.tartan_name || '';
    document.getElementById('edit-weight').value = tartan.weight || '';
    document.getElementById('edit-range').value = tartan.range || '';
    document.getElementById('edit-image').value = tartan.image_url || '';
    document.getElementById('edit-weaver').value = tartan.weavers?.name || 'Unknown';
    const modal = document.getElementById('edit-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.activeElement.blur(); // clear focus
    currentTartanId = null;
}

// Save changes
document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentTartanId) return;

    const updated = {
        tartan_name: document.getElementById('edit-name').value,
        weight: document.getElementById('edit-weight').value,
        range: document.getElementById('edit-range').value,
        image_url: document.getElementById('edit-image').value
    };

    try {
        console.log("Saving tartan", currentTartanId, updated);

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
        loadTartans(); // refresh table
    } catch (err) {
        console.error('Error saving tartan:', err);
    }
});

// Delete record
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
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        closeEditModal();
        loadTartans();
    } catch (err) {
        console.error('Error deleting tartan:', err);
    }
});

// Cancel
document.getElementById('cancel-btn')?.addEventListener('click', closeEditModal);

/* Wire up overlay close + initial load */
document.addEventListener('DOMContentLoaded', () => {
    loadTartans();

    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    const editModal = document.getElementById('edit-modal');
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeEditModal();
        }
    });
});