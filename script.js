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
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
            img.addEventListener('click', () => {
                console.log("Thumbnail clicked:", tartan.image_url);
                openLightbox(tartan.image_url);
            });
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
        weaverCell.textContent = (tartan.weavers && tartan.weavers.name) ? tartan.weavers.name : 'Unknown';
        row.appendChild(weaverCell);

        // Range
        const rangeCell = document.createElement('td');
        rangeCell.textContent = tartan.range || '—';
        row.appendChild(rangeCell);

        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<img src="pencil-icon.png" alt="Edit">';
        editBtn.addEventListener('click', () => alert('Edit modal not wired yet'));
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.innerHTML = '<img src="book-icon.png" alt="Catalogue">';
        catBtn.addEventListener('click', () => alert('Catalogue modal not wired yet'));
        actionsCell.appendChild(catBtn);

        row.appendChild(actionsCell);

        container.appendChild(row);
    });
}

// Lightbox
function openLightbox(url) {
    console.log("Opening lightbox for:", url);
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    modal.style.display = 'block';
}

// Close handlers
document.addEventListener('DOMContentLoaded', () => {
    loadTartans();

    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('lightbox').style.display = 'none';
        });
    }

    const modal = document.getElementById('lightbox');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('lightbox').style.display = 'none';
        }
    });
});