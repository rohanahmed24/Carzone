import {vehicles} from '../domain/catalogue.mjs';
import {comparisonQuery} from '../domain/compare.mjs';
import {savedContent} from '../ui/saved.mjs';
import {escapeHtml as e} from '../ui/escape.mjs';
import {mountDialog} from './dialog.mjs';

// Shared URLs belong to the page until an explicit edit, not to device storage.
const comparisonViews = new WeakMap();
export const setComparisonView = (doc, ids) => comparisonViews.set(doc,[...ids]);
const nameOf = id => vehicles.find(v => v.id === id)?.name ?? 'Car';
const announce = (doc, text) => {
  const status = doc.querySelector('#saved-dialog')?.open
    ? doc.querySelector('[data-saved-status]') ?? doc.querySelector('[data-status]')
    : doc.querySelector('[data-status]');
  if (status) status.textContent = text;
};

export function syncSelection(doc, selection) {
  const compare = comparisonViews.get(doc) ?? selection.compare;
  for (const [attribute, ids, activeLabel, inactiveLabel] of [
    ['save',selection.saved,'Saved','Save'], ['compare',compare,'Remove from compare','Add to compare'],
  ]) {
    doc.querySelectorAll(`[data-${attribute}]`).forEach(button => {
      const id = button.dataset[attribute];
      const active = ids.includes(id);
      button.disabled = false;
      button.setAttribute('aria-pressed',String(active));
      button.setAttribute('aria-label',`${active ? activeLabel : inactiveLabel} ${nameOf(id)}`);
      const label = button.querySelector('span:not(.icon)');
      if (label) label.textContent = active ? activeLabel : inactiveLabel;
    });
  }
  doc.querySelectorAll('[data-saved-count]').forEach(count => { count.textContent = String(selection.saved.length); });
  const tray = doc.querySelector('[data-compare-tray]');
  if (tray) {
    tray.hidden = compare.length === 0;
    tray.querySelector('[data-compare-list]').innerHTML = `<ul>${compare.map(id => `<li><span>${e(nameOf(id))}</span><button type="button" data-remove-compare="${e(id)}" aria-label="Remove ${e(nameOf(id))} from comparison"><span class="icon icon-x" aria-hidden="true"></span></button></li>`).join('')}</ul>`;
    tray.querySelector('a').href = `compare-car.html?${comparisonQuery(compare)}`;
  }
}

export function mountSaved(doc, store) {
  const dialog = doc.querySelector('#saved-dialog');
  const list = doc.querySelector('[data-saved-list]');
  let opener;
  let undoSaved;
  let undoCompare;
  const modal = mountDialog(dialog,{get isConnected(){ return opener?.isConnected; },focus(){ opener?.focus(); }});
  const savedUndo = doc.querySelector('[data-saved-undo]');
  const pageSavedUndo = doc.querySelector('[data-page-saved-undo]');
  const savedUndoSurfaces = [savedUndo,pageSavedUndo].filter(Boolean);
  const persistenceCopy = () => store.persistence().available ? 'on this device' : 'for this page only';
  const removeSaved = (id, button) => {
    undoSaved = {restore:store.removeSaved(id),button};
    savedUndoSurfaces.forEach(surface=>{
      surface.hidden=false;
      surface.querySelector('p').textContent=`${nameOf(id)} removed from saved cars.`;
    });
    if (!button.isConnected) (dialog.open ? savedUndo : pageSavedUndo)?.querySelector('button').focus();
    announce(doc,`${nameOf(id)} removed. Undo is available.`);
  };
  const selectionUndo = doc.querySelector('[data-selection-undo]');
  const drawerCompareUndo = doc.querySelector('[data-saved-comparison-undo]');
  const refresh = selection => {
    // Replacing the drawer list is necessary only when its IDs change.
    const key = selection.saved.join(',');
    if (list.dataset.ids !== key) {
      list.innerHTML = savedContent(selection.saved);
      list.dataset.ids = key;
    }
    syncSelection(doc,selection);
  };
  store.subscribe(refresh);
  refresh(store.snapshot());
  doc.querySelectorAll('[data-open-saved]').forEach(button => {
    button.disabled = typeof dialog.showModal !== 'function';
    button.addEventListener('click',() => {
      opener = button;
      // Do not nest the saved dialog inside the mobile navigation modal.
      const menu = doc.querySelector('#mobile-menu');
      if (menu?.open) { menu.close(); opener = doc.querySelector('[data-open-menu]'); }
      modal.open();
    });
  });
  doc.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-save')) {
      const id = button.dataset.save;
      if (store.snapshot().saved.includes(id)) removeSaved(id,button);
      else if (store.toggleSaved(id)) announce(doc,`${nameOf(id)} saved ${persistenceCopy()}.`);
    } else if (button.hasAttribute('data-remove-saved')) {
      const id = button.dataset.removeSaved;
      removeSaved(id,button);
    } else if (button.hasAttribute('data-undo-saved')) {
      if (!undoSaved) return;
      undoSaved.restore();
      const returnTo = undoSaved.button;
      undoSaved = null;
      savedUndoSurfaces.forEach(surface=>{surface.hidden=true;});
      (dialog.open ? list.querySelector('[data-remove-saved]') ?? dialog.querySelector('[data-close-dialog]')
        : returnTo.isConnected ? returnTo : doc.querySelector('[data-open-saved]'))?.focus();
      announce(doc,`Saved car restored ${persistenceCopy()}.`);
    } else if (doc.body.dataset.controller !== 'compare') {
      const id = button.dataset.compare ?? button.dataset.removeCompare;
      if (id) {
        if (store.snapshot().compare.includes(id)) {
          undoCompare = {id,restore:store.removeCompare(id)};
          selectionUndo.hidden = false;
          if (drawerCompareUndo) drawerCompareUndo.hidden = false;
          selectionUndo.querySelector('p').textContent = `${nameOf(id)} removed from comparison.`;
          if (!button.isConnected) selectionUndo.querySelector('button').focus();
          announce(doc,`${nameOf(id)} removed from comparison. Undo is available.`);
        } else if (store.addCompare(id)) announce(doc,`${nameOf(id)} added to comparison.`);
        else announce(doc,'Compare up to three cars.');
      } else if (button.hasAttribute('data-undo-selection')) {
        undoCompare?.restore();
        // Store can reject restoration if later choices filled all three places.
        if (undoCompare && !store.snapshot().compare.includes(undoCompare.id)) {
          announce(doc,'Compare up to three cars. Remove a car before undoing.');
          return;
        }
        selectionUndo.hidden = true;
        if (drawerCompareUndo) drawerCompareUndo.hidden = true;
        undoCompare = null;
        (dialog.open ? list.querySelector('[data-compare]') : doc.querySelector('[data-compare-tray] a'))?.focus();
        announce(doc,'Car restored to comparison.');
      }
    }
  });
}
