import test from 'node:test';
import assert from 'node:assert/strict';
import {compareContent} from '../src/ui/compare.mjs';
import {savedContent} from '../src/ui/saved.mjs';
import {mountCompare} from '../src/browser/compare.mjs';
import {createStore} from '../src/domain/store.mjs';
import {vehicles} from '../src/domain/catalogue.mjs';
import {mountSaved, syncSelection} from '../src/browser/saved.mjs';
import {renderShell} from '../src/ui/shell.mjs';

function savedFixture(storage) {
  const doc = new EventTarget();
  const dialog = new EventTarget();
  let focused;
  const control = name => ({isConnected:true,focus(){focused=name;}});
  const close = control('close');
  const makeUndo = name => {
    const button = control(name), message = {};
    return {hidden:true,querySelector:selector=>selector === 'p' ? message : button};
  };
  const drawerUndo = makeUndo('drawer-undo'), pageUndo = makeUndo('page-undo');
  const status = {}, drawerStatus = {}, warning = {hidden:true}, drawerWarning = {hidden:true};
  const list = {dataset:{},querySelector:()=>control('drawer-remove')};
  dialog.open = false;
  dialog.querySelectorAll = () => [];
  dialog.querySelector = () => close;
  const elements = {'#saved-dialog':dialog,'[data-saved-list]':list,'[data-saved-undo]':drawerUndo,'[data-page-saved-undo]':pageUndo,'[data-status]':status,'[data-saved-status]':drawerStatus};
  doc.querySelector = selector => elements[selector] ?? null;
  doc.querySelectorAll = selector => selector === '[data-storage-warning]' ? [warning,drawerWarning] : [];
  doc.body = {dataset:{controller:'home'}};
  doc.defaultView = storage === 'getter-failure' ? Object.defineProperty({},'localStorage',{get(){throw new Error('blocked getter');}}) : {localStorage:storage};
  const click = (dataset, isConnected = true) => {
    const button = {...control('toggle'),isConnected,dataset,hasAttribute:name=>name.replace(/^data-/, '').replace(/-([a-z])/g,(_m,c)=>c.toUpperCase()) in dataset};
    const event = new Event('click');
    Object.defineProperty(event,'target',{value:{closest:()=>button}});
    doc.dispatchEvent(event);
    return button;
  };
  return {doc,dialog,status,drawerStatus,warning,drawerWarning,drawerUndo,pageUndo,click,get focused(){return focused;}};
}

test('integrated saved actions retain a separate warning for every storage fallback', async () => {
  const {createPageStore} = await import('../src/browser/store.mjs');
  for (const storage of [null,'getter-failure',{getItem(){throw new Error('read');}}, {getItem:()=>null,setItem(){throw new Error('write');}}, {getItem:()=>'{corrupt',setItem(){throw new Error('must not write');}}]) {
    const f = savedFixture(storage);
    const store = createPageStore(f.doc);
    mountSaved(f.doc,store);
    f.click({save:'city-sedan'});
    assert.match(f.status.textContent,/saved for this page only/);
    assert.equal(f.warning.hidden,false);
    assert.match(f.warning.textContent,/page|temporary/);
    const warning = f.warning.textContent;
    f.dialog.open = true;
    f.click({save:'sport-sedan'});
    assert.match(f.drawerStatus.textContent,/saved for this page only/);
    assert.equal(f.warning.textContent,warning);
    assert.equal(f.drawerWarning.textContent,warning);
  }
});

test('active row and detail save toggles expose Undo outside the drawer and preserve order', () => {
  const f = savedFixture(null);
  const store = createStore({validIds:new Set(vehicles.map(v=>v.id)),storage:null});
  mountSaved(f.doc,store);
  for (const id of ['city-sedan','sport-sedan','family-suv']) f.click({save:id});
  for (const open of [false,true]) {
    f.dialog.open = open;
    f.click({save:'sport-sedan'});
    assert.equal(f.pageUndo.hidden,false);
    assert.equal(f.drawerUndo.hidden,false);
    assert.match((open ? f.drawerStatus : f.status).textContent,/Undo is available/);
    f.click({undoSaved:''});
    assert.deepEqual(store.snapshot().saved,['city-sedan','sport-sedan','family-suv']);
    assert.equal(f.pageUndo.hidden,true);
    assert.equal(f.drawerUndo.hidden,true);
    assert.equal(f.focused,open ? 'drawer-remove' : 'toggle');
  }
  f.click({removeSaved:'sport-sedan'},false);
  assert.equal(f.focused,'drawer-undo');
  f.click({save:'touring-coupe'});
  f.click({undoSaved:''});
  assert.deepEqual(store.snapshot().saved,['city-sedan','sport-sedan','family-suv','touring-coupe']);
});

test('working storage confirms device saves and shell provides reachable warning and Undo surfaces', async () => {
  const {createPageStore} = await import('../src/browser/store.mjs');
  const writes = [];
  const f = savedFixture({getItem:()=>null,setItem:(_key,value)=>writes.push(JSON.parse(value))});
  mountSaved(f.doc,createPageStore(f.doc));
  f.click({save:'city-sedan'});
  assert.equal(f.status.textContent,'City sedan saved on this device.');
  assert.equal(f.warning.hidden,true);
  assert.deepEqual(writes,[{saved:['city-sedan'],compare:[]}]);
  const html = renderShell({title:'Fixture',description:'Fixture',body:'<h1>Fixture</h1>',controller:'home'});
  const outsideDialogs = html.replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/g,'');
  assert.match(outsideDialogs,/data-page-saved-undo hidden><p><\/p><button type="button" data-undo-saved>Undo saved car removal/);
  assert.match(outsideDialogs,/data-storage-warning role="status" hidden/);
  assert.equal((html.match(/data-storage-warning role="status" hidden/g) ?? []).length,2);
});

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

test('removal focuses the nearest next or previous surviving car, then the add selector', () => {
  for (const [removedId, expected] of [['city-sedan','sport-sedan'],['sport-sedan','family-suv'],['family-suv','sport-sedan']]) {
    const f = fixture('?cars=city-sedan,sport-sedan,family-suv');
    let focused;
    f.doc.activeElement = {dataset:{removeCompare:removedId},isConnected:false};
    f.root.querySelector = selector => {
      const id = selector.match(/data-remove-compare="([^"]+)"/)?.[1];
      if (id && f.store.snapshot().compare.includes(id)) return {focus(){focused=id;}};
      if (selector === '[data-remove-compare]') return {focus(){focused=f.store.snapshot().compare[0];}};
      return null;
    };
    f.click({removeCompare:removedId});
    assert.equal(focused,expected);
  }
  const f = fixture('?cars=city-sedan');
  let focused = false;
  f.doc.activeElement = {dataset:{removeCompare:'city-sedan'},isConnected:false};
  f.root.querySelector = selector => selector === '[data-compare-select]' ? {focus(){focused=true;}} : null;
  f.click({removeCompare:'city-sedan'});
  assert.equal(focused,true);
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
