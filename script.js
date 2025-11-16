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
        const container = document.getElementById('tartan-list');
        if (container) {
            container.innerHTML = `<p class="error">Failed to load tartans. Check console for details.</p>`;
        }
    }
}

// --- Render tartans into the page ---
function renderTartans(tartans) {
    const container = document.getElementById('tartan-list');
    if (!container) return;

    container.innerHTML = '';

    tartans.forEach(tartan => {
        const row = document.createElement('tr');

        // Thumbnail cell
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
}

// Close lightbox when clicking the X
document.addEventListener('DOMContentLoaded', () => {
    loadTartans();

    const closeBtn = document.querySelector('#lightbox .close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('lightbox').style.display = 'none';
        };
    }

    // Optional: close when clicking outside the image
    const modal = document.getElementById('lightbox');
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Optional: close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('lightbox').style.display = 'none';
        }
    });
});