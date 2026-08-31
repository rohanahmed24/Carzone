import test from 'node:test';
import assert from 'node:assert/strict';

import { vehicles, getVehicle } from '../src/domain/catalogue.mjs';
import { validateCatalogue } from '../src/domain/schema.mjs';

test('twelve stable, diverse and explicitly sample vehicles', () => {
  assert.equal(vehicles.length, 12);
  assert.deepEqual(validateCatalogue(vehicles), []);
  assert.equal(getVehicle('city-sedan').priceUsd, 22500);
  assert.match(getVehicle('city-sedan').alt, /blue/i);
  assert.equal(getVehicle('sport-sedan').priceUsd, 28900);
  assert.match(getVehicle('sport-sedan').alt, /red/i);
  assert.equal(getVehicle('does-not-exist'), null);
  assert.ok(validateCatalogue([...vehicles, vehicles[0]]).length > 0);
  assert.ok(validateCatalogue([{ ...vehicles[0], priceUsd: -1 }]).length > 0);
});

test('validation reports enum, required fields, numeric, and availability errors', () => {
  assert.ok(validateCatalogue([{ ...vehicles[0], availability: 'leased' }]).length > 0);
  assert.ok(validateCatalogue([{ ...vehicles[0], alt: '' }]).length > 0);
  assert.ok(validateCatalogue([{ ...vehicles[0], power: { value: Infinity, unit: 'kW' } }]).length > 0);
  assert.ok(validateCatalogue([{ ...vehicles[4], priceUsd: 1 }]).length > 0);
  assert.ok(validateCatalogue([{ ...vehicles[0], mileageKm: null, owners: null, condition: null }]).length > 0);
});
