# 🧵 Tartan Gallery App — README

## 📐 Architecture Overview
This app is a **Supabase-backed catalogue viewer** for tartans. It fetches data from normalized tables (`tartans`, `range`, `weavers`, `range_products`) and renders a responsive card grid with search, filters, pagination, and modal views.

### Core flow
1. **Supabase REST API** → fetch tartan + range + weaver + product data  
2. **State management** → track active filters, current page, total pages  
3. **Rendering** → cards grid + pagination controls  
4. **Filters** → dropdowns populated from the full filtered dataset (chunked fetch)  
5. **Modals** → lightbox for images, catalogue modal for product details  

---

## 📂 Module Responsibilities

### `api.js`
- Centralized Supabase URL + key
- `supabaseFetch(url, options)` → authenticated fetch wrapper
- `supabaseFetchAll(url, chunkSize)` → chunked fetch to bypass 1000-row cap

### `state.js`
- Holds global state: `currentPage`, `totalPages`, `activeFilters`
- Simple `getState()` / `setState()` helpers

### `tartans.js`
- Builds query URLs (`buildTartansUrl`, `buildFilterOptionsUrl`)
- `loadTartans(page)`:
  - Fetches paginated tartans for display
  - Updates state + renders cards/pagination
  - Fetches all filtered rows (chunked) → updates filter dropdowns

### `filters.js`
- `updateFiltersFromData(rows)` → deduplicates clans, weights, ranges, weavers
- `ensureFiltersPopulatedOnce(force)` → one-off global population (used when clearing filters)

### `render.js`
- `renderTartans(tartans)` → builds card grid
- `renderPaginationControls()` → builds pagination bar with active state

### `modal.js`
- `openLightbox(url, name)` / `closeLightbox()` → image preview
- `openCatalogueModal(t)` / `closeCatalogueModal()` → product list modal

### `utils.js`
- `fillSelect(id, values, selectedValue)` → populate dropdowns
- `formatGBP(value)` → currency formatting
- `formatProductLabel(key)` → fallback label formatter

---

## 🎨 UI / CSS
- Responsive grid (`cards-container`) with breakpoints for mobile, tablet, desktop, XL
- Shared `.btn` base class with variants (`btn-primary`, `btn-catalogue`, etc.)
- Modals styled consistently with `.modal-box`
- Pagination bar with active state + accessible `aria-current`

---

## 🔑 Key Patterns

- **Chunked fetch for filters**  
  Ensures dropdowns reflect all matching tartans, not just the first 1000 rows.

- **Centralized fetch logic**  
  All Supabase calls go through `supabaseFetch` / `supabaseFetchAll`.

- **No edit modal**  
  Editing is handled directly in Supabase; app is read-only for catalogue browsing.

- **State-driven UI**  
  Filters and pagination are always derived from `activeFilters` + `getState()`.

---

## 🚀 Usage

- **Search bar** → filters tartans by name (case-insensitive substring match).  
- **Dropdown filters** → filter by clan, weight, weaver, range.  
- **Pagination controls** → navigate pages, with active state highlighted.  
- **Lightbox** → click tartan image to preview.  
- **Catalogue modal** → click “Catalogue” button to view product list with prices/links.  

---

## 🛠️ Future Enhancements

- Add **distinct RPC endpoints** in Supabase for faster filter option queries.  
- Bundle **local SVG icons** instead of external URLs for reliability.  
- Consider **lazy-loading images** for performance on large datasets.  
- Add **loading spinners** during fetches for better UX.  

---