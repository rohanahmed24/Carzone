import {vehicles} from '../domain/catalogue.mjs';
import {resolveComparison, comparisonQuery} from '../domain/compare.mjs';
import {compareContent} from '../ui/compare.mjs';
import {setComparisonView, syncSelection} from './saved.mjs';

export function mountCompare(doc, store) {
  const root = doc.querySelector('[data-compare-content]');
  if (!root) return;
  const win = doc.defaultView;
  const validIds = new Set(vehicles.map(v => v.id));
  let current = [];
  let differencesOnly = false;
  let removed = null;
  const undo = doc.querySelector('[data-compare-undo]');
  const drawerUndo = doc.querySelector('[data-saved-comparison-undo]');
  const notice = text => {
    doc.querySelector('[data-compare-notice]').textContent = text;
    if (doc.querySelector('#saved-dialog')?.open) {
      const savedStatus = doc.querySelector('[data-saved-status]');
      if (savedStatus) savedStatus.textContent = text;
    }
  };
  const render = (restoreFocus = false, active = doc.activeElement, priorIndex = -1) => {
    const priorId = active?.dataset?.removeCompare;
    setComparisonView(doc,current);
    root.innerHTML = compareContent(current,differencesOnly);
    syncSelection(doc,store.snapshot());
    if (restoreFocus && !active?.isConnected) {
      const surviving = priorId && root.querySelector(`[data-remove-compare="${priorId}"]`);
      const neighborId = current[Math.min(Math.max(priorIndex,0),current.length - 1)];
      const neighbor = neighborId && root.querySelector(`[data-remove-compare="${neighborId}"]`);
      (surviving || neighbor || root.querySelector('[data-compare-select]'))?.focus();
    }
  };
  const read = () => {
    const resolved = resolveComparison(new URLSearchParams(win.location.search),store.snapshot().compare,validIds);
    current = resolved.ids;
    removed = null;
    undo.hidden = true;
    if (drawerUndo) drawerUndo.hidden = true;
    render();
    notice(resolved.notice ?? '');
  };
  const edit = ids => {
    const active = doc.activeElement;
    const priorIndex = current.indexOf(active?.dataset?.removeCompare);
    current = ids;
    setComparisonView(doc,current);
    store.replaceCompare(current);
    win.history.pushState(null,'',`compare-car.html?${comparisonQuery(current)}`);
    render(true,active,priorIndex);
  };
  const add = id => {
    if (!validIds.has(id) || current.includes(id)) return;
    if (current.length >= 3) { notice('Compare up to three cars.'); return; }
    edit([...current,id]);
    notice(`${vehicles.find(v => v.id === id).name} added to comparison.`);
  };
  doc.addEventListener('submit',event => {
    if (!event.target.matches('[data-compare-add]')) return;
    event.preventDefault();
    add(root.querySelector('[data-compare-select]').value);
  });
  doc.addEventListener('change',event => {
    if (!event.target.matches('[data-differences]')) return;
    differencesOnly = event.target.checked;
    render();
    root.querySelector('[data-differences]').focus();
    notice(root.querySelector('[data-no-differences]') ? 'No differences in the displayed sample facts.' : differencesOnly ? 'Showing differences only.' : 'Showing all sample facts.');
  });
  doc.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const id = button.dataset.removeCompare ?? button.dataset.compare;
    if (id && current.includes(id)) {
      removed = {id,index:current.indexOf(id)};
      edit(current.filter(value => value !== id));
      undo.hidden = false;
      if (drawerUndo) drawerUndo.hidden = false;
      doc.querySelector('[data-compare-undo-message]').textContent = `${vehicles.find(v => v.id === id).name} removed.`;
      notice('Car removed from comparison. Undo is available.');
    } else if (id) add(id);
    else if (button.hasAttribute('data-undo-compare') && removed) {
      if (current.length >= 3) { notice('Compare up to three cars. Remove a car before undoing.'); return; }
      if (!current.includes(removed.id)) {
        const next = [...current];
        next.splice(Math.min(removed.index,next.length),0,removed.id);
        edit(next);
      }
      removed = null;
      undo.hidden = true;
      if (drawerUndo) drawerUndo.hidden = true;
      (doc.querySelector('#saved-dialog')?.open
        ? doc.querySelector('[data-saved-list] [data-compare]')
        : root.querySelector('[data-remove-compare]'))?.focus();
      notice('Car restored to comparison.');
    }
  });
  win.addEventListener('popstate',read);
  read();
}
