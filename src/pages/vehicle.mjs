import {resolveVehicle, safeReturn} from '../domain/routes.mjs';
import {vehicleContent} from '../ui/vehicle.mjs';

export function renderVehicle(route) {
  const vehicle = resolveVehicle(route, new URLSearchParams());
  const section = {
    'car-details.html': 'Overview',
    'used-car-details.html': 'Used overview',
    'car-specification.html': 'Specifications',
    'car-price.html': 'Price',
    'car-review.html': 'Sample review',
  }[route] ?? 'Overview';
  return {
    title: vehicle ? `${vehicle.name} — ${section}` : 'Vehicle not found',
    description: vehicle ? `${section} for the illustrative ${vehicle.name}. Vehicle facts and prices are sample data for this Carzone portfolio demo.` : 'The requested vehicle is not in the Carzone illustrative catalogue.',
    controller: 'vehicle',
    body: `<div data-vehicle-content>${vehicleContent(vehicle, route, safeReturn(null))}</div><noscript><p class="container no-script">This is a representative sample; selecting another vehicle through a query requires JavaScript.</p></noscript>`,
  };
}
