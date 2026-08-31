import {vehicles} from '../domain/catalogue.mjs';
import {createStore} from '../domain/store.mjs';

/** Bind persistent fallback warnings separately from transient action feedback. */
export function createPageStore(doc) {
  let storage = null;
  try { storage = doc.defaultView.localStorage; } catch { /* Store reports temporary mode. */ }
  const store = createStore({validIds:new Set(vehicles.map(v=>v.id)),storage,
    onNotice:text=>{ const status=doc.querySelector('[data-status]'); if(status) status.textContent=text; },
  });
  const refreshWarning = () => {
    const {available,notice} = store.persistence();
    doc.querySelectorAll('[data-storage-warning]').forEach(element=>{
      element.hidden=available;
      element.textContent=notice;
    });
  };
  store.subscribe(refreshWarning);
  refreshWarning();
  return store;
}
