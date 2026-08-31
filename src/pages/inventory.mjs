import {parseFilters, serializeFilters} from '../domain/query.mjs';
import {filterOptions, inventoryResults} from '../ui/inventory.mjs';
import {escapeHtml as e} from '../ui/escape.mjs';

function controls(filters) {
  const labels = {condition:'Condition',budget:'Budget',body:'Body style',sort:'Sort'};
  return Object.entries(labels).map(([key,label]) => `<label class="inventory-select">${label}<select name="${key}">${filterOptions[key].map(([value,text]) => `<option value="${value}"${filters[key] === value ? ' selected' : ''}>${text}</option>`).join('')}</select></label>`).join('');
}

export function renderInventory(route, filters = parseFilters(new URLSearchParams(),route)) {
  const title = { 'latest-cars.html':'Latest cars', 'popular-cars.html':'Popular cars', 'upcoming-cars.html':'Upcoming cars' }[route];
  return {
    title, description:`Explore ${title.toLowerCase()} in the Carzone illustrative catalogue. Filter by condition, budget and body style.`, controller:'inventory',
    body:`<section class="container inventory" data-inventory>
      <header class="inventory-intro"><h1>Find what fits.</h1><p>Explore illustrative cars. Build a shortlist that makes sense.</p></header>
      <nav class="inventory-tabs" aria-label="Car collections">${filterOptions.view.map(([value,label]) => `<a data-inventory-view="${value}" href="${e(`${route}?${serializeFilters({...filters,view:value})}`)}"${filters.view === value ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
      <form data-desktop-filters><fieldset data-desktop-fields disabled><legend class="sr-only">Filter cars</legend>${controls(filters)}</fieldset></form>
      <button class="mobile-filter-toggle" type="button" data-open-filters hidden disabled aria-haspopup="dialog">Filters and sort</button>
      <div data-results>${inventoryResults(filters,route)}</div>
    </section>
    <dialog id="inventory-filters" aria-labelledby="filters-title"><div class="dialog-heading"><h2 id="filters-title">Filters</h2><button type="button" data-close-dialog>Close<span class="icon icon-x" aria-hidden="true"></span></button></div>
      <p>Changes apply when you choose Apply filters.</p><form data-mobile-filters><fieldset data-mobile-fields disabled><legend class="sr-only">Draft filters</legend>${controls(filters)}</fieldset>
      <div class="filter-draft-actions"><button type="button" data-clear-draft>Clear</button><button type="submit" class="button">Apply filters</button></div></form>
    </dialog>`
  };
}
