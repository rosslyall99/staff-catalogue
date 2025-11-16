// --- Supabase config ---
const SUPABASE_URL = 'https://obibnblucftyzbtzequj.supabase.co'; // replace with your Supabase project URL
const SUPABASE_KEY = 'sb_publishable_xMBkFtpKK33NGoiJ9-7nAQ_P1D2Ai4g'; // replace with your anon key

// --- Fetch tartans with embedded weaver info ---
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
        const card = document.createElement('div');
        card.className = 'tartan-card';

        card.innerHTML = `
      <h3>${tartan.tartan_name}</h3>
      <p><strong>Clan:</strong> ${tartan.clan || '—'}</p>
      <p><strong>Range:</strong> ${tartan.range || '—'}</p>
      <p><strong>Weight:</strong> ${tartan.weight || '—'}</p>
      <p><strong>Weaver:</strong> ${tartan.weavers?.name || 'Unknown'}</p>
      <p><strong>Website:</strong> ${tartan.weavers?.website
                ? `<a href="${tartan.weavers.website}" target="_blank">${tartan.weavers.website}</a>`
                : '—'
            }</p>
      ${tartan.image_url
                ? `<img src="${tartan.image_url}" alt="${tartan.tartan_name}" class="tartan-image"/>`
                : ''
            }
    `;

        container.appendChild(card);
    });
}

// --- Run on page load ---
document.addEventListener('DOMContentLoaded', loadTartans);