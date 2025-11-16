const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g';

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
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error('Error loading tartans:', error);
    }
}

function renderTable(tartans) {
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
            img.onclick = () => openLightbox(tartan.image_url);
            thumbCell.appendChild(img);
        }
        row.appendChild(thumbCell);

        // Tartan name
        row.innerHTML += `<td>${tartan.tartan_name}</td>`;
        // Weight
        row.innerHTML += `<td>${tartan.weight || '—'}</td>`;
        // Weaver
        row.innerHTML += `<td>${tartan.weavers?.name || 'Unknown'}</td>`;
        // Range
        row.innerHTML += `<td>${tartan.range || '—'}</td>`;

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<img src="pencil-icon.png" alt="Edit">';
        editBtn.onclick = () => openEditModal(tartan);
        actionsCell.appendChild(editBtn);

        // Catalogue button
        const catBtn = document.createElement('button');
        catBtn.innerHTML = '<img src="book-icon.png" alt="Catalogue">';
        catBtn.onclick = () => openCatalogueModal(tartan);
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

// --- Lightbox ---
function openLightbox(url) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    modal.style.display = 'block';
}
document.querySelectorAll('.modal .close').forEach(el => {
    el.onclick = () => el.parentElement.parentElement.style.display = 'none';
});

// --- Edit Modal ---
function openEditModal(tartan) {
    document.getElementById('edit-tartan-name').value = tartan.tartan_name;
    document.getElementById('edit-weight').value = tartan.weight;
    document.getElementById('edit-image-url').value = tartan.image_url;
    document.getElementById('edit-range').value = tartan.range;
    document.getElementById('edit-modal').style.display = 'block';
}

// --- Catalogue Modal ---
function openCatalogueModal(tartan) {
    const details = document.getElementById('catalogue-details');
    details.innerHTML = `
    <p><strong>Weaver:</strong> ${tartan.weavers?.name || 'Unknown'}</p>
    <p><strong>Website:</strong> ${tartan.weavers?.website || '—'}</p>
    <p><strong>Prices:</strong> ${JSON.stringify(tartan.prices || {}, null, 2)}</p>
  `;
    document.getElementById('catalogue-modal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', loadTartans);