const FIELDS = [
  ['availability', 'Availability'],
  ['body', 'Body style'],
  ['priceUsd', 'Price'],
  ['powertrain', 'Powertrain'],
  ['transmission', 'Transmission'],
  ['power', 'Power'],
  ['seats', 'Seats'],
  ['mileageKm', 'Mileage'],
  ['condition', 'Condition'],
  ['owners', 'Previous owners'],
];

const titleCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const normalizedPower = power => {
  if (power === null || power === undefined || !Number.isFinite(power.value)) return null;
  const inKilowatts = power.value * (power.unit === 'hp' ? 0.745699872 : 1);
  return Math.round(inKilowatts * 10) / 10;
};

const normalizedValue = (record, key) => key === 'power' ? normalizedPower(record.power) : record[key] ?? null;

const displayValue = (record, key, value) => {
  if (value === null) return key === 'priceUsd' && record.availability === 'upcoming'
    ? 'Price not announced'
    : 'Not provided';
  if (key === 'priceUsd') return `$${value.toLocaleString('en-US')}`;
  if (key === 'power') return `${value} kW`;
  if (key === 'mileageKm') return `${value.toLocaleString('en-US')} km`;
  return typeof value === 'string' ? titleCase(value) : String(value);
};

/**
 * Resolve a shared comparison URL without mutating stored device selection.
 *
 * @param {URLSearchParams} params
 * @param {string[]} deviceIds
 * @param {Set<string>} validIds
 */
export function resolveComparison(params, deviceIds, validIds) {
  const fromUrl = params.has('cars');
  const raw = fromUrl ? (params.get('cars') ? params.get('cars').split(',') : []) : deviceIds;
  const source = Array.isArray(raw) ? raw : [];
  const valid = [...new Set(source.filter(id => typeof id === 'string' && validIds.has(id)))];
  const ids = valid.slice(0, 3);
  const discarded = source.some(id => typeof id !== 'string' || !validIds.has(id)) || valid.length > 3;
  return { ids, notice: discarded ? 'Some unknown or excess cars were omitted.' : null, fromUrl };
}

/** @param {string[]} ids */
export const comparisonQuery = ids => new URLSearchParams({ cars: ids.join(',') }).toString();

/**
 * Build display-ready comparison rows while deciding differences from canonical values.
 *
 * @param {import('./catalogue.mjs').Vehicle[]} records
 * @param {boolean} differencesOnly
 */
export function comparisonRows(records, differencesOnly) {
  if (!Array.isArray(records) || records.length === 0) return [];

  return FIELDS.map(([key, label]) => {
    const rawValues = records.map(record => normalizedValue(record, key));
    return {
      key,
      label,
      values: records.map((record, index) => displayValue(record, key, rawValues[index])),
      different: new Set(rawValues.map(value => JSON.stringify(value))).size > 1,
    };
  })
    .filter(row => !differencesOnly || records.length === 1 || row.different)
    .map(({ different, ...row }) => row);
}
