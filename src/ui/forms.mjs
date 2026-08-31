import {sampleDraft, reviewDraft} from '../domain/forms.mjs';
import {escapeHtml as e} from './escape.mjs';
import {formatPrice} from './format.mjs';

export const formTitles = {
  enquiry: 'Preview an enquiry', seller: 'Preview your car listing',
  review: 'Preview your review', valuation: 'Understand your car’s value',
};

function field(kind, key, label) {
  const id = `${kind}-${key}`;
  const attributes = `id="${id}" name="${key}" autocomplete="off" aria-describedby="${id}-error"`;
  let control;
  if (['message', 'notes', 'review'].includes(key)) {
    control = `<textarea ${attributes} rows="5"></textarea>`;
  } else if (key === 'condition' || key === 'rating') {
    const options = key === 'condition' ? ['Excellent', 'Good', 'Fair'] : ['1', '2', '3', '4', '5'];
    control = `<select ${attributes}><option value="">Choose ${e(label.toLowerCase())}</option>${options.map(value => `<option value="${value}">${value}</option>`).join('')}</select>`;
  } else {
    control = `<input ${attributes} type="${key === 'email' ? 'email' : 'text'}"${['year', 'mileageKm', 'askingUsd'].includes(key) ? ' inputmode="numeric"' : ''}>`;
  }
  return `<div class="preview-field"><label for="${id}">${e(label)}</label>${control}<span class="error" id="${id}-error" data-error="${key}"></span></div>`;
}

function context(kind, vehicle) {
  if (vehicle && ['enquiry', 'review'].includes(kind)) {
    return `<aside class="form-context"><p class="eyebrow">Selected vehicle · Illustrative</p><img src="${e(vehicle.image)}" alt="${e(vehicle.alt)}"><h2>${e(vehicle.name)}</h2><p>${e(vehicle.powertrain)} · ${e(vehicle.transmission)}</p><p class="form-context-price">${e(formatPrice(vehicle))}</p>${kind === 'review' ? '<p>Sample attribution only. This is not a verified customer review.</p>' : ''}</aside>`;
  }
  if (kind === 'valuation') return `<aside class="form-context"><h2>What shapes value?</h2><p>This educational preview summarises five details, without calculating a price.</p><ul><li>Vehicle age can affect demand.</li><li>Recorded mileage helps describe use.</li><li>Physical and mechanical condition matters.</li><li>Documented service records can add context.</li></ul><p>No price estimate or dealer offer is generated.</p></aside>`;
  return `<aside class="form-context"><h2>A listing, in draft.</h2><p>Explore how your car’s details could read together. This preview is never published or shared with a dealer.</p><p>Use fictional details. No photographs or documents are needed.</p></aside>`;
}

/** Static forms deliberately contain no personal or free-text defaults. */
export function formContent(kind, vehicle = null) {
  if (!formTitles[kind]) throw new Error(`Unknown form kind: ${kind}`);
  if (kind === 'review' && !vehicle) return '<section class="form-not-found"><h1>Vehicle not found</h1><p>The requested vehicle is not in this illustrative catalogue.</p><a href="latest-cars.html?view=all">Explore cars</a></section>';
  if (kind === 'enquiry' && (!vehicle || vehicle.availability === 'upcoming')) return '';
  const rows = reviewDraft(kind, {});
  const keys = Object.keys(sampleDraft(kind));
  const heading = kind === 'enquiry' ? 'h2' : 'h1';
  return `${kind === 'enquiry' ? '<button type="button" class="form-close" data-close-dialog aria-label="Close enquiry preview"><span class="icon icon-x" aria-hidden="true"></span></button>' : ''}
    <header class="form-header"><${heading} id="${kind}-title">${formTitles[kind]}</${heading}><p>Local demo. Your information is not sent or stored.</p></header>
    <div class="form-layout">${context(kind, vehicle)}
    <form data-local-form="${kind}" autocomplete="off" novalidate>
      <fieldset disabled><legend class="sr-only">${formTitles[kind]}</legend>
        <div data-errors class="form-errors" role="alert" tabindex="-1" hidden></div>
        <section data-step="edit"><h2 class="form-step-title" tabindex="-1">Your details</h2>
          ${keys.map((key, index) => field(kind, key, rows[index].label)).join('')}
          <div class="form-actions"><button type="button" class="form-text-button" data-sample>Use fictional sample</button><button type="button" class="button" data-preview>Review preview</button></div>
        </section>
        <section data-step="review" hidden><h2 class="form-step-title" tabindex="-1">Review your preview</h2><p>Please check your details before you finish your preview.</p><div class="form-review" data-review></div><div class="form-actions"><button type="button" class="button" data-confirm>Finish preview</button><button type="button" data-edit>Edit</button></div></section>
        <section data-step="complete" data-completion hidden><h2 class="form-step-title" tabindex="-1">Demo preview only — nothing was sent.</h2><p>No messages, emails or notifications have been sent.</p>${kind === 'valuation' ? '<p>No price estimate or dealer offer is generated.</p>' : ''}</section>
        <button type="button" class="form-reset" data-reset>Reset</button>
      </fieldset>
      <p class="form-privacy">Your information stays on this page. Closing, resetting or reloading clears your details. Please use fictional information.</p>
      <noscript><p>JavaScript is needed for this local preview. No form can be submitted.</p></noscript>
    </form></div>`;
}
