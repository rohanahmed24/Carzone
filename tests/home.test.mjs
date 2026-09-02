import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHome} from '../src/pages/home.mjs';
import {renderShell} from '../src/ui/shell.mjs';
import {escapeHtml} from '../src/ui/escape.mjs';
import {formatPrice,formatKm} from '../src/ui/format.mjs';
import {mountDialog} from '../src/browser/dialog.mjs';
import {mountHome} from '../src/browser/home.mjs';
import {renderPages} from '../src/pages/registry.mjs';
import {mountMotion} from '../src/browser/motion.mjs';

test('final registry has exactly fourteen distinct, fully described routes and real style examples', () => {
  const pages = renderPages();
  assert.deepEqual([...pages.keys()].sort(), ['index.html','latest-cars.html','popular-cars.html','upcoming-cars.html','car-details.html','used-car-details.html','car-specification.html','car-price.html','car-review.html','compare-car.html','sell-your-car.html','write-review.html','car-valuation.html','style-guide.html'].sort());
  assert.equal(new Set([...pages.values()].map(page => page.title)).size,14);
  assert.equal(new Set([...pages.values()].map(page => page.description)).size,14);
  for (const page of pages.values()) {
    assert.ok(page.title.trim() && page.description.trim());
    assert.equal((page.body.match(/<h1[ >]/g) || []).length,1);
  }
  const guide = pages.get('style-guide.html').body;
  for (const pattern of [/<button[^>]*disabled/, /<input/, /vehicle-row/, /form-privacy/, /compare-empty/, /aria-invalid="true"/, /comparison-table/, /#d81416/, /#111214/, /#ffffff/, /Manrope/, /Barlow Condensed/]) assert.match(guide,pattern);
  assert.doesNotMatch(guide,/data-save=|data-compare=|data-remove-compare=|data-compare-add|href="#"/);
  for (const control of guide.matchAll(/<(?:button|input|select)\b[^>]*>/g)) assert.match(control[0],/\sdisabled(?:\s|>)/);
  assert.match(renderShell(pages.get('index.html')),/href="car-valuation.html"/);
  assert.match(renderShell(pages.get('index.html')),/href="style-guide.html"/);
});

test('hero motion is optional and respects reduced motion', () => {
  let animated = 0;
  const doc = {defaultView:{matchMedia:()=>({matches:true})},querySelector:()=>({animate(){animated++;}})};
  mountMotion(doc);
  assert.equal(animated,0);
  doc.defaultView.matchMedia = () => ({matches:false});
  mountMotion(doc);
  assert.equal(animated,1);
  doc.defaultView.matchMedia = undefined;
  assert.doesNotThrow(() => mountMotion(doc));
  assert.equal(animated,1);
});
test('home has real content, local assets and a disabled no-JS finder', () => {
  const html = renderShell(renderHome());
  assert.match(html,/Find your next great drive\./);
  assert.match(html,/<html lang="en"/);
  assert.match(html,/id="finder"/);
  assert.match(html,/<fieldset disabled/);
  assert.match(html,/Demo portfolio/);
  assert.doesNotMatch(html,/webflow\.js|jquery|WebFont\.load|href="#"|style="opacity:\s*0/);
  assert.ok(html.indexOf('City sedan') < html.indexOf('Sport sedan'));
  assert.match(html,/Family SUV/);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.equal((html.match(/fetchpriority="high"/g)||[]).length,1);
  assert.match(html,/hero-1920.webp 1672w/);
  assert.match(html,/width="1672" height="941"/);
  assert.match(html,/src="\/assets\/brand\/carzone-logo.png"/);
  assert.match(html,/type="module" src="\/assets\/browser\/main.mjs"/);
  assert.match(html,/See all twelve/);
  assert.match(html,/Look closer\./);
  assert.match(html,/A short path\. Local only\./);
  assert.match(html,/A useful first trio/);
  assert.match(html,/Try the other routes\./);
  assert.match(html,/href="latest-cars.html"/);
  assert.match(html,/href="popular-cars.html"/);
  assert.match(html,/href="upcoming-cars.html"/);
  assert.match(html,/href="sell-your-car.html"/);
  assert.match(html,/href="car-valuation.html"/);
  assert.match(html,/href="latest-cars.html\?view=all"/);
  assert.match(html,/Not live stock/);
  assert.match(html,/No price estimate or dealer offer is generated/);
});
test('shared formatting escapes data and preserves missing values', () => {
  assert.equal(escapeHtml('<a "x">&\''),'&lt;a &quot;x&quot;&gt;&amp;&#39;');
  assert.equal(formatKm(null),'Not provided');
  assert.equal(formatKm(42000),'42,000 km');
  assert.equal(formatPrice({priceUsd:null,availability:'upcoming'}),'Price not announced');
  assert.equal(formatPrice({priceUsd:null,availability:'used'}),'Not provided');
});
test('dialog close and native Escape close restore the supplied opener',()=>{
  const dialog=new EventTarget();
  const closeButton=new EventTarget();
  let focusCount=0;
  dialog.querySelectorAll=()=>[closeButton];
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new Event('close'));};
  const controller=mountDialog(dialog,{isConnected:true,focus(){focusCount++;}});
  controller.open();assert.equal(dialog.open,true);
  closeButton.dispatchEvent(new Event('click'));assert.equal(dialog.open,false);assert.equal(focusCount,1);
  controller.open();dialog.close();assert.equal(focusCount,2);
});
test('finder binds blockers and click before enabling and uses safe serialization',()=>{
  const form=new EventTarget();const button=new EventTarget();let enabled=false;let navigated='';
  const fieldset={set disabled(value){assert.equal(value,false);const event=new Event('submit',{cancelable:true});form.dispatchEvent(event);assert.equal(event.defaultPrevented,true);enabled=true;}};
  form.querySelector=selector=>selector==='fieldset'?fieldset:button;
  const doc={querySelector:()=>form,defaultView:{FormData:class extends URLSearchParams{constructor(){super('condition=used&budget=25000&body=sedan');}},location:{assign(value){navigated=value;}}}};
  mountHome(doc);assert.equal(enabled,true);button.dispatchEvent(new Event('click'));
  const url=new URL(navigated,'https://carzone.invalid/');
  assert.equal(url.pathname,'/latest-cars.html');assert.equal(url.searchParams.get('view'),'all');assert.equal(url.searchParams.get('condition'),'used');assert.equal(url.searchParams.get('budget'),'25000');
});
test('dialog explicitly closes on scoped Escape keydown and native cancel',()=>{
  const dialog=new EventTarget();let focusCount=0;
  dialog.querySelectorAll=()=>[];
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new Event('close'));};
  const controller=mountDialog(dialog,{isConnected:true,focus(){focusCount++;}});
  controller.open();
  const escape=new Event('keydown',{cancelable:true});Object.defineProperty(escape,'key',{value:'Escape'});
  dialog.dispatchEvent(escape);assert.equal(dialog.open,false);assert.equal(escape.defaultPrevented,true);assert.equal(focusCount,1);
  controller.open();const cancel=new Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);
  assert.equal(dialog.open,false);assert.equal(cancel.defaultPrevented,true);assert.equal(focusCount,2);
});
