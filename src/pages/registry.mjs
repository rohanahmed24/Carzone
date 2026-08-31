import {renderHome} from './home.mjs';
import {renderInventory} from './inventory.mjs';
import {renderVehicle} from './vehicle.mjs';
import {renderCompare} from './compare.mjs';
import {renderFormPage} from './forms.mjs';
import {renderStyleGuide} from './style-guide.mjs';

/** Complete build-time registry of the fourteen existing entry points. */
export function renderPages() {
  return new Map([
    ['index.html',renderHome()],
    ['compare-car.html',renderCompare()],
    ['sell-your-car.html',renderFormPage('seller')],
    ['write-review.html',renderFormPage('review')],
    ['car-valuation.html',renderFormPage('valuation')],
    ['style-guide.html',renderStyleGuide()],
    ...['latest-cars.html','popular-cars.html','upcoming-cars.html'].map(route => [route,renderInventory(route)]),
    ...['car-details.html','used-car-details.html','car-specification.html','car-price.html','car-review.html'].map(route => [route,renderVehicle(route)]),
  ]);
}
