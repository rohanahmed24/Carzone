import test from 'node:test';
import assert from 'node:assert/strict';
import {compareContent} from '../src/ui/compare.mjs';
import {savedContent} from '../src/ui/saved.mjs';
import {mountCompare} from '../src/browser/compare.mjs';
import {createStore} from '../src/domain/store.mjs';
import {vehicles} from '../src/domain/catalogue.mjs';
import {mountSaved, syncSelection} from '../src/browser/saved.mjs';

function fixture(search, deviceIds = ['touring-coupe']) {
  const writes = [];
  const store = createStore({validIds:new Set(vehicles.map(v => v.id)),storage:{
    getItem:()=>JSON.stringify({saved:['family-suv'],compare:deviceIds}),
    setItem:(_key,value)=>writes.push(JSON.parse(value)),
  }});
  const doc = new EventTarget();
  const win = new EventTarget();
  const select = {value:'',focus(){}};
  const root = {innerHTML:'',querySelector:selector => selector === '[data-compare-select]' ? select : null};
  const notice = {textContent:''};
  const undo = {hidden:true};
  const elements = {'[data-compare-content]':root,'[data-compare-notice]':notice,'[data-compare-undo]':undo,'[data-compare-undo-message]':{}};
  doc.querySelector = selector => elements[selector] ?? null;
  doc.querySelectorAll = () => [];
  doc.defaultView = win;
  win.location = {search};
  const history = [];
  win.history = {pushState(_state,_title,url){ history.push(url); win.location.search = url.slice(url.indexOf('?')); }};
  const click = dataset => {
    const button = {dataset,hasAttribute:name=>name === 'data-undo-compare' && 'undoCompare' in dataset};
    const event = new Event('click');
    Object.defineProperty(event,'target',{value:{closest:()=>button}});
    doc.dispatchEvent(event);
  };
  mountCompare(doc,store);
  return {doc,win,root,notice,undo,store,writes,history,click};
}

test('compare content exposes all columns and honest empty states', () => {
  assert.match(compareContent([],false),/Choose cars to compare/);
  assert.match(compareContent(['city-sedan'],true),/Add another car/);
  const three = compareContent(['city-sedan','sport-sedan','family-suv'],false);
  assert.match(three,/<table/);
  assert.match(three,/scope="row"/);
  assert.match(three,/Family SUV/);
  assert.match(three,/Scroll horizontally/);
  assert.match(savedContent([]),/No saved cars yet/);
  assert.match(savedContent(['city-sedan']),/Add to compare/);
  assert.equal((three.match(/<th scope="col"/g) || []).length,4);
  assert.match(three,/role="region" tabindex="0"/);
  assert.match(three,/data-add-compare disabled/);
  assert.match(compareContent([],false),/data-differences disabled/);
});

test('shared comparison reads are nonpersistent; explicit edits own URL and device selection', () => {
  const f = fixture('?cars=city-sedan');
  assert.match(f.root.innerHTML,/City sedan/);
  assert.deepEqual(f.store.snapshot().compare,['touring-coupe']);
  assert.equal(f.writes.length,0);
  f.click({compare:'sport-sedan'});
  assert.deepEqual(f.store.snapshot(),{saved:['family-suv'],compare:['city-sedan','sport-sedan']});
  assert.match(f.history[0],/cars=city-sedan%2Csport-sedan/);
  f.win.location.search = '?cars=';
  f.win.dispatchEvent(new Event('popstate'));
  assert.match(f.root.innerHTML,/Choose cars to compare/);
  assert.equal(f.writes.length,1);
  assert.equal(f.history.length,1);
  const emptyReload = fixture('?cars=');
  assert.match(emptyReload.root.innerHTML,/Choose cars to compare/);
  assert.equal(emptyReload.writes.length,0);
});

test('compare edits reject fourth selection and undo restores order without erasing later additions', () => {
  const f = fixture('?cars=city-sedan,sport-sedan,family-suv');
  f.click({compare:'touring-coupe'});
  assert.equal(f.writes.length,0);
  assert.equal(f.notice.textContent,'Compare up to three cars.');
  f.click({removeCompare:'sport-sedan'});
  assert.deepEqual(f.store.snapshot().compare,['city-sedan','family-suv']);
  f.click({undoCompare:''});
  assert.deepEqual(f.store.snapshot().compare,['city-sedan','sport-sedan','family-suv']);
  f.click({removeCompare:'sport-sedan'});
  f.click({compare:'touring-coupe'});
  f.click({undoCompare:''});
  assert.deepEqual(f.store.snapshot().compare,['city-sedan','family-suv','touring-coupe']);
  assert.match(f.notice.textContent,/Remove a car before undoing/);
  assert.equal(f.undo.hidden,false);
});

test('unknown shared IDs are omitted with a visible parsing notice', () => {
  const f = fixture('?cars=unknown,city-sedan');
  assert.match(f.notice.textContent,/unknown or excess/);
  assert.equal(f.writes.length,0);
});

test('saved controller keeps unlimited saves separate, opening read-only, and restores removed order', () => {
  const doc = new EventTarget();
  const dialog = new EventTarget();
  const opener = new EventTarget();
  const count = {};
  const focusable = {focus(){}};
  const list = {dataset:{},querySelector:()=>focusable};
  const savedUndo = {hidden:true,querySelector:selector=>selector === 'p' ? {} : focusable};
  const drawerUndo = {hidden:true};
  dialog.querySelectorAll = () => [];
  dialog.querySelector = () => focusable;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; };
  opener.isConnected = true;
  opener.focus = () => {};
  const status = {};
  const elements = {'#saved-dialog':dialog,'[data-saved-list]':list,'[data-saved-undo]':savedUndo,'[data-selection-undo]':savedUndo,'[data-saved-comparison-undo]':drawerUndo,'[data-status]':status};
  doc.querySelector = selector => elements[selector] ?? null;
  doc.querySelectorAll = selector => selector === '[data-open-saved]' ? [opener] : selector === '[data-saved-count]' ? [count] : [];
  doc.body = {dataset:{controller:'home'}};
  let writes = 0;
  const store = createStore({validIds:new Set(vehicles.map(v=>v.id)),storage:{getItem:()=>null,setItem(){ writes++; }},onNotice:text=>{ status.textContent = text; }});
  mountSaved(doc,store);
  opener.dispatchEvent(new Event('click'));
  assert.equal(writes,0);
  assert.equal(dialog.open,true);
  const click = dataset => {
    const button = {dataset,isConnected:true,hasAttribute:name=>({ 'data-save':'save','data-remove-saved':'removeSaved','data-undo-saved':'undoSaved','data-undo-selection':'undoSelection' }[name]) in dataset};
    const event = new Event('click');
    Object.defineProperty(event,'target',{value:{closest:()=>button}});
    doc.dispatchEvent(event);
  };
  for (const id of ['city-sedan','sport-sedan','family-suv','touring-coupe']) click({save:id});
  assert.equal(count.textContent,'4');
  assert.deepEqual(store.snapshot().compare,[]);
  click({removeSaved:'sport-sedan'});
  click({save:'concept-fastback'});
  click({undoSaved:''});
  assert.deepEqual(store.snapshot().saved,['city-sedan','sport-sedan','family-suv','touring-coupe','concept-fastback']);
  assert.equal(count.textContent,'5');
  for (const id of ['city-sedan','sport-sedan','family-suv','touring-coupe']) click({compare:id});
  assert.deepEqual(store.snapshot().compare,['city-sedan','sport-sedan','family-suv']);
  assert.equal(status.textContent,'Compare up to three cars.');
  click({compare:'sport-sedan'});
  assert.equal(drawerUndo.hidden,false);
  click({undoSelection:''});
  assert.deepEqual(store.snapshot().compare,['city-sedan','sport-sedan','family-suv']);
  assert.equal(drawerUndo.hidden,true);
});

test('selection synchronization updates pressed names and shared tray without persisting', () => {
  const label = {};
  const attributes = {};
  const button = {dataset:{save:'city-sedan'},querySelector:()=>label,setAttribute:(key,value)=>{attributes[key]=value;}};
  const trayList = {};
  const link = {};
  const tray = {hidden:true,querySelector:selector=>selector === 'a' ? link : trayList};
  const doc = {querySelector:()=>tray,querySelectorAll:selector=>selector === '[data-save]' ? [button] : []};
  syncSelection(doc,{saved:['city-sedan'],compare:['sport-sedan']});
  assert.equal(label.textContent,'Saved');
  assert.equal(attributes['aria-pressed'],'true');
  assert.equal(button.disabled,false);
  assert.equal(tray.hidden,false);
  assert.match(trayList.innerHTML,/Sport sedan/);
  assert.match(link.href,/cars=sport-sedan/);
});
