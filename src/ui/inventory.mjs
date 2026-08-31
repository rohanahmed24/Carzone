import {vehicles} from '../domain/catalogue.mjs';
import {selectVehicles, serializeFilters} from '../domain/query.mjs';
import {vehicleRow} from './vehicle-row.mjs';
import {escapeHtml as e} from './escape.mjs';

export const filterOptions = {
  view: [['all','All cars'],['latest','Latest'],['popular','Popular'],['upcoming','Upcoming']],
  condition: [['any','Any condition'],['new','New'],['used','Used'],['upcoming','Upcoming']],
  budget: [['any','Any budget'],['25000','Up to $25,000'],['40000','Up to $40,000'],['60000','Up to $60,000']],
  body: [['any','Any body style'],['sedan','Sedan'],['coupe','Coupe'],['hatchback','Hatchback'],['suv','SUV'],['wagon','Wagon']],
  sort: [['featured','Featured'],['price-asc','Price: low to high'],['price-desc','Price: high to low'],['name','Name']],
};

export function inventoryResults(filters, route) {
  const rows = selectVehicles(vehicles, filters);
  const chips = Object.entries(filters).filter(([key,value]) => value !== ({view:'all',sort:'featured'}[key] ?? 'any'));
  const upcomingCandidates = filters.budget !== 'any' && selectVehicles(vehicles,{...filters,budget:'any'}).some(v => v.availability === 'upcoming');
  const returnTo = `${route}?${serializeFilters(filters)}`;
  return `<div class="inventory-result-summary">
    <p role="status" aria-live="polite" data-result-count>${rows.length} illustrative ${rows.length === 1 ? 'car' : 'cars'}</p>
    ${filters.view === 'popular' ? '<p>Editorial sample selection.</p>' : ''}
    ${upcomingCandidates ? '<p>Unknown prices are excluded by this budget.</p>' : ''}
    <div class="filter-chips" aria-label="Applied filters">${chips.map(([key,value]) => `<button type="button" data-remove-filter="${key}" aria-label="Remove ${e(filterOptions[key].find(option => option[0] === value)?.[1])} filter">${e(filterOptions[key].find(option => option[0] === value)?.[1])}<span class="icon icon-x" aria-hidden="true"></span></button>`).join('')}
    ${chips.length ? '<button type="button" class="clear-filters" data-clear-filters>Clear filters</button>' : ''}</div>
  </div>
  ${rows.length ? rows.map(v => vehicleRow(v,{returnTo})).join('') : '<section class="inventory-empty"><h2>No cars match these filters.</h2><p>Try a different condition, budget or body style.</p><button type="button" class="button" data-clear-filters>Clear filters</button></section>'}`;
}
