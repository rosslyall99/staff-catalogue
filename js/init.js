import { deleteTartan, loadTartans, updateTartan } from './tartans.js';
import { activeFilters, getState } from './state.js';
import {
    openLightbox, closeLightbox,
    openEditModal, closeEditModal,
    openCatalogueModal, closeCatalogueModal
} from './modal.js';
import { ensureFiltersPopulatedOnce } from './filters.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    loadTartans(1);

    // Populate filters globally on startup
    ensureFiltersPopulatedOnce();

    // Lightbox close wiring
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    const lightbox = document.getElementById('lightbox');
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // Edit modal close wiring
    const editModal = document.getElementById('edit-modal');
    editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
    document.getElementById('cancel-btn')?.addEventListener('click', closeEditModal);

    // ✅ Edit form submit handler (Save button)
    document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { currentTartanId } = getState();
        if (!currentTartanId) return;

        const updates = {
            tartan_name: document.getElementById('edit-name').value,
            weight: document.getElementById('edit-weight').value,
            range: document.getElementById('edit-range').value,
            image_url: document.getElementById('edit-image').value
            // weaver is disabled, so not updated here
        };

        try {
            await updateTartan(currentTartanId, updates);
            closeEditModal();
            loadTartans(1); // reload to show changes
        } catch (err) {
            console.error('Error saving tartan:', err);
            alert('Failed to save changes');
        }
    });

    // Delete button handler
    document.getElementById('delete-btn')?.addEventListener('click', async () => {
        const { currentTartanId } = getState();
        if (!currentTartanId) return;

        if (!confirm('Are you sure you want to delete this tartan?')) return;

        try {
            await deleteTartan(currentTartanId);
            closeEditModal();
            loadTartans(1); // reload to reflect deletion
        } catch (err) {
            console.error('Error deleting tartan:', err);
            alert('Failed to delete tartan');
        }
    });


    // Catalogue modal close wiring
    document.getElementById('catalogue-close')?.addEventListener('click', closeCatalogueModal);

    // Escape key closes all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeEditModal();
            closeCatalogueModal();
        }
    });

    // Search input wiring
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');

    searchInput?.addEventListener('input', (e) => {
        activeFilters.query = (e.target.value || '').toLowerCase().trim();
        loadTartans(1);
        clearBtn.style.display = activeFilters.query ? 'inline-block' : 'none';
    });

    clearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        activeFilters.query = '';
        clearBtn.style.display = 'none';

        // Reset filters
        activeFilters.clan = '';
        activeFilters.weight = '';
        activeFilters.weaver = '';
        activeFilters.range = '';

        // Reset to global options
        ensureFiltersPopulatedOnce(true);

        // Reload tartans
        loadTartans(1);
    });

    // Filter dropdowns wiring
    ['filter-clan', 'filter-weight', 'filter-weaver', 'filter-range'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', (e) => {
            const val = (e.target.value || '').trim();
            if (id === 'filter-clan') activeFilters.clan = val;
            if (id === 'filter-weight') activeFilters.weight = val;
            if (id === 'filter-weaver') activeFilters.weaver = val;
            if (id === 'filter-range') activeFilters.range = val;
            loadTartans(1);
        });
    });

    // Toggle filters panel
    document.getElementById('toggle-filters')?.addEventListener('click', () => {
        const container = document.getElementById('filters-container');
        const nowHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
        container.style.display = nowHidden ? 'flex' : 'none';
    });
});