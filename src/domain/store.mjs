const STORAGE_KEY = 'carzone.selection.v1';
const STORAGE_NOTICE = 'Device storage unavailable; changes last for this page.';
const CORRUPT_NOTICE = 'Saved device data could not be read; starting a temporary selection.';
const INVALID_NOTICE = 'That car is unavailable.';
const COMPARE_LIMIT_NOTICE = 'Compare up to three cars.';

const emptySelection = () => ({ saved: [], compare: [] });

const copySelection = selection => ({
  saved: [...selection.saved],
  compare: [...selection.compare],
});

const clean = (ids, validIds, limit = Infinity) =>
  [...new Set(ids.filter(id => typeof id === 'string' && validIds.has(id)))].slice(0, limit);

const isStoredSelection = value =>
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Array.isArray(value.saved)
  && Array.isArray(value.compare);

/**
 * Keep the device-local shortlist and comparison tray distinct and resilient.
 *
 * @param {{validIds:Set<string>, storage:Storage|null, onNotice:(text:string)=>void}} options
 */
export function createStore({ validIds, storage, onNotice }) {
  const listeners = new Set();
  const notifyNotice = typeof onNotice === 'function' ? onNotice : () => {};
  let adapter = storage;
  let persistenceAvailable = adapter !== null && adapter !== undefined;
  let persistenceNotice = persistenceAvailable ? '' : STORAGE_NOTICE;
  let state = emptySelection();

  const markUnavailable = () => {
    if (!persistenceAvailable) return;
    persistenceAvailable = false;
    adapter = null;
    persistenceNotice = STORAGE_NOTICE;
    notifyNotice(STORAGE_NOTICE);
  };

  if (!persistenceAvailable) {
    notifyNotice(STORAGE_NOTICE);
  } else {
    try {
      const content = adapter.getItem(STORAGE_KEY);
      if (content !== null) {
        try {
        const parsed = JSON.parse(content);
        if (!isStoredSelection(parsed)) throw new Error('Invalid selection shape');
        state = {
          saved: clean(parsed.saved, validIds),
          compare: clean(parsed.compare, validIds, 3),
        };
        } catch {
          state = emptySelection();
          persistenceAvailable = false;
          adapter = null;
          persistenceNotice = CORRUPT_NOTICE;
          notifyNotice(CORRUPT_NOTICE);
        }
      }
    } catch {
      markUnavailable();
    }
  }

  const publish = () => {
    for (const listener of listeners) listener(copySelection(state));
  };

  const persistAndPublish = () => {
    if (persistenceAvailable) {
      try {
        adapter.setItem(STORAGE_KEY, JSON.stringify(copySelection(state)));
      } catch {
        markUnavailable();
      }
    }
    publish();
  };

  const remove = (key, id) => {
    if (typeof id !== 'string' || !validIds.has(id)) {
      notifyNotice(INVALID_NOTICE);
      return () => {};
    }
    const index = state[key].indexOf(id);
    if (index < 0) return () => {};

    state = {
      saved: key === 'saved' ? state.saved.filter(value => value !== id) : [...state.saved],
      compare: key === 'compare' ? state.compare.filter(value => value !== id) : [...state.compare],
    };
    persistAndPublish();

    return () => {
      if (state[key].includes(id) || !validIds.has(id)) return;
      if (key === 'compare' && state.compare.length >= 3) {
        notifyNotice(COMPARE_LIMIT_NOTICE);
        return;
      }
      const restored = [...state[key]];
      restored.splice(Math.min(index, restored.length), 0, id);
      state = {
        saved: key === 'saved' ? restored : [...state.saved],
        compare: key === 'compare' ? restored : [...state.compare],
      };
      persistAndPublish();
    };
  };

  return {
    snapshot: () => copySelection(state),
    // Read-only status, separate from the ID-only selection/storage contract.
    persistence: () => ({available:persistenceAvailable,notice:persistenceNotice}),

    toggleSaved(id) {
      if (typeof id !== 'string' || !validIds.has(id)) {
        notifyNotice(INVALID_NOTICE);
        return false;
      }
      state = state.saved.includes(id)
        ? { saved: state.saved.filter(value => value !== id), compare: [...state.compare] }
        : { saved: [...state.saved, id], compare: [...state.compare] };
      persistAndPublish();
      return true;
    },

    addCompare(id) {
      if (typeof id !== 'string' || !validIds.has(id)) {
        notifyNotice(INVALID_NOTICE);
        return false;
      }
      if (state.compare.includes(id)) return true;
      if (state.compare.length >= 3) {
        notifyNotice(COMPARE_LIMIT_NOTICE);
        return false;
      }
      state = { saved: [...state.saved], compare: [...state.compare, id] };
      persistAndPublish();
      return true;
    },

    removeSaved: id => remove('saved', id),
    removeCompare: id => remove('compare', id),

    replaceCompare(ids) {
      if (!Array.isArray(ids)) {
        notifyNotice(INVALID_NOTICE);
        return;
      }
      if (ids.some(id => typeof id !== 'string' || !validIds.has(id))) notifyNotice(INVALID_NOTICE);
      state = { saved: [...state.saved], compare: clean(ids, validIds, 3) };
      persistAndPublish();
    },

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
