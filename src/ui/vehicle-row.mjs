import {escapeHtml as e} from './escape.mjs';
import {formatPrice} from './format.mjs';
import {vehicleHref} from '../domain/routes.mjs';

// Native encoded 720px derivative dimensions, verified with Sharp metadata.
export const vehicleImageSize = v => ['sport-sedan','performance-coupe'].includes(v.id) ? [720,402] : ['family-suv','touring-wagon'].includes(v.id) ? [720,450] : [720,444];
export function vehicleRow(v,{returnTo}={}) {
  const [width,height]=vehicleImageSize(v);
  const href=e(vehicleHref(v,returnTo));
  return `<article class="vehicle-row" data-car="${e(v.id)}">
    <img class="vehicle-media" src="${e(v.image)}" alt="${e(v.alt)}" width="${width}" height="${height}" loading="lazy">
    <div class="vehicle-summary"><p class="eyebrow">${e(v.availability)} · Illustrative vehicle</p>
      <div class="vehicle-heading"><h3><a href="${href}">${e(v.name)}</a></h3><p class="price">${e(formatPrice(v))}</p></div>
      <p class="vehicle-facts">${e(v.body)} · ${e(v.powertrain)} · ${e(v.transmission)}</p>
      <div class="vehicle-actions"><button type="button" data-save="${e(v.id)}" aria-label="Save ${e(v.name)}" aria-pressed="false" disabled><span class="icon icon-heart" aria-hidden="true"></span><span>Save</span></button>
      <button type="button" data-compare="${e(v.id)}" disabled><span class="icon icon-plus" aria-hidden="true"></span><span>Add to compare</span></button>
      <a class="details-link" href="${href}">View details<span class="icon icon-arrow" aria-hidden="true"></span></a></div>
    </div></article>`;
}
