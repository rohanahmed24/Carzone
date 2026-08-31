import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getVehicle} from '../src/domain/catalogue.mjs';
import {sampleDraft, reviewDraft} from '../src/domain/forms.mjs';
import {formContent} from '../src/ui/forms.mjs';
import {renderFormPage} from '../src/pages/forms.mjs';
import {bindLocalForm, mountForms} from '../src/browser/forms.mjs';

const kinds = ['seller', 'review', 'valuation', 'enquiry'];
test('forms are inert, empty and labelled without JavaScript', () => {
  for (const kind of kinds) {
    const html = formContent(kind, getVehicle('city-sedan'));
    assert.match(html, /<fieldset disabled/);
    assert.match(html, /autocomplete="off"/);
    assert.doesNotMatch(html, /action=|type="submit"|type="file"|Message sent|Listing published|Review submitted/);
    for (const [index, key] of Object.keys(sampleDraft(kind)).entries()) {
      assert.match(html, new RegExp(`for="${kind}-${key}"`));
      assert.ok(html.includes(reviewDraft(kind, {})[index].label));
      assert.match(html, new RegExp(`id="${kind}-${key}-error"`));
    }
    for (const value of Object.values(sampleDraft(kind))) if (value.length > 5) assert.ok(!html.includes(value));
    assert.match(html, /Demo preview only — nothing was sent\./);
  }
});

test('page metadata, educational valuation and selected records are truthful', () => {
  for (const kind of kinds.slice(0, 3)) assert.equal(renderFormPage(kind).controller, 'forms');
  const valuation = formContent('valuation', null);
  for (const factor of ['age', 'mileage', 'condition', 'service records']) assert.ok(valuation.includes(factor));
  assert.match(valuation, /No price estimate or dealer offer is generated\./);
  assert.doesNotMatch(valuation, /Estimated value|Guaranteed offer/);
  assert.match(formContent('review', null), /Vehicle not found/);
  assert.doesNotMatch(formContent('enquiry', getVehicle('concept-fastback')), /<form/);
});

function fixture(kind) {
  const listeners = new Map();
  const events = {};
  const node = () => ({hidden: false, textContent: '', children: [], attrs: {}, value: 'restored real value',
    addEventListener(name, fn) { this[name] = fn; },
    replaceChildren(...children) { this.children = children; this.textContent = ''; },
    setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; },
    focus() { this.focused = true; }});
  const fields = Object.keys(sampleDraft(kind)).map(name => Object.assign(node(), {name}));
  const nodes = new Map();
  const get = selector => { if (!nodes.has(selector)) nodes.set(selector, node()); return nodes.get(selector); };
  const form = {
    ownerDocument: {createElement: node, defaultView: {addEventListener: (event, fn) => { events[event] = fn; }}},
    addEventListener: (event, fn) => listeners.set(event, fn),
    querySelector: get, querySelectorAll: () => fields,
    reset() { for (const field of fields) field.value = 'restored real value'; },
  };
  return {form, fields, get, events, listeners};
}

test('each local flow validates, samples, reviews safely, edits and finishes unsent', () => {
  for (const kind of kinds) {
    const f = fixture(kind);
    const clear = bindLocalForm(f.form, kind);
    let blocked = false;
    f.listeners.get('submit')({preventDefault() { blocked = true; }});
    assert.ok(blocked);
    assert.ok(f.fields.every(field => field.value === ''));
    assert.equal(f.get('fieldset').disabled, false);
    f.get('[data-preview]').click();
    assert.equal(f.get('[data-errors]').hidden, false);
    assert.ok(f.get('[data-errors]').focused);
    f.get('[data-sample]').click();
    assert.deepEqual(Object.fromEntries(f.fields.map(field => [field.name, field.value])), sampleDraft(kind));
    f.fields.find(field => ['notes', 'review', 'message', 'model'].includes(field.name)).value += '<img src=x>';
    f.get('[data-preview]').click();
    assert.equal(f.get('[data-step="review"]').hidden, false);
    assert.ok(f.get('[data-review]').children.some(row => row.textContent.includes('<img src=x>')));
    f.get('[data-edit]').click();
    assert.equal(f.get('[data-step="edit"]').hidden, false);
    assert.ok(f.fields.some(field => field.value.includes('<img src=x>')));
    f.get('[data-preview]').click();
    f.get('[data-confirm]').click();
    assert.equal(f.get('[data-step="complete"]').hidden, false);
    for (const reset of [clear, f.events.pagehide, f.events.pageshow, f.get('[data-reset]').click]) {
      f.get('[data-sample]').click();
      f.get('[data-preview]').click();
      reset();
      assert.ok(f.fields.every(field => field.value === ''));
      assert.equal(f.get('[data-review]').children.length, 0);
      assert.equal(f.get('[data-errors]').hidden, true);
      assert.equal(f.get('[data-step="complete"]').hidden, true);
    }
  }
});

test('invalid review IDs are resolved explicitly, never silently replaced', () => {
  for (const search of ['?car=', '?car=invalid']) {
    const root = {dataset: {formPage: 'review'}, innerHTML: '', querySelector: () => null};
    mountForms({defaultView: {location: {search}}, querySelector: selector => selector === '[data-form-page]' ? root : null}, {});
    assert.match(root.innerHTML, /Vehicle not found/);
    assert.doesNotMatch(root.innerHTML, /<form/);
  }
});

test('runtime contains no transmission, persistence or location-write API', () => {
  const source = readFileSync(new URL('../src/browser/forms.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|mailto:|history\.|location\s*=/);
});

test('enquiry binds only the current eligible record and clears on all close paths', () => {
  for (const id of ['city-sedan', 'concept-fastback', 'missing']) {
    const f = fixture('enquiry');
    const events = new Map();
    const closeHandlers = [];
    const closeButton = {addEventListener: (event, fn) => closeHandlers.push(fn)};
    const opener = {dataset: {enquiry: id}, disabled: true, isConnected: true,
      addEventListener(event, fn) { this[event] = fn; }, focus() { this.focused = true; }};
    const dialog = {
      innerHTML: '', open: false,
      querySelector: selector => selector === '[data-local-form]' ? f.form : closeButton,
      querySelectorAll: () => [closeButton],
      addEventListener(event, fn) { if (!events.has(event)) events.set(event, []); events.get(event).push(fn); },
      showModal() { this.open = true; },
      close() { this.open = false; for (const fn of events.get('close')) fn(); },
    };
    const doc = {querySelector: selector => ({
      '[data-selected-vehicle]': {dataset: {selectedVehicle: id}},
      '#enquiry-dialog': dialog, '[data-enquiry]': opener,
    })[selector] || null};
    mountForms(doc, {});
    if (id !== 'city-sedan') {
      assert.equal(opener.disabled, true);
      assert.equal(dialog.innerHTML, '');
      continue;
    }
    assert.equal(opener.disabled, false);
    assert.match(dialog.innerHTML, /id="enquiry-title"/);
    for (const path of ['close', 'cancel', 'keydown']) {
      opener.click();
      assert.equal(dialog.open, true);
      f.get('[data-sample]').click();
      f.get('[data-preview]').click();
      if (path === 'close') for (const fn of closeHandlers) fn();
      else for (const fn of events.get(path)) fn({key: 'Escape', preventDefault() {}});
      assert.equal(dialog.open, false);
      assert.ok(opener.focused);
      assert.ok(f.fields.every(field => field.value === ''));
      assert.equal(f.get('[data-review]').children.length, 0);
    }
  }
});
