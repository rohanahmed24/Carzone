import test from 'node:test';
import assert from 'node:assert/strict';
import {getVehicle} from '../src/domain/catalogue.mjs';
import {resolveVehicle, safeReturn} from '../src/domain/routes.mjs';
import {vehicleContent} from '../src/ui/vehicle.mjs';
import {renderVehicle} from '../src/pages/vehicle.mjs';
import {mountVehicle} from '../src/browser/vehicle.mjs';

const routes = ['car-details.html', 'used-car-details.html', 'car-specification.html', 'car-price.html', 'car-review.html'];
const returnTo = 'latest-cars.html?view=all&condition=used&body=sedan&sort=price-asc';

test('record availability, not a mismatched filename, owns actions', () => {
  const used = vehicleContent(getVehicle('city-sedan'), 'car-details.html', returnTo);
  assert.match(used, /42,000 km/);
  assert.match(used, /22,500/);
  assert.match(used, /data-enquiry="city-sedan"[^>]*disabled/);
  const upcoming = vehicleContent(getVehicle('concept-fastback'), 'used-car-details.html', returnTo);
  assert.match(upcoming, /Price not announced/);
  assert.match(upcoming, /Launch timing unconfirmed/);
  assert.doesNotMatch(upcoming, /data-enquiry|Reserve|Buy now/);
  assert.match(vehicleContent(null, 'car-details.html', returnTo), /Vehicle not found/);
});

test('all five bare routes render their representative records and no-JS disclosure', () => {
  assert.equal(new Set(routes.map(route => renderVehicle(route).title)).size, 5);
  assert.equal(new Set(routes.map(route => renderVehicle(route).description)).size, 5);
  for (const route of routes) {
    const page = renderVehicle(route);
    assert.equal(page.controller, 'vehicle');
    assert.match(page.body, new RegExp(resolveVehicle(route, new URLSearchParams()).name));
    assert.match(page.body, /<noscript>.*selecting another vehicle.*JavaScript/s);
    assert.equal((page.body.match(/<img /g) || []).length, 1);
    assert.equal((page.body.match(/<h1[ >]/g) || []).length, 1);
    assert.doesNotMatch(page.body, /gallery|carousel|360/i);
  }
});

test('new records omit used history and upcoming prices remain unknown', () => {
  const html = vehicleContent(getVehicle('touring-coupe'), 'used-car-details.html', returnTo);
  assert.match(html, /58,900/);
  assert.doesNotMatch(html, /Sample mileage|Sample condition|Sample owners|Sample history/);
  const price = vehicleContent(getVehicle('concept-fastback'), 'car-price.html', returnTo);
  assert.match(price, /Price not announced/);
  assert.match(price, /Taxes, registration and financing are not calculated\./);
  assert.doesNotMatch(price, /data-enquiry|\$0/);
});

test('specifications have semantic groups, authoritative facts and explicit nulls', () => {
  const used = vehicleContent(getVehicle('city-sedan'), 'car-specification.html', returnTo);
  for (const title of ['Identity', 'Powertrain', 'Practicality', 'Sample history']) assert.match(used, new RegExp(`<h2>${title}</h2>`));
  assert.match(used, /110 kW/);
  assert.match(used, /<dt>Sample owners<\/dt><dd>1<\/dd>/);
  assert.doesNotMatch(used, /1\.6L|Front-wheel|Interior color/);
  const upcoming = vehicleContent(getVehicle('concept-fastback'), 'car-specification.html', returnTo);
  assert.match(upcoming, /<dt>Power<\/dt><dd>Not provided<\/dd>/);
  assert.match(upcoming, /<dt>Seats<\/dt><dd>Not provided<\/dd>/);
});

test('tabs and review link preserve the selected ID and sanitized return filters', () => {
  const html = vehicleContent(getVehicle('city-sedan'), 'car-review.html', returnTo);
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&'), 'https://carzone.invalid/'));
  for (const route of ['used-car-details.html', 'car-specification.html', 'car-price.html', 'car-review.html', 'write-review.html']) {
    const link = links.find(url => url.pathname === `/${route}`);
    assert.equal(link.searchParams.get('car'), 'city-sedan');
    assert.equal(link.searchParams.get('return'), safeReturn(returnTo));
  }
  assert.match(html, /aria-current="page">Sample review/);
  assert.doesNotMatch(vehicleContent(getVehicle('city-sedan'), 'car-review.html', 'https://evil.test/'), /evil\.test/);
});

test('review content is escaped and is explicitly editorial, not verified-user ratings', () => {
  const html = vehicleContent({...getVehicle('city-sedan'), review: '<script>alert("x")</script>'}, 'car-review.html', returnTo);
  assert.match(html, /Sample editorial review/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|verified reviews|stars/i);
});

test('enhancement resolves explicit IDs before controls, including empty and invalid IDs', () => {
  for (const id of ['city-sedan', '', 'missing']) {
    const root = {innerHTML: ''};
    const doc = {querySelector: () => root, defaultView: {location: {pathname: '/car-details.html', search: `?car=${id}&return=${encodeURIComponent(returnTo)}`}}};
    mountVehicle(doc, {});
    if (id === 'city-sedan') {
      assert.equal(doc.title, 'City sedan | Carzone');
      assert.match(root.innerHTML, /42,000 km/);
      assert.match(root.innerHTML, /data-save="city-sedan"[^>]*disabled/);
    } else {
      assert.equal(doc.title, 'Vehicle not found | Carzone');
      assert.doesNotMatch(root.innerHTML, /data-save|data-compare|data-enquiry/);
      assert.match(root.innerHTML, /Explore cars/);
    }
  }
});
