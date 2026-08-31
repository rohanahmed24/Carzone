import {escapeHtml as e} from './escape.mjs';
import {formatPrice, formatKm} from './format.mjs';
import {vehicleImageSize} from './vehicle-row.mjs';
import {safeReturn} from '../domain/routes.mjs';

const label = value => value === null ? 'Not provided' : String(value);
const titleCase = value => value === 'suv' ? 'SUV' : value[0].toUpperCase() + value.slice(1);
const facts = rows => `<dl class="vehicle-definition">${rows.map(([name, value]) => `<div><dt>${e(name)}</dt><dd>${e(label(value))}</dd></div>`).join('')}</dl>`;
const power = v => v.power === null ? null : `${v.power.value} ${v.power.unit}`;
const history = v => facts([
  ['Sample mileage', formatKm(v.mileageKm)],
  ['Sample condition', v.condition],
  ['Sample owners', v.owners],
]);

function routeLink(v, route, returnTo) {
  return e(`${route}?${new URLSearchParams({car: v.id, return: returnTo})}`);
}

function tabs(v, route, returnTo) {
  const overview = v.availability === 'used' ? 'used-car-details.html' : 'car-details.html';
  const active = ['car-details.html', 'used-car-details.html'].includes(route) ? overview : route;
  return `<nav class="vehicle-tabs" aria-label="Vehicle information">${[
    [overview, 'Overview'], ['car-specification.html', 'Specifications'],
    ['car-price.html', 'Price'], ['car-review.html', 'Sample review'],
  ].map(([filename, name]) => `<a href="${routeLink(v, filename, returnTo)}"${active === filename ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav>`;
}

function readingContent(v, route, returnTo) {
  if (route === 'car-specification.html') {
    const groups = [
      ['Identity', facts([['Name', v.name], ['Availability', titleCase(v.availability)], ['Body style', titleCase(v.body)]])],
      ['Powertrain', facts([['Fuel / energy', titleCase(v.powertrain)], ['Transmission', titleCase(v.transmission)], ['Power', power(v)]])],
      ['Practicality', facts([['Seats', v.seats]])],
    ];
    if (v.availability === 'used') groups.push(['Sample history', history(v)]);
    return `<div class="vehicle-reading">${groups.map(([heading, content]) => `<section><h2>${heading}</h2>${content}</section>`).join('')}</div>`;
  }
  if (route === 'car-price.html') {
    return `<section class="vehicle-reading-single"><h2>Price</h2><p>Illustrative listed price · USD</p><p class="vehicle-price">${e(formatPrice(v))}</p><p>Taxes, registration and financing are not calculated.</p><p>This is a portfolio sample, not an offer for sale.</p></section>`;
  }
  if (route === 'car-review.html') {
    return `<section class="vehicle-reading-single"><h2>Sample editorial review</h2><p>${e(v.review)}</p><p>This sample editorial text is not a customer review or a verified assessment.</p><a href="${routeLink(v, 'write-review.html', returnTo)}">Preview your own review</a></section>`;
  }
  return `<div class="vehicle-reading"><section><h2>About this sample</h2><p>This is an illustrative vehicle listing created for demonstration purposes. Details shown are examples only and may not reflect a real vehicle.</p>${v.availability === 'used' ? `<h2>Used information</h2>${history(v)}` : ''}</section><section><h2>Sample facts</h2>${facts([
    ['Body style', titleCase(v.body)], ['Fuel / energy', titleCase(v.powertrain)],
    ['Transmission', titleCase(v.transmission)], ['Power', power(v)], ['Seats', v.seats],
  ])}</section></div>`;
}

/** A single selected record owns every page, including availability-dependent actions. */
export function vehicleContent(v, route, returnTo) {
  const back = safeReturn(returnTo);
  const returnLink = `<a class="vehicle-return" href="${e(back)}"><span class="icon icon-arrow" aria-hidden="true"></span>Return to results</a>`;
  if (!v) return `<section class="container vehicle-page vehicle-not-found">${returnLink}<h1>Vehicle not found</h1><p>The requested vehicle is not in this illustrative catalogue.</p><a class="button" href="latest-cars.html?view=all">Explore cars</a></section>`;
  const [width, height] = vehicleImageSize(v);
  const summaryFacts = [['Fuel / energy', titleCase(v.powertrain)], ['Transmission', titleCase(v.transmission)]];
  if (v.availability === 'used') summaryFacts.push(['Sample mileage', formatKm(v.mileageKm)]);
  summaryFacts.push(['Seats', v.seats]);
  return `<article class="container vehicle-page" data-selected-vehicle="${e(v.id)}">
    ${returnLink}
    <div class="vehicle-hero">
      <header class="vehicle-title"><p class="eyebrow">${e(titleCase(v.availability))} · Illustrative vehicle</p><h1>${e(v.name)}</h1></header>
      <img class="vehicle-detail-image" src="${e(v.image)}" alt="${e(v.alt)}" width="${width}" height="${height}" loading="eager">
      <div class="vehicle-detail-summary"><p class="vehicle-price-label">Illustrative listed price · USD</p><p class="vehicle-price">${e(formatPrice(v))}</p>
        ${v.availability === 'upcoming' ? '<p>Launch timing unconfirmed</p>' : ''}
        ${facts(summaryFacts)}
        <div class="vehicle-detail-actions">
          <button type="button" data-save="${e(v.id)}" aria-label="Save ${e(v.name)}" aria-pressed="false" disabled><span class="icon icon-heart" aria-hidden="true"></span><span>Save</span></button>
          <button type="button" data-compare="${e(v.id)}" disabled><span class="icon icon-plus" aria-hidden="true"></span><span>Add to compare</span></button>
          ${v.availability === 'upcoming' ? `<a class="vehicle-spec-link" href="${routeLink(v, 'car-specification.html', back)}">View specifications</a>` : `<button type="button" class="button vehicle-enquiry" data-enquiry="${e(v.id)}" disabled>Preview enquiry</button><p class="vehicle-enquiry-note">Local demo — nothing will be sent.</p>`}
        </div>
      </div>
    </div>
    ${tabs(v, route, back)}
    ${readingContent(v, route, back)}
  </article>`;
}
