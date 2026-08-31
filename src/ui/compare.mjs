import {vehicles} from '../domain/catalogue.mjs';
import {comparisonRows} from '../domain/compare.mjs';
import {vehicleHref} from '../domain/routes.mjs';
import {escapeHtml as e} from './escape.mjs';
import {formatPrice} from './format.mjs';

export function compareContent(ids, differencesOnly) {
  const records = ids.map(id => vehicles.find(v => v.id === id)).filter(Boolean).slice(0,3);
  const rows = comparisonRows(records,differencesOnly);
  const atLimit = records.length === 3;
  return `<div class="compare-toolbar"><p>${records.length} ${records.length === 1 ? 'car' : 'cars'} selected</p>
    <label class="differences-toggle"><input type="checkbox" data-differences${records.length < 2 ? ' disabled' : ''}${differencesOnly ? ' checked' : ''}>Differences only</label></div>
    <ul class="compare-selected" aria-label="Selected cars">${records.map(v => `<li><span>${e(v.name)}</span><button type="button" data-remove-compare="${e(v.id)}" aria-label="Remove ${e(v.name)} from comparison"><span class="icon icon-x" aria-hidden="true"></span></button></li>`).join('')}</ul>
    ${!records.length ? '<section class="compare-empty"><h2>Choose cars to compare</h2><p>Add up to three cars below, or explore the catalogue.</p><a href="latest-cars.html?view=all">Explore cars</a></section>' : `
    ${records.length === 1 ? '<p>Add another car to compare differences.</p>' : ''}
    <p id="comparison-scroll-hint" class="comparison-scroll-hint">Scroll horizontally to see all ${records.length} ${records.length === 1 ? 'car' : 'cars'}.</p>
    <div class="comparison-scroll" role="region" tabindex="0" aria-label="Vehicle comparison" aria-describedby="comparison-scroll-hint">
      <table class="comparison-table"><caption class="sr-only">Illustrative vehicle specifications. Prices in USD.</caption>
      <thead><tr><th scope="col">Attribute</th>${records.map(v => `<th scope="col"><img src="${e(v.image)}" alt="${e(v.alt)}" width="240" height="150"><h2>${e(v.name)}</h2><p>${e(formatPrice(v))}</p><a href="${e(vehicleHref(v))}">View details</a></th>`).join('')}</tr></thead>
      <tbody>${rows.map(row => `<tr><th scope="row">${e(row.label)}</th>${row.values.map(value => `<td>${e(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </div>${rows.length ? '' : '<p data-no-differences>No differences in the displayed sample facts.</p>'}`}
    <form class="compare-add" data-compare-add><div><label for="compare-car-select">Add car</label><select id="compare-car-select" data-compare-select${atLimit ? ' disabled' : ''}>${vehicles.filter(v => !ids.includes(v.id)).map(v => `<option value="${e(v.id)}">${e(v.name)}</option>`).join('')}</select></div>
      <button class="button" type="submit" data-add-compare${atLimit ? ' disabled' : ''}><span class="icon icon-plus" aria-hidden="true"></span>Add car</button><p>Compare up to three cars.${atLimit ? ' Remove a car before adding another.' : ''}</p>
    </form>`;
}
