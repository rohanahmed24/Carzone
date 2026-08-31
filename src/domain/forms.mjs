const textLength = (value, min, max) => value.length >= min && value.length <= max;
const integerRange = (value, min, max) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;
const email = value => value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const definitions = {
  enquiry: {
    name: {label: 'Name', sample: 'Alex Example', valid: value => textLength(value, 2, 80), error: 'Enter a name between 2 and 80 characters.'},
    email: {label: 'Email', sample: 'alex@example.test', valid: email, error: 'Enter a valid email address of 120 characters or fewer.'},
    message: {label: 'Message', sample: 'I would like to explore this sample vehicle.', valid: value => textLength(value, 10, 1000), error: 'Enter a message between 10 and 1000 characters.'},
  },
  seller: {
    make: {label: 'Make', sample: 'Example Motors', valid: value => textLength(value, 2, 60), error: 'Enter a make between 2 and 60 characters.'},
    model: {label: 'Model', sample: 'City', valid: value => textLength(value, 1, 60), error: 'Enter a model between 1 and 60 characters.'},
    year: {label: 'Year', sample: '2021', valid: value => integerRange(value, 1980, 2027), error: 'Enter a whole year from 1980 to 2027.'},
    mileageKm: {label: 'Mileage (km)', sample: '42000', valid: value => integerRange(value, 0, 1000000), error: 'Enter whole kilometres from 0 to 1000000.'},
    askingUsd: {label: 'Asking price (USD)', sample: '22500', valid: value => integerRange(value, 1, 10000000), error: 'Enter a whole asking price from 1 to 10000000 USD.'},
    notes: {label: 'Notes', sample: 'Fictional listing for a portfolio preview.', valid: value => textLength(value, 0, 1000), error: 'Enter notes of 1000 characters or fewer.'},
  },
  review: {
    title: {label: 'Title', sample: 'A practical sample drive', valid: value => textLength(value, 5, 100), error: 'Enter a title between 5 and 100 characters.'},
    rating: {label: 'Rating', sample: '4', valid: value => integerRange(value, 1, 5), error: 'Enter a whole rating from 1 to 5.'},
    review: {label: 'Review', sample: 'This fictional review demonstrates the local preview flow.', valid: value => textLength(value, 20, 1500), error: 'Enter a review between 20 and 1500 characters.'},
    author: {label: 'Author', sample: 'Alex Example', valid: value => textLength(value, 2, 80), error: 'Enter an author name between 2 and 80 characters.'},
  },
  valuation: {
    make: {label: 'Make', sample: 'Example Motors', valid: value => textLength(value, 2, 60), error: 'Enter a make between 2 and 60 characters.'},
    model: {label: 'Model', sample: 'City', valid: value => textLength(value, 1, 60), error: 'Enter a model between 1 and 60 characters.'},
    year: {label: 'Year', sample: '2021', valid: value => integerRange(value, 1980, 2027), error: 'Enter a whole year from 1980 to 2027.'},
    mileageKm: {label: 'Mileage (km)', sample: '42000', valid: value => integerRange(value, 0, 1000000), error: 'Enter whole kilometres from 0 to 1000000.'},
    condition: {label: 'Condition', sample: 'Good', valid: value => ['Excellent', 'Good', 'Fair'].includes(value), error: 'Choose Excellent, Good, or Fair condition.'},
  },
};

const fieldsFor = kind => {
  const fields = definitions[kind];
  if (!fields) throw new Error(`Unknown form kind: ${kind}`);
  return fields;
};

const normalizedValue = (draft, key) => String((draft ?? {})[key] ?? '').trim();

export const sampleDraft = kind => Object.fromEntries(
  Object.entries(fieldsFor(kind)).map(([key, field]) => [key, field.sample]),
);

export const validateDraft = (kind, draft) => Object.fromEntries(
  Object.entries(fieldsFor(kind))
    .filter(([key, field]) => !field.valid(normalizedValue(draft, key)))
    .map(([key, field]) => [key, field.error]),
);

export const reviewDraft = (kind, draft) => Object.entries(fieldsFor(kind))
  .map(([key, field]) => ({label: field.label, value: normalizedValue(draft, key)}));
