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
        } else {
            thumbCell.textContent = '—';
        }
        row.appendChild(thumbCell);

        // Text columns
        row.innerHTML += `
      <td>${tartan.tartan_name || '—'}</td>
      <td>${tartan.weight || '—'}</td>
      <td>${tartan.weavers?.name || '—'}</td>
      <td>${tartan.range || '—'}</td>
    `;

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<img src="pencil-icon.png" alt="Edit">';
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.innerHTML = '<img src="book-icon.png" alt="Catalogue">';
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

// Lightbox
function openLightbox(url) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    modal.style.display = 'block';
}

document.querySelector('#lightbox .close').onclick = () => {
    document.getElementById('lightbox').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', loadTartans);