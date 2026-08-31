import test from 'node:test';
import assert from 'node:assert/strict';

import { createStore } from '../src/domain/store.mjs';

const validIds = new Set(['a', 'b', 'c', 'd']);

test('save is unlimited; compare is ordered and capped', () => {
  const notices = [];
  const store = createStore({ validIds, storage: null, onNotice: text => notices.push(text) });

  for (const id of ['a', 'b', 'c', 'd']) assert.equal(store.toggleSaved(id), true);
  assert.deepEqual(store.snapshot(), { saved: ['a', 'b', 'c', 'd'], compare: [] });
  for (const id of ['a', 'b', 'c']) assert.equal(store.addCompare(id), true);
  assert.equal(store.addCompare('d'), false);
  assert.deepEqual(store.snapshot().compare, ['a', 'b', 'c']);

  const undo = store.removeCompare('b');
  undo();
  assert.deepEqual(store.snapshot().compare, ['a', 'b', 'c']);
  assert.ok(notices.some(text => text.includes('three')));
});

test('load cleans stale IDs, deduplicates, caps compare, and persists only selection fields', () => {
  const writes = [];
  const storage = {
    getItem: () => JSON.stringify({ saved: ['b', 'stale', 'a', 'b'], compare: ['d', 'c', 'stale', 'b', 'a'], draft: 'do not retain' }),
    setItem: (_key, value) => writes.push(JSON.parse(value)),
  };
  const store = createStore({ validIds, storage, onNotice: () => {} });

  assert.deepEqual(store.snapshot(), { saved: ['b', 'a'], compare: ['d', 'c', 'b'] });
  store.toggleSaved('d');
  assert.deepEqual(Object.keys(writes.at(-1)).sort(), ['compare', 'saved']);
  assert.equal('draft' in writes.at(-1), false);
});

test('corrupt or malformed saved data starts temporary selection and disables persistence', () => {
  for (const content of ['{bad json', JSON.stringify(['a']), JSON.stringify({ saved: ['a'], compare: 'b' })]) {
    const notices = [];
    let writes = 0;
    const store = createStore({
      validIds,
      storage: { getItem: () => content, setItem: () => { writes += 1; } },
      onNotice: text => notices.push(text),
    });
    assert.deepEqual(store.snapshot(), { saved: [], compare: [] });
    store.toggleSaved('a');
    assert.equal(writes, 0);
    assert.ok(notices.some(text => text.includes('could not be read')));
  }
});

test('unavailable read and write adapters keep honest in-memory state', () => {
  const readNotices = [];
  const unavailable = createStore({
    validIds,
    storage: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } },
    onNotice: text => readNotices.push(text),
  });
  unavailable.toggleSaved('a');
  assert.deepEqual(unavailable.snapshot(), { saved: ['a'], compare: [] });
  assert.ok(readNotices.some(text => text.includes('unavailable')));

  const writeNotices = [];
  const writeFailure = createStore({
    validIds,
    storage: { getItem: () => null, setItem: () => { throw new Error('quota'); } },
    onNotice: text => writeNotices.push(text),
  });
  writeFailure.toggleSaved('a');
  writeFailure.toggleSaved('b');
  assert.deepEqual(writeFailure.snapshot().saved, ['a', 'b']);
  assert.equal(writeNotices.filter(text => text.includes('unavailable')).length, 1);
});

test('undo restores its original position without erasing newer choices', () => {
  const store = createStore({ validIds, storage: null, onNotice: () => {} });
  store.replaceCompare(['a', 'b', 'c']);
  const undo = store.removeCompare('b');
  store.removeCompare('c');
  store.addCompare('d');
  undo();
  assert.deepEqual(store.snapshot().compare, ['a', 'b', 'd']);
});

test('invalid IDs are no-ops and subscriptions return copied state and unsubscribe', () => {
  const notices = [];
  const store = createStore({ validIds, storage: null, onNotice: text => notices.push(text) });
  const events = [];
  const unsubscribe = store.subscribe(selection => {
    selection.saved.push('mutated-by-listener');
    events.push(selection);
  });

  assert.equal(store.toggleSaved('stale'), false);
  assert.equal(store.addCompare('stale'), false);
  store.toggleSaved('a');
  unsubscribe();
  store.toggleSaved('b');
  assert.deepEqual(store.snapshot().saved, ['a', 'b']);
  assert.equal(events.length, 1);
  assert.ok(notices.length >= 2);
});
