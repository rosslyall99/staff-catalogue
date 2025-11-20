// state.js

let itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let currentTartanId = null;

export const activeFilters = {
    query: '',
    clan: '',
    weight: '',
    weaver: '',
    range: ''
};

export function getState() {
    return {
        itemsPerPage,
        currentPage,
        totalPages,
        currentTartanId
    };
}

export function setState(updates) {
    if (updates.itemsPerPage !== undefined) itemsPerPage = updates.itemsPerPage;
    if (updates.currentPage !== undefined) currentPage = updates.currentPage;
    if (updates.totalPages !== undefined) totalPages = updates.totalPages;
    if (updates.currentTartanId !== undefined) currentTartanId = updates.currentTartanId;
}