import {parseFilters, serializeFilters} from '../domain/query.mjs';
import {inventoryResults} from '../ui/inventory.mjs';
import {mountDialog} from './dialog.mjs';

const defaults = {view:'all',condition:'any',budget:'any',body:'any',sort:'featured'};

function syncControls(root, filters) {
  root.querySelectorAll('select[name]').forEach(control => { control.value = filters[control.name]; });
}

export function mountInventory(doc, store) {
  const results = doc.querySelector('[data-results]');
  if (!results) return;
  const win = doc.defaultView;
  const route = win.location.pathname.split('/').pop();
  const desktop = doc.querySelector('[data-desktop-filters]');
  const mobile = doc.querySelector('[data-mobile-filters]');
  const desktopFields = doc.querySelector('[data-desktop-fields]');
  const mobileFields = doc.querySelector('[data-mobile-fields]');
  const dialog = doc.querySelector('#inventory-filters');
  const opener = doc.querySelector('[data-open-filters]');
  const modal = mountDialog(dialog,opener);
  const media = win.matchMedia('(max-width: 700px)');
  let current = parseFilters(new URLSearchParams(win.location.search),route);
  let draft = {...current};

  const render = () => {
    results.innerHTML = inventoryResults(current,route);
    doc.querySelectorAll('[data-inventory-view]').forEach(link => {
      const view = link.dataset.inventoryView;
      link.href = `${route}?${serializeFilters({...current,view})}`;
      if (view === current.view) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  };
  const commit = next => {
    current = parseFilters(new URLSearchParams(serializeFilters(next)),route);
    win.history.pushState(null,'',`${route}?${serializeFilters(current)}`);
    render();
    syncControls(desktop,current);
  };
  const readControls = (form,base) => {
    const next = {...base};
    form.querySelectorAll('select[name]').forEach(control => { next[control.name] = control.value; });
    return parseFilters(new URLSearchParams(serializeFilters(next)),route);
  };
  const responsive = () => {
    if (!media.matches && dialog.open) modal.close();
    desktopFields.disabled = media.matches && typeof dialog.showModal === 'function';
    mobileFields.disabled = !dialog.open;
  };
  desktop.addEventListener('submit',event => event.preventDefault());
  desktop.addEventListener('change',() => commit(readControls(desktop,current)));
  opener.addEventListener('click',() => {
    draft = {...current};
    syncControls(mobile,draft);
    mobileFields.disabled = false;
    modal.open();
  });
  mobile.addEventListener('change',() => { draft = readControls(mobile,draft); });
  mobile.addEventListener('submit',event => {
    event.preventDefault();
    commit(readControls(mobile,draft));
    modal.close();
  });
  doc.querySelector('[data-clear-draft]').addEventListener('click',() => {
    draft = {...defaults};
    syncControls(mobile,draft);
  });
  dialog.addEventListener('close',() => {
    mobileFields.disabled = true;
    draft = {...current};
    syncControls(mobile,draft);
  });
  doc.addEventListener('click',event => {
    const chip = event.target.closest('[data-remove-filter]');
    const clear = event.target.closest('[data-clear-filters]');
    const tab = event.target.closest('[data-inventory-view]');
    if (chip || clear) {
      commit(clear ? {...defaults} : {...current,[chip.dataset.removeFilter]:defaults[chip.dataset.removeFilter]});
      // A removed chip cannot retain focus. Move to a stable control.
      (media.matches ? opener : desktop.querySelector('select')).focus();
    } else if (tab && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      commit({...current,view:tab.dataset.inventoryView});
    }
  });
  win.addEventListener('popstate',() => {
    current = parseFilters(new URLSearchParams(win.location.search),route);
    render();
    syncControls(desktop,current);
    if (dialog.open) modal.close();
  });
  media.addEventListener('change',responsive);
  if (typeof dialog.showModal === 'function') {
    opener.disabled = false;
    opener.hidden = false;
    doc.body.classList.add('inventory-enhanced');
  }
  syncControls(desktop,current);
  render();
  responsive();
}
