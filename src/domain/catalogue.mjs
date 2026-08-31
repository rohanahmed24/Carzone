/**
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} name
 * @property {'new'|'used'|'upcoming'} availability
 * @property {'sedan'|'coupe'|'hatchback'|'suv'|'wagon'} body
 * @property {'petrol'|'hybrid'|'electric'} powertrain
 * @property {'automatic'|'manual'} transmission
 * @property {number|null} priceUsd
 * @property {string} image
 * @property {string} alt
 * @property {{value:number, unit:'kW'|'hp'}|null} power
 * @property {number|null} seats
 * @property {number|null} mileageKm
 * @property {string|null} condition
 * @property {number|null} owners
 * @property {{latest:boolean, popular:boolean}} editorial
 * @property {string} review
 */

const usedCondition = 'Illustrative condition — inspection not verified';
const imageFor = id => `/assets/media/${id}-720.webp`;
const review = (strengthOne, strengthTwo, tradeOff) =>
  `Sample editorial review. Sample strength 1: ${strengthOne}. Sample strength 2: ${strengthTwo}. Sample trade-off: ${tradeOff}.`;

/** @type {Vehicle[]} */
const records = [
  { id: 'city-sedan', name: 'City sedan', availability: 'used', body: 'sedan', powertrain: 'petrol', transmission: 'automatic', priceUsd: 22500, image: imageFor('city-sedan'), alt: 'Blue four-door sedan shown from the front side against a dark studio background', power: { value: 110, unit: 'kW' }, seats: 5, mileageKm: 42000, condition: usedCondition, owners: 1, editorial: { latest: true, popular: true }, review: review('a clean, compact silhouette', 'a familiar four-door layout', 'the illustrated record has limited detail') },
  { id: 'sport-sedan', name: 'Sport sedan', availability: 'used', body: 'sedan', powertrain: 'petrol', transmission: 'automatic', priceUsd: 28900, image: imageFor('sport-sedan'), alt: 'Red four-door sport sedan shown from the front three-quarter view on a transparent background', power: { value: 145, unit: 'kW' }, seats: 5, mileageKm: 28000, condition: usedCondition, owners: 1, editorial: { latest: true, popular: true }, review: review('a bold red finish in the source image', 'a low, planted stance', 'the sample listing does not include verified history') },
  { id: 'touring-coupe', name: 'Touring coupe', availability: 'new', body: 'coupe', powertrain: 'petrol', transmission: 'automatic', priceUsd: 58900, image: imageFor('touring-coupe'), alt: 'Dark grey two-door coupe shown in side profile in a studio setting', power: { value: 220, unit: 'kW' }, seats: 4, mileageKm: null, condition: null, owners: null, editorial: { latest: true, popular: false }, review: review('a long two-door profile', 'a restrained dark finish', 'the fixture provides no option list') },
  { id: 'daily-hatch', name: 'Daily hatch', availability: 'used', body: 'hatchback', powertrain: 'petrol', transmission: 'manual', priceUsd: 19400, image: imageFor('daily-hatch'), alt: 'Dark grey performance hatchback shown in side profile with a rear wing', power: { value: 95, unit: 'kW' }, seats: 5, mileageKm: 51000, condition: usedCondition, owners: 2, editorial: { latest: false, popular: true }, review: review('a practical five-door outline', 'red details visible around the wheels', 'the inspection status remains illustrative') },
  { id: 'concept-coupe', name: 'Concept coupe', availability: 'upcoming', body: 'coupe', powertrain: 'electric', transmission: 'automatic', priceUsd: null, image: imageFor('concept-coupe'), alt: 'Grey concept coupe shown from the rear three-quarter view with a sweeping roofline', power: null, seats: 2, mileageKm: null, condition: null, owners: null, editorial: { latest: false, popular: false }, review: review('a flowing roofline', 'distinctive round rear lights', 'launch details are not provided') },
  { id: 'concept-fastback', name: 'Concept fastback', availability: 'upcoming', body: 'sedan', powertrain: 'electric', transmission: 'automatic', priceUsd: null, image: imageFor('concept-fastback'), alt: 'Grey concept fastback with its upward-opening door raised, showing the cabin', power: null, seats: null, mileageKm: null, condition: null, owners: null, editorial: { latest: true, popular: false }, review: review('a dramatic raised-door view', 'a visible two-seat cabin', 'launch timing is unconfirmed') },
  { id: 'grand-coupe', name: 'Grand coupe', availability: 'used', body: 'coupe', powertrain: 'petrol', transmission: 'automatic', priceUsd: 46500, image: imageFor('grand-coupe'), alt: 'Grey grand coupe shown from the front three-quarter view on a road-like studio background', power: { value: 240, unit: 'kW' }, seats: 2, mileageKm: 19000, condition: usedCondition, owners: 1, editorial: { latest: false, popular: true }, review: review('a wide front grille in the image', 'a low two-door shape', 'condition remains a sample label') },
  { id: 'track-coupe', name: 'Track coupe', availability: 'new', body: 'coupe', powertrain: 'petrol', transmission: 'manual', priceUsd: 98500, image: imageFor('track-coupe'), alt: 'Illustration of a red low-slung track-style coupe from the front three-quarter view', power: { value: 360, unit: 'kW' }, seats: 2, mileageKm: null, condition: null, owners: null, editorial: { latest: false, popular: false }, review: review('an expressive illustrated body shape', 'a vivid red exterior', 'the artwork is illustrative rather than a vehicle photograph') },
  { id: 'redline-coupe', name: 'Redline coupe', availability: 'new', body: 'coupe', powertrain: 'petrol', transmission: 'automatic', priceUsd: 64200, image: imageFor('redline-coupe'), alt: 'Red coupe shown from the front three-quarter view against a dark background', power: { value: 270, unit: 'kW' }, seats: 2, mileageKm: null, condition: null, owners: null, editorial: { latest: true, popular: true }, review: review('a striking red paint finish', 'a compact two-door form', 'the sample record has no fitted-options detail') },
  { id: 'performance-coupe', name: 'Performance coupe', availability: 'used', body: 'coupe', powertrain: 'petrol', transmission: 'automatic', priceUsd: 52800, image: imageFor('performance-coupe'), alt: 'Red performance coupe shown from the rear three-quarter view on a transparent background', power: { value: 250, unit: 'kW' }, seats: 2, mileageKm: 24000, condition: usedCondition, owners: 2, editorial: { latest: false, popular: false }, review: review('a sculpted rear view in the image', 'a contrasting dark roof', 'the prior-owner count is illustrative') },
  { id: 'family-suv', name: 'Family SUV', availability: 'new', body: 'suv', powertrain: 'hybrid', transmission: 'automatic', priceUsd: 42800, image: imageFor('family-suv'), alt: 'Dark green family SUV shown from the front three-quarter view in a light studio', power: { value: 160, unit: 'kW' }, seats: 5, mileageKm: null, condition: null, owners: null, editorial: { latest: true, popular: true }, review: review('a spacious-looking five-door form', 'a deep green finish', 'the fixture does not state cargo measurements') },
  { id: 'touring-wagon', name: 'Touring wagon', availability: 'used', body: 'wagon', powertrain: 'hybrid', transmission: 'automatic', priceUsd: 31900, image: imageFor('touring-wagon'), alt: 'Silver touring wagon shown from the front three-quarter view in a light studio', power: { value: 140, unit: 'kW' }, seats: 5, mileageKm: 36000, condition: usedCondition, owners: 1, editorial: { latest: false, popular: true }, review: review('an extended wagon roofline', 'a light silver exterior', 'the condition statement is illustrative only') },
];

const freezeVehicle = vehicle => Object.freeze({
  ...vehicle,
  power: vehicle.power === null ? null : Object.freeze({ ...vehicle.power }),
  editorial: Object.freeze({ ...vehicle.editorial }),
});

/** @type {readonly Vehicle[]} */
export const vehicles = Object.freeze(records.map(freezeVehicle));

/** @param {string} id @returns {Vehicle|null} */
export const getVehicle = id => vehicles.find(vehicle => vehicle.id === id) ?? null;
