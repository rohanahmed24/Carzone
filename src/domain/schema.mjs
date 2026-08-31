/** @typedef {import('./catalogue.mjs').Vehicle} Vehicle */

const ENUMS = {
  availability: new Set(['new', 'used', 'upcoming']),
  body: new Set(['sedan', 'coupe', 'hatchback', 'suv', 'wagon']),
  powertrain: new Set(['petrol', 'hybrid', 'electric']),
  transmission: new Set(['automatic', 'manual']),
  powerUnit: new Set(['kW', 'hp']),
};

const REQUIRED_STRINGS = ['id', 'name', 'image', 'alt', 'review'];
const NULLABLE_NUMBERS = ['priceUsd', 'seats', 'mileageKm', 'owners'];
const INTEGER_FIELDS = new Set(['seats', 'mileageKm', 'owners']);

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

/**
 * Validate illustrative vehicle records without throwing for malformed input.
 *
 * @param {unknown} records
 * @returns {string[]}
 */
export function validateCatalogue(records) {
  if (!Array.isArray(records)) return ['Catalogue must be an array'];

  const errors = [];
  const seen = new Set();

  for (const candidate of records) {
    if (!isRecord(candidate)) {
      errors.push('Vehicle must be an object');
      continue;
    }

    const v = candidate;
    const id = typeof v.id === 'string' ? v.id : '(unknown)';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.id) || seen.has(v.id)) {
      errors.push('Invalid or duplicate id');
    }
    seen.add(v.id);

    for (const key of REQUIRED_STRINGS) {
      if (!isNonEmptyString(v[key])) errors.push(`${id}: missing ${key}`);
    }
    if (isNonEmptyString(v.image) && !v.image.startsWith('/assets/media/')) {
      errors.push(`${id}: invalid image`);
    }

    for (const [key, allowed] of Object.entries({
      availability: ENUMS.availability,
      body: ENUMS.body,
      powertrain: ENUMS.powertrain,
      transmission: ENUMS.transmission,
    })) {
      if (!allowed.has(v[key])) errors.push(`${id}: invalid ${key}`);
    }

    for (const key of NULLABLE_NUMBERS) {
      const value = v[key];
      if (value !== null && (!Number.isFinite(value) || value < 0 || (INTEGER_FIELDS.has(key) && !Number.isInteger(value)))) {
        errors.push(`${id}: invalid ${key}`);
      }
    }

    if (v.power !== null) {
      if (!isRecord(v.power) || !Number.isFinite(v.power.value) || v.power.value < 0 || !ENUMS.powerUnit.has(v.power.unit)) {
        errors.push(`${id}: invalid power`);
      }
    }

    if (v.condition !== null && !isNonEmptyString(v.condition)) errors.push(`${id}: invalid condition`);
    if (!isRecord(v.editorial) || typeof v.editorial.latest !== 'boolean' || typeof v.editorial.popular !== 'boolean') {
      errors.push(`${id}: invalid editorial`);
    }

    if (v.availability === 'upcoming') {
      if (v.priceUsd !== null) errors.push(`${id}: upcoming price must be unknown`);
      for (const key of ['mileageKm', 'condition', 'owners']) {
        if (v[key] !== null) errors.push(`${id}: upcoming ${key} must be unknown`);
      }
    }
    if (v.availability === 'new') {
      for (const key of ['mileageKm', 'condition', 'owners']) {
        if (v[key] !== null) errors.push(`${id}: new ${key} must be unknown`);
      }
    }
    if (v.availability === 'used' && (v.mileageKm === null || v.owners === null || !v.condition)) {
      errors.push(`${id}: missing sample used fields`);
    }
  }

  return errors;
}
