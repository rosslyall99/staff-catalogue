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
        editBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#333"/></svg>';
        editBtn.addEventListener('click', () => openEditModal(tartan));
        actionsCell.appendChild(editBtn);

        const catBtn = document.createElement('button');
        catBtn.innerHTML = '<img src="book-icon.png" alt="Catalogue">';
        catBtn.addEventListener('click', () => alert('Catalogue modal