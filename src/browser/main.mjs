import {vehicles} from '../domain/catalogue.mjs';
import {createStore} from '../domain/store.mjs';
import {mountDialog} from './dialog.mjs';
import {mountHome} from './home.mjs';
import {mountMotion} from './motion.mjs';

// This entry point is browser-only. Pure tests import individual controllers.
const doc=document;
const onNotice=text=>{doc.querySelector('[data-status]').textContent=text;};
let storage=null;
try { storage=doc.defaultView.localStorage; } catch { /* Store announces temporary mode. */ }
const store=createStore({validIds:new Set(vehicles.map(v=>v.id)),storage,onNotice});
const menuButton=doc.querySelector('[data-open-menu]');
const menu=doc.querySelector('#mobile-menu');
if(menuButton && menu && typeof menu.showModal==='function') {
  const controller=mountDialog(menu,menuButton);
  menuButton.addEventListener('click',()=>controller.open());
  menuButton.disabled=false;
  menuButton.hidden=false;
  doc.body.classList.add('menu-enhanced');
}
// Shared selection controls stay disabled until their selection controller is mounted.
const controllers={home:mountHome};
controllers[doc.body.dataset.controller]?.(doc,store);
mountMotion(doc);
