import {getVehicle} from './catalogue.mjs';
import {parseFilters, serializeFilters} from './query.mjs';

const baseUrl = 'https://carzone.invalid/';
const inventoryRoutes = new Set(['latest-cars.html', 'popular-cars.html', 'upcoming-cars.html']);
const fallbackReturn = 'latest-cars.html?view=all';

/** @param {string} route @param {URLSearchParams} params */
export function resolveVehicle(route, params) {
  if (params.has('car')) return getVehicle(params.get('car'));
  const defaults = {
    'car-details.html': 'touring-coupe',
    'used-car-details.html': 'city-sedan',
    'car-specification.html': 'concept-fastback',
    'car-price.html': 'city-sedan',
    'car-review.html': 'city-sedan',
    'write-review.html': 'city-sedan',
  };
  return getVehicle(defaults[route] ?? '');
}

/** @param {string|null|undefined} value @returns {string} */
export function safeReturn(value) {
  if (typeof value !== 'string') return fallbackReturn;
  try {
    const url = new URL(value, baseUrl);
    const route = url.pathname.slice(1);
    if (url.origin !== baseUrl.slice(0, -1) || !inventoryRoutes.has(route)) return fallbackReturn;
    return `${route}?${serializeFilters(parseFilters(url.searchParams, route))}`;
  } catch {
    return fallbackReturn;
  }
}

/** @param {import('./catalogue.mjs').Vehicle} vehicle @param {string|null} [returnTo] */
export function vehicleHref(vehicle, returnTo) {
  const route = {new: 'car-details.html', used: 'used-car-details.html', upcoming: 'car-specification.html'}[vehicle.availability];
  return `${route}?${new URLSearchParams({car: vehicle.id, return: safeReturn(returnTo)})}`;
}
