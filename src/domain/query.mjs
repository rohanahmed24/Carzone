/**
 * @typedef {Object} Filters
 * @property {'all'|'latest'|'popular'|'upcoming'} view
 * @property {'any'|'new'|'used'|'upcoming'} condition
 * @property {'any'|'25000'|'40000'|'60000'} budget
 * @property {'any'|'sedan'|'coupe'|'hatchback'|'suv'|'wagon'} body
 * @property {'featured'|'price-asc'|'price-desc'|'name'} sort
 */

/** @param {URLSearchParams} params @param {string} route @returns {Filters} */
export function parseFilters(params, route) {
  const defaults = {'latest-cars.html': 'latest', 'popular-cars.html': 'popular', 'upcoming-cars.html': 'upcoming'};
  const pick = (key, choices, fallback) => choices.includes(params.get(key)) ? params.get(key) : fallback;
  return {
    view: params.has('view') ? pick('view', ['all', 'latest', 'popular', 'upcoming'], 'all') : (defaults[route] ?? 'all'),
    condition: pick('condition', ['any', 'new', 'used', 'upcoming'], 'any'),
    budget: pick('budget', ['any', '25000', '40000', '60000'], 'any'),
    body: pick('body', ['any', 'sedan', 'coupe', 'hatchback', 'suv', 'wagon'], 'any'),
    sort: pick('sort', ['featured', 'price-asc', 'price-desc', 'name'], 'featured'),
  };
}

/** @param {Filters} filters @returns {string} */
export function serializeFilters(filters) {
  return new URLSearchParams(Object.entries(filters)).toString();
}

/** @param {import('./catalogue.mjs').Vehicle[]} records @param {Filters} filters */
export function selectVehicles(records, filters) {
  const rows = records.filter(vehicle =>
    (filters.view === 'all' || (filters.view === 'upcoming' ? vehicle.availability === 'upcoming' : vehicle.editorial[filters.view])) &&
    (filters.condition === 'any' || vehicle.availability === filters.condition) &&
    (filters.body === 'any' || vehicle.body === filters.body) &&
    (filters.budget === 'any' || (vehicle.priceUsd !== null && vehicle.priceUsd <= Number(filters.budget))));
  return rows.sort((left, right) => {
    if (filters.sort === 'name') return left.name.localeCompare(right.name);
    if (filters.sort === 'featured') return 0;
    if (left.priceUsd === null || right.priceUsd === null) return left.priceUsd === right.priceUsd ? 0 : left.priceUsd === null ? 1 : -1;
    return (filters.sort === 'price-desc' ? -1 : 1) * (left.priceUsd - right.priceUsd) || left.id.localeCompare(right.id);
  });
}
