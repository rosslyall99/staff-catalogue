export function fillSelect(id, values) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = select.getAttribute('data-label') || 'Select';
    select.appendChild(defaultOption);

    values.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
    });
}

export function normalizePrices(raw) {
    if (!raw) return [];
    if (typeof raw === 'object') {
        if (Array.isArray(raw)) {
            return raw.map(item => ({
                name: item.name ?? item.product ?? '',
                price: item.price ?? item.amount ?? null
            })).filter(r => r.name);
        }
        return Object.entries(raw).map(([key, val]) => ({
            name: key,
            price: typeof val === 'object' ? (val.price ?? val.amount ?? null) : val
        }));
    }
    try {
        const parsed = JSON.parse(raw);
        return normalizePrices(parsed);
    } catch {
        return [];
    }
}

export function formatGBP(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}