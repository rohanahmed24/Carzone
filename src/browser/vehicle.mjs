import {resolveVehicle, safeReturn} from '../domain/routes.mjs';
import {vehicleContent} from '../ui/vehicle.mjs';

export function mountVehicle(doc, store) {
  const root = doc.querySelector('[data-vehicle-content]');
  if (!root) return;
  const params = new URLSearchParams(doc.defaultView.location.search);
  const route = doc.defaultView.location.pathname.split('/').pop();
  const vehicle = resolveVehicle(route, params);
  root.innerHTML = vehicleContent(vehicle, route, safeReturn(params.get('return')));
  doc.title = vehicle ? `${vehicle.name} | Carzone` : 'Vehicle not found | Carzone';
  // Shared selection and form controllers bind after this record resolution.
  // Until then every action remains disabled, including enquiry previews.
}
