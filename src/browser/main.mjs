import {createPageStore} from './store.mjs';
import {mountDialog} from './dialog.mjs';
import {mountHome} from './home.mjs';
import {mountInventory} from './inventory.mjs';
import {mountVehicle} from './vehicle.mjs';
import {mountMotion} from './motion.mjs';
import {mountSaved} from './saved.mjs';
import {mountCompare} from './compare.mjs';
import {mountForms} from './forms.mjs';

// This entry point is browser-only. Pure tests import individual controllers.
const doc=document;
const store=createPageStore(doc);
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
const controllers={home:mountHome,inventory:mountInventory,vehicle:mountVehicle,compare:mountCompare};
controllers[doc.body.dataset.controller]?.(doc,store);
mountForms(doc,store);
mountSaved(doc,store);
mountMotion(doc);
