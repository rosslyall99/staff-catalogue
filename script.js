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

        // Thumbnail cell
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

        // Other fields
        row.innerHTML += `
      <td>${tartan.tartan_name || '—'}</td>
      <td>${tartan.weight || '—'}</td>
      <td>${tartan.weavers?.name || 'Unknown'}</td>
      <td>${tartan.range || '—'}</td>
      <td class="actions">
        <button><img src="pencil-icon.png" alt="Edit"></button>
        <button><img src="book-icon.png" alt="Catalogue"></button>
      </td>
    `;

        container.appendChild(row);
    });
}

// --- Lightbox logic ---
function openLightbox(url) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    modal.style.display = 'block';
    console.log("Opening lightbox for:", url);
}

// --- Close handlers ---
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