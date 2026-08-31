import {sampleDraft, validateDraft, reviewDraft} from '../domain/forms.mjs';
import {getVehicle} from '../domain/catalogue.mjs';
import {resolveVehicle} from '../domain/routes.mjs';
import {formContent} from '../ui/forms.mjs';
import {mountDialog} from './dialog.mjs';

function showStep(form, step, focus = true) {
  for (const name of ['edit', 'review', 'complete']) {
    const section = form.querySelector(`[data-step="${name}"]`);
    section.hidden = name !== step;
  }
  if (focus) form.querySelector(`[data-step="${step}"] h2`).focus();
}

function showErrors(form, errors) {
  const summary = form.querySelector('[data-errors]');
  summary.replaceChildren();
  for (const input of form.querySelectorAll('input,textarea,select')) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    const error = form.querySelector(`[data-error="${input.name}"]`);
    error.textContent = errors[input.name] || '';
    if (errors[input.name]) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
    }
  }
  const messages = Object.values(errors);
  summary.hidden = messages.length === 0;
  if (messages.length) {
    summary.textContent = `Please check your details. ${messages.join(' ')}`;
    summary.focus();
  }
}

/** No draft leaves this form: only allowlisted fields are read into temporary memory. */
export function bindLocalForm(form, kind) {
  form.addEventListener('submit', event => event.preventDefault());
  const fields = [...form.querySelectorAll('input,textarea,select')];
  const keys = Object.keys(sampleDraft(kind));
  const review = form.querySelector('[data-review]');
  let reviewed = false;
  const clear = () => {
    form.reset();
    for (const input of fields) input.value = '';
    review.replaceChildren();
    reviewed = false;
    showErrors(form, {});
    showStep(form, 'edit', false);
  };
  clear();
  form.querySelector('[data-sample]').addEventListener('click', () => {
    const sample = sampleDraft(kind);
    for (const input of fields) input.value = sample[input.name] || '';
    showErrors(form, {});
  });
  form.querySelector('[data-preview]').addEventListener('click', () => {
    const draft = Object.fromEntries(keys.map(key => [key, fields.find(input => input.name === key)?.value || '']));
    const errors = validateDraft(kind, draft);
    showErrors(form, errors);
    if (Object.keys(errors).length) return;
    review.replaceChildren(...reviewDraft(kind, draft).map(row => {
      const paragraph = form.ownerDocument.createElement('p');
      paragraph.textContent = `${row.label}: ${row.value || 'Not provided'}`;
      return paragraph;
    }));
    reviewed = true;
    showStep(form, 'review');
  });
  form.querySelector('[data-edit]').addEventListener('click', () => {
    reviewed = false;
    showStep(form, 'edit');
  });
  form.querySelector('[data-confirm]').addEventListener('click', () => {
    if (reviewed) showStep(form, 'complete');
  });
  form.querySelector('[data-reset]').addEventListener('click', () => {
    clear();
    showStep(form, 'edit');
  });
  form.ownerDocument.defaultView.addEventListener('pagehide', clear);
  form.ownerDocument.defaultView.addEventListener('pageshow', clear);
  form.querySelector('fieldset').disabled = false;
  return clear;
}

/** Runs after vehicle resolution; an invalid ID or upcoming record cannot open an enquiry. */
export function mountForms(doc, store) {
  const root = doc.querySelector('[data-form-page]');
  if (root) {
    const kind = root.dataset.formPage;
    if (kind === 'review') {
      const vehicle = resolveVehicle('write-review.html', new URLSearchParams(doc.defaultView.location.search));
      root.innerHTML = formContent(kind, vehicle);
      doc.title = vehicle ? `Preview your review — ${vehicle.name} | Carzone` : 'Vehicle not found | Carzone';
    }
    const form = root.querySelector('[data-local-form]');
    if (form) bindLocalForm(form, kind);
  }
  const selected = doc.querySelector('[data-selected-vehicle]');
  const vehicle = getVehicle(selected?.dataset.selectedVehicle);
  const dialog = doc.querySelector('#enquiry-dialog');
  const opener = doc.querySelector('[data-enquiry]');
  if (!vehicle || vehicle.availability === 'upcoming' || !dialog || !opener || opener.dataset.enquiry !== vehicle.id) return;
  dialog.innerHTML = formContent('enquiry', vehicle);
  const clear = bindLocalForm(dialog.querySelector('[data-local-form]'), 'enquiry');
  // Clear synchronously too: the native close event is dispatched asynchronously.
  dialog.querySelector('[data-close-dialog]').addEventListener('click', clear);
  dialog.addEventListener('cancel', clear);
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape') clear(); });
  const modal = mountDialog(dialog, opener);
  dialog.addEventListener('close', clear);
  opener.addEventListener('click', () => { clear(); modal.open(); });
  opener.disabled = false;
}
