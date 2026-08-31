import {resolveVehicle} from '../domain/routes.mjs';
import {formContent, formTitles} from '../ui/forms.mjs';

export function renderFormPage(kind) {
  const vehicle = kind === 'review' ? resolveVehicle('write-review.html', new URLSearchParams()) : null;
  return {
    title: formTitles[kind],
    description: `${formTitles[kind]}. A local-only Carzone portfolio demonstration. Nothing is sent or stored.`,
    controller: 'forms',
    body: `<div class="container form-page" data-form-page="${kind}">${formContent(kind, vehicle)}</div>${kind === 'review' ? '<noscript><p class="container no-script">This is a representative sample; selecting another vehicle through a query requires JavaScript.</p></noscript>' : ''}`,
  };
}
