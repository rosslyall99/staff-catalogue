/* ===========================
   TartanDB JavaScript Logic
   =========================== */
(function () {
    const SUPABASE_URL = "https://obibnblucftyzbtzequj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaWJuYmx1Y2Z0eXpidHplcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE2MDcsImV4cCI6MjA3ODY5NzYwN30.f60ZZIQh0lntvTACdKU0HuLUHgtsbQbwq_csFdeQcRc"; // replace with fresh anon key

    const state = {
        query: "",
        clan: "",
        weight: "",
        weaver: "",
        range: "",
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 12
    };

    /* ==========
       Fetch tartans
       ========== */
    async function loadTartans(page = 1) {
        const start = (page - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage - 1;

        let url = `${SUPABASE_URL}/rest/v1/tartans?select=*,range!inner(range_name,weight!inner(name),weavers!inner(name),range_products(*))&order=tartan_name.asc`;

        if (state.clan) url += `&clan=eq.${encodeURIComponent(state.clan)}`;
        if (state.weight) url += `&range.weight.name=eq.${encodeURIComponent(state.weight)}`;
        if (state.range) url += `&range.range_name=eq.${encodeURIComponent(state.range)}`;
        if (state.weaver) url += `&range.weavers.name=eq.${encodeURIComponent(state.weaver)}`;
        if (state.query) {
            const q = state.query.replace(/[^\w\s-]/gi, "").toLowerCase();
            url += `&or=${encodeURIComponent(`(tartan_name.ilike.*${q}*)`)}`;
        }

        const res = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: "count=exact",
                Range: `${start}-${end}`
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const cr = res.headers.get("Content-Range");
        const total = cr?.includes("/") ? parseInt(cr.split("/")[1], 10) : data.length;
        state.currentPage = page;
        state.totalPages = Math.max(1, Math.ceil(total / state.itemsPerPage));

        renderTartans(data);
        renderPagination();
    }

    /* ==========
       Render tartans
       ========== */
    function renderTartans(tartans) {
        const container = document.getElementById("tartanDB-cards");
        container.innerHTML = "";
        tartans.forEach(t => {
            const card = document.createElement("div");
            card.className = "tartanDB-card";

            if (t.image_url) {
                const img = document.createElement("img");
                img.src = t.image_url;
                img.alt = t.tartan_name;
                img.addEventListener("click", () => openLightbox(t.image_url, t.tartan_name));
                card.appendChild(img);
            }

            const title = document.createElement("h2");
            title.textContent = t.tartan_name || "—";
            card.appendChild(title);

            const weight = document.createElement("p");
            weight.textContent = `Weight: ${t.range?.weight?.name || "—"}`;
            card.appendChild(weight);

            const weaver = document.createElement("p");
            weaver.textContent = `Weaver: ${t.range?.weavers?.name || "Unknown"}`;
            card.appendChild(weaver);

            const range = document.createElement("p");
            range.textContent = `Range: ${t.range?.range_name || "—"}`;
            card.appendChild(range);

            const actions = document.createElement("div");
            actions.className = "tartanDB-card-actions";
            const catBtn = document.createElement("button");
            catBtn.textContent = "Catalogue";
            catBtn.addEventListener("click", () => alert("Catalogue view coming soon"));
            actions.appendChild(catBtn);
            card.appendChild(actions);

            container.appendChild(card);
        });
    }

    /* ==========
       Pagination
       ========== */
    function renderPagination() {
        const controls = document.getElementById("tartanDB-pagination-controls");
        controls.innerHTML = "";

        const prev = document.createElement("button");
        prev.textContent = "Previous";
        prev.disabled = state.currentPage === 1;
        prev.onclick = () => loadTartans(state.currentPage - 1);
        controls.appendChild(prev);

        for (let i = 1; i <= state.totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.disabled = i === state.currentPage;
            btn.onclick = () => loadTartans(i);
            controls.appendChild(btn);
        }

        const next = document.createElement("button");
        next.textContent = "Next";
        next.disabled = state.currentPage === state.totalPages;
        next.onclick = () => loadTartans(state.currentPage + 1);
        controls.appendChild(next);
    }

    /* ==========
       Modal (Lightbox)
       ========== */
    function openLightbox(url, name) {
        const modal = document.getElementById("tartanDB-lightbox");
        const img = document.getElementById("tartanDB-lightbox-img");
        const caption = document.getElementById("tartanDB-lightbox-caption");
        img.src = url;
        caption.textContent = name;
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
    }
    function closeLightbox() {
        const modal = document.getElementById("tartanDB-lightbox");
        const img = document.getElementById("tartanDB-lightbox-img");
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        img.src = "";
    }
    document.getElementById("tartanDB-lightbox-close")?.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeLightbox();
    });

    /* ==========
       Search + Filters
       ========== */
    const searchInput = document.getElementById("tartanDB-search-input");
    const clearBtn = document.getElementById("tartanDB-clear-search");
    searchInput?.addEventListener("input", e => {
        state.query = (e.target.value || "").toLowerCase().trim();
        loadTartans(1);
        clearBtn.style.display = state.query ? "inline-block" : "none";
    });
    clearBtn?.addEventListener("click", () => {
        searchInput.value = "";
        state.query = "";
        clearBtn.style.display = "none";
        loadTartans(1);
    });

    ["tartanDB-filter-clan", "tartanDB-filter-weight", "tartanDB-filter-weaver", "tartanDB-filter-range"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", e => {
            const val = (e.target.value || "").trim();
            if (id.includes("clan")) state.clan = val;
            if (id.includes("weight")) state.weight = val;
            if (id.includes("weaver")) state.weaver = val;
            if (id.includes("range")) state.range = val;
            loadTartans(1);
        });
    });

    /* ==========
       Init
       ========== */
    document.addEventListener("DOMContentLoaded", () => loadTartans(1));
})();