import test from 'node:test';
import assert from 'node:assert/strict';

import { comparisonQuery, comparisonRows, resolveComparison } from '../src/domain/compare.mjs';
import { getVehicle } from '../src/domain/catalogue.mjs';

test('explicit shared URL never falls back or persists by itself', () => {
  const valid = new Set(['a', 'b', 'c', 'd']);
  assert.deepEqual(resolveComparison(new URLSearchParams('cars='), ['a'], valid).ids, []);
  const result = resolveComparison(new URLSearchParams('cars=b,b,bad,a,c,d'), ['d'], valid);
  assert.deepEqual(result.ids, ['b', 'a', 'c']);
  assert.equal(result.fromUrl, true);
  assert.ok(result.notice);
  assert.deepEqual(resolveComparison(new URLSearchParams(), ['d'], valid).ids, ['d']);
  assert.equal(comparisonQuery([]), 'cars=');
});

test('differences normalize power and retain known versus missing', () => {
  const a = { ...getVehicle('city-sedan'), power: { value: 100, unit: 'kW' }, seats: null };
  const b = { ...a, id: 'other', power: { value: 134.102, unit: 'hp' } };
  assert.equal(comparisonRows([a, b], true).length, 0);
  b.seats = 5;
  assert.deepEqual(comparisonRows([a, b], true).map(row => row.key), ['seats']);
});

test('comparison rows use exactly the documented fields and human-safe missing labels', () => {
  const upcoming = getVehicle('concept-fastback');
  const rows = comparisonRows([upcoming], true);
  assert.deepEqual(rows.map(row => row.key), [
    'availability', 'body', 'priceUsd', 'powertrain', 'transmission', 'power', 'seats', 'mileageKm', 'condition', 'owners',
  ]);
  assert.equal(rows.find(row => row.key === 'priceUsd').values[0], 'Price not announced');
  assert.equal(rows.find(row => row.key === 'seats').values[0], 'Not provided');
  assert.deepEqual(comparisonRows([], false), []);
});

test('all-null values are equal while a known value remains a difference', () => {
  const base = { ...getVehicle('city-sedan'), condition: null, owners: null, power: null };
  const same = { ...base, id: 'same' };
  assert.deepEqual(comparisonRows([base, same], true), []);
  same.owners = 1;
  assert.deepEqual(comparisonRows([base, same], true).map(row => row.key), ['owners']);
});
