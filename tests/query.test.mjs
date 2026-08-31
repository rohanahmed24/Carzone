import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicles, getVehicle} from '../src/domain/catalogue.mjs';
import {parseFilters, serializeFilters, selectVehicles} from '../src/domain/query.mjs';
import {resolveVehicle, vehicleHref, safeReturn} from '../src/domain/routes.mjs';

test('route default only applies when view is absent', () => {
  assert.equal(parseFilters(new URLSearchParams(), 'popular-cars.html').view, 'popular');
  assert.equal(parseFilters(new URLSearchParams('view=all'), 'popular-cars.html').view, 'all');
  assert.equal(parseFilters(new URLSearchParams('view=bad'), 'popular-cars.html').view, 'all');
});

test('filter round-trip, ordering, budget and vehicle identity', () => {
  const f = parseFilters(new URLSearchParams('view=all&condition=used&sort=price-asc'), 'latest-cars.html');
  assert.deepEqual(parseFilters(new URLSearchParams(serializeFilters(f)), 'latest-cars.html'), f);
  const ids = selectVehicles(vehicles, f).map(v => v.id);
  assert.ok(ids.indexOf('city-sedan') < ids.indexOf('sport-sedan'));
  assert.equal(selectVehicles(vehicles, {...f, view: 'upcoming', condition: 'any', budget: '60000'}).length, 0);
  assert.equal(resolveVehicle('car-details.html', new URLSearchParams('car=city-sedan')).id, 'city-sedan');
  assert.equal(resolveVehicle('car-details.html', new URLSearchParams('car=missing')), null);
  assert.equal(resolveVehicle('car-details.html', new URLSearchParams('car=')), null);
  assert.match(vehicleHref(getVehicle('concept-coupe')), /^car-specification\.html\?/);
  assert.equal(safeReturn('https://evil.example/'), 'latest-cars.html?view=all');
  assert.equal(safeReturn('//evil.example/'), 'latest-cars.html?view=all');
});

test('filters allow only known values and encoded markup cannot affect selection', () => {
  const encodedMarkup = new URLSearchParams('view=%3Cimg%3E&condition=%3Cscript%3E&budget=60000%3C&body=%3Csvg%3E&sort=price-desc%3C');
  assert.deepEqual(parseFilters(encodedMarkup, 'latest-cars.html'), {
    view: 'all', condition: 'any', budget: 'any', body: 'any', sort: 'featured',
  });
  assert.equal(serializeFilters(parseFilters(encodedMarkup, 'latest-cars.html')).includes('%3C'), false);
});

test('every body and condition enum selects matching records', () => {
  for (const body of ['sedan', 'coupe', 'hatchback', 'suv', 'wagon']) {
    const selected = selectVehicles(vehicles, parseFilters(new URLSearchParams(`view=all&body=${body}`), 'latest-cars.html'));
    assert.ok(selected.length > 0);
    assert.ok(selected.every(vehicle => vehicle.body === body));
  }
  for (const condition of ['new', 'used', 'upcoming']) {
    const selected = selectVehicles(vehicles, parseFilters(new URLSearchParams(`view=all&condition=${condition}`), 'latest-cars.html'));
    assert.ok(selected.length > 0);
    assert.ok(selected.every(vehicle => vehicle.availability === condition));
  }
});

test('price ordering puts unknown prices last and incompatible filters return zero records', () => {
  for (const sort of ['price-asc', 'price-desc']) {
    const selected = selectVehicles(vehicles, parseFilters(new URLSearchParams(`view=all&sort=${sort}`), 'latest-cars.html'));
    const firstUnknown = selected.findIndex(vehicle => vehicle.priceUsd === null);
    assert.ok(firstUnknown > 0);
    assert.ok(selected.slice(firstUnknown).every(vehicle => vehicle.priceUsd === null));
  }
  assert.equal(selectVehicles(vehicles, parseFilters(new URLSearchParams('condition=upcoming&body=wagon'), 'latest-cars.html')).length, 0);
});

test('returns are canonical, allow only inventory routes, and reject traversal', () => {
  const returnTo = 'popular-cars.html?sort=name&body=coupe&view=all&ignored=%3Cscript%3E';
  assert.equal(
    safeReturn(returnTo),
    'popular-cars.html?view=all&condition=any&budget=any&body=coupe&sort=name',
  );
  assert.equal(safeReturn('/latest-cars.html?condition=used'), 'latest-cars.html?view=latest&condition=used&budget=any&body=any&sort=featured');
  assert.equal(safeReturn('/latest-cars.html/../car-details.html?car=city-sedan'), 'latest-cars.html?view=all');
  assert.equal(safeReturn('/car-details.html?car=city-sedan'), 'latest-cars.html?view=all');
});

test('detail routes preserve explicit car IDs and use their documented defaults', () => {
  assert.equal(resolveVehicle('used-car-details.html', new URLSearchParams()).id, 'city-sedan');
  assert.equal(resolveVehicle('unknown.html', new URLSearchParams()), null);
  assert.equal(resolveVehicle('car-price.html', new URLSearchParams('car=missing')), null);
  const href = vehicleHref(getVehicle('city-sedan'), 'upcoming-cars.html?budget=25000');
  assert.equal(href, 'used-car-details.html?car=city-sedan&return=upcoming-cars.html%3Fview%3Dupcoming%26condition%3Dany%26budget%3D25000%26body%3Dany%26sort%3Dfeatured');
});
