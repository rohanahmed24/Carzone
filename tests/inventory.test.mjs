import test from 'node:test';
import assert from 'node:assert/strict';
import {renderInventory} from '../src/pages/inventory.mjs';
import {inventoryResults} from '../src/ui/inventory.mjs';
import {parseFilters} from '../src/domain/query.mjs';
import {mountInventory} from '../src/browser/inventory.mjs';

test('inventory has meaningful editorial and empty states', () => {
  const popular = renderInventory('popular-cars.html');
  assert.match(popular.body,/Editorial sample selection/);
  const f = parseFilters(new URLSearchParams('view=upcoming&budget=25000'), 'upcoming-cars.html');
  const empty = inventoryResults(f,'upcoming-cars.html');
  assert.match(empty,/No cars match/);
  assert.match(empty,/Unknown prices are excluded/);
  assert.match(empty,/Clear filters/);
  assert.doesNotMatch(empty,/Reserve|Book now/);
});

test('controller isolates mobile drafts, restores on cancel, commits once and reads history', () => {
  const doc = new EventTarget();
  const win = new EventTarget();
  const media = new EventTarget();
  media.matches = true;
  const makeForm = () => {
    const form = new EventTarget();
    form.controls = ['condition','budget','body','sort'].map(name => ({name,value:'',focus(){}}));
    form.querySelectorAll = () => form.controls;
    form.querySelector = () => form.controls[0];
    return form;
  };
  const desktop = makeForm();
  const mobile = makeForm();
  const dialog = new EventTarget();
  const opener = new EventTarget();
  let focusCount = 0;
  opener.isConnected = true;
  opener.focus = () => { focusCount++; };
  dialog.querySelectorAll = () => [];
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
  const desktopFields = {};
  const mobileFields = {};
  const results = {};
  const clearDraft = new EventTarget();
  const elements = {
    '[data-results]':results, '[data-desktop-filters]':desktop, '[data-mobile-filters]':mobile,
    '[data-desktop-fields]':desktopFields, '[data-mobile-fields]':mobileFields,
    '#inventory-filters':dialog, '[data-open-filters]':opener, '[data-clear-draft]':clearDraft,
  };
  doc.querySelector = selector => elements[selector];
  doc.querySelectorAll = () => [];
  doc.body = {classList:{add(){}}};
  doc.defaultView = win;
  win.location = {pathname:'/latest-cars.html',search:'?view=all&condition=used'};
  win.matchMedia = () => media;
  const history = [];
  win.history = {pushState(_state,_unused,url){ history.push(url); }};
  mountInventory(doc,{snapshot:()=>({saved:[],compare:[]})});
  assert.equal(desktopFields.disabled,true);
  assert.equal(mobileFields.disabled,true);
  const original = results.innerHTML;
  opener.dispatchEvent(new Event('click'));
  assert.equal(mobileFields.disabled,false);
  mobile.controls.find(c => c.name === 'budget').value = '25000';
  mobile.dispatchEvent(new Event('change'));
  assert.equal(results.innerHTML,original);
  assert.equal(history.length,0);
  const escape = new Event('keydown',{cancelable:true});
  Object.defineProperty(escape,'key',{value:'Escape'});
  dialog.dispatchEvent(escape);
  assert.equal(mobileFields.disabled,true);
  assert.equal(focusCount,1);
  opener.dispatchEvent(new Event('click'));
  assert.equal(mobile.controls.find(c => c.name === 'budget').value,'any');
  mobile.controls.find(c => c.name === 'budget').value = '25000';
  mobile.dispatchEvent(new Event('submit',{cancelable:true}));
  assert.equal(history.length,1);
  assert.match(history[0],/budget=25000/);
  assert.match(results.innerHTML,/2 illustrative cars/);
  win.location.search = '?view=upcoming&budget=25000';
  win.dispatchEvent(new Event('popstate'));
  assert.equal(history.length,1);
  assert.match(results.innerHTML,/No cars match/);
  assert.equal(desktop.controls.find(c => c.name === 'budget').value,'25000');
  opener.dispatchEvent(new Event('click'));
  clearDraft.dispatchEvent(new Event('click'));
  assert.match(results.innerHTML,/No cars match/);
  mobile.dispatchEvent(new Event('submit',{cancelable:true}));
  assert.equal(history.length,2);
  assert.match(history[1],/view=all&condition=any&budget=any&body=any&sort=featured/);
  media.matches = false;
  media.dispatchEvent(new Event('change'));
  assert.equal(desktopFields.disabled,false);
  assert.equal(mobileFields.disabled,true);
  const stableControl = desktop.controls[0];
  stableControl.value = 'used';
  desktop.dispatchEvent(new Event('change'));
  assert.equal(history.length,3);
  assert.equal(desktop.controls[0],stableControl);
});

test('all inventory routes have a single heading and disabled progressive controls', () => {
  for (const view of ['latest','popular','upcoming']) {
    const page = renderInventory(`${view}-cars.html`);
    assert.equal(page.controller,'inventory');
    assert.match(page.title,new RegExp(view,'i'));
    assert.match(page.body,/<h1>Find what fits\.<\/h1>/);
    assert.match(page.body,/<fieldset data-mobile-fields disabled>/);
    assert.match(page.body,/name="sort"/);
  }
});

test('rows use encoded identical return links and selected price order', () => {
  const f = parseFilters(new URLSearchParams('view=all&condition=used&body=sedan&sort=price-desc'),'latest-cars.html');
  const html = inventoryResults(f,'latest-cars.html');
  assert.ok(html.indexOf('Sport sedan') < html.indexOf('City sedan'));
  assert.match(html,/return=latest-cars.html%3Fview%3Dall%26condition%3Dused/);
  assert.match(html,/data-remove-filter="condition"/);
  assert.match(html,/data-remove-filter="body"/);
  assert.match(html,/2 illustrative cars/);
  assert.match(html,/data-save="[^"]+"[^>]*disabled/);
  assert.match(html,/data-remove-filter="condition" disabled/);
  assert.match(html,/data-clear-filters disabled/);
});
