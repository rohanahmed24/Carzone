import {vehicles} from '../domain/catalogue.mjs';
import {vehicleHref} from '../domain/routes.mjs';
import {escapeHtml as e} from './escape.mjs';
import {formatPrice} from './format.mjs';

export function savedContent(ids) {
  const records = ids.map(id => vehicles.find(v => v.id === id)).filter(Boolean);
  if (!records.length) return '<h3>No saved cars yet</h3><p>Keep a shortlist on this device.</p><a href="latest-cars.html?view=all">Explore cars</a>';
  return `<p>Your device-local shortlist. Saving does not add a car to compare.</p><ul class="saved-list">${records.map(v => `<li>
    <img src="${e(v.image)}" alt="${e(v.alt)}" width="144" height="90">
    <div><h3>${e(v.name)}</h3><p>${e(formatPrice(v))}</p><a href="${e(vehicleHref(v))}">View details</a>
    <div class="saved-actions"><button type="button" data-remove-saved="${e(v.id)}" aria-label="Remove ${e(v.name)} from saved cars"><span class="icon icon-x" aria-hidden="true"></span>Remove</button>
    <button type="button" data-compare="${e(v.id)}" aria-pressed="false"><span class="icon icon-plus" aria-hidden="true"></span><span>Add to compare</span></button></div></div>
  </li>`).join('')}</ul>`;
}
