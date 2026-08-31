# Carzone Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize all fourteen Carzone routes into one responsive, accessible automotive portfolio demo with a working discover/filter/save/compare/detail/local-preview journey.

**Architecture:** Retain static multi-page delivery. A small Node build renders shared templates and copies only approved assets and focused native ES modules into `dist/`; the historical Webflow export remains unchanged outside that artifact. Catalogue, URL, shortlist, comparison, and form rules are pure modules tested separately from browser behavior.

**Tech Stack:** Node 24.x, native JavaScript ES modules, semantic HTML, CSS, `node:test`, Sharp 0.35.4, locally bundled Barlow Condensed 5.3.0 / Manrope 5.3.0, and Lucide Static 1.38.0. No frontend framework, backend, analytics, or external runtime services.

**Spec:** [Approved design specification](../specs/2026-08-31-carzone-modernization-design.md). Read it together with this plan. Approved 2026-08-31; baseline source commit `cc63d101e382666f47f85d2f645da41e1d57ee0c`; design commit `2a01a25`.

## Global Constraints

- This is an English-language automotive portfolio demo, not a real dealership or live marketplace.
- Preserve the recognizable CARZONE wordmark and red accent `#d81416`.
- Use graphite `#111214` for the hero and restrained dark bands; use true white `#ffffff` for browsing and reading.
- Body and form text start at 16px; labels must remain readable.
- All existing `.html` entry points remain directly accessible.
- Initial homepage state has no pre-saved or pre-compared cars.
- Missing values display Not provided, not zero. Currency is USD throughout and distance units are kilometres.
- Upcoming models use Price not announced and Launch timing unconfirmed.
- Save is a device-local shortlist with no three-car limit; compare is a separate ordered selection of up to three IDs.
- Only vehicle IDs, compare IDs, and non-sensitive display preferences may persist locally.
- Enquiry, review, and seller content are not persisted.
- The completion copy is **Demo preview only — nothing was sent.**
- Closing, resetting, or reloading clears entered personal/free-text content.
- No production push or deployment without a separate request.
- Guided finder, accounts, payments, financing, live valuations, real submissions, verified reviews, and 360-degree viewing remain outside scope.

---

## Execution boundary and evidence

Work only inside the Carzone repository, not the parent Portfolio Projects repository or sibling sites. Begin execution by reading the required execution/worktree skills and checking Git status. Preserve pre-existing edits. Use a `codex/` branch; do not change the user's global Git identity. The current branch is `codex/carzone-modernization`. If creating an isolated execution worktree, include the committed design and this plan in its starting state.

Only `dist/` is the new application. Root-level legacy HTML, `css/`, `js/`, and original images stay as historical inputs; do not preview or deploy the repository root as the modernized site. The first build contains the completed homepage; add meaningful routes as their slices land. Task 12 forbids a completion claim until all fourteen routes exist. No empty route stubs or homepage aliases.

Node is already 24.19.0 locally. Package versions above were checked using `npm view` on 2026-08-31; pin them and commit the resulting lockfile during execution. Built-in tests require no test framework. See [Node 24 test runner](https://nodejs.org/docs/latest-v24.x/api/test.html), [Fontsource local installation](https://fontsource.org/docs/getting-started/install), and [Lucide static icons](https://lucide.dev/guide/static) for the APIs used here.

The current concept PNG is 918 × 1714, not a 1440px desktop screenshot. Task 1 supplies readable route-family references and records their actual dimensions. Do not stretch that PNG into a hero. The earlier browser stylesheet-loading problem is unresolved; the first new preview must verify computed styles and fonts before trusting screenshots.

Use Product Design for references/fidelity and ImageGen for missing creative imagery; read their current skill instructions at execution. Use the selected Codex in-app browser through its skill for browser work. Do not switch to standalone Playwright or another browser without permission. No Sites starter or framework migration is needed for this existing project.

## File and responsibility map

Paths below are repository-relative. Files marked new do not exist at plan time.

| Files | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `.gitignore` | New scripts, pinned build-only dependencies, ignored generated artifacts |
| `assets/manifest.json`, `assets/provenance.md`, `assets/source/hero.png`, `assets/source/family-suv.png`, `assets/source/touring-wagon.png` | Explicit asset allowlist, source/rights notes, three generated production images |
| `docs/design/references/{home,inventory,vehicle,compare,forms}-{desktop,mobile}.png`, `docs/design/references/manifest.json` | Matching visual references, actual dimensions, states and fidelity notes |
| `scripts/prepare-assets.mjs` | Responsive image encoding, local font/icon copying and license copying |
| `src/domain/catalogue.mjs`, `src/domain/schema.mjs` | Twelve fixtures, editorial metadata, validation |
| `src/domain/routes.mjs`, `src/domain/query.mjs` | Route resolution, safe return links, filter parsing/serialization, ordering |
| `src/domain/store.mjs`, `src/domain/compare.mjs` | Guarded ID persistence, undo, URL comparison precedence, normalized rows |
| `src/domain/forms.mjs` | Local draft field allowlists, fictional defaults, validation, review formatting |
| `src/ui/escape.mjs`, `src/ui/format.mjs`, `src/ui/vehicle-row.mjs`, `src/ui/shell.mjs` | Browser-safe HTML primitives, formatting, shared shell |
| `src/ui/inventory.mjs`, `src/ui/vehicle.mjs`, `src/ui/compare.mjs`, `src/ui/saved.mjs`, `src/ui/forms.mjs` | Browser-safe family content shared by build renderers and route controllers |
| `src/pages/home.mjs`, `src/pages/inventory.mjs`, `src/pages/vehicle.mjs`, `src/pages/compare.mjs`, `src/pages/forms.mjs`, `src/pages/style-guide.mjs`, `src/pages/registry.mjs` | Build-time page-family rendering and exact route registrations |
| `src/browser/main.mjs`, `src/browser/dialog.mjs`, `src/browser/home.mjs`, `src/browser/inventory.mjs`, `src/browser/vehicle.mjs`, `src/browser/saved.mjs`, `src/browser/compare.mjs`, `src/browser/forms.mjs`, `src/browser/motion.mjs` | Progressive enhancements with one controller per family |
| `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/shell.css`, `src/styles/home.css`, `src/styles/inventory.css`, `src/styles/vehicle.css`, `src/styles/compare.css`, `src/styles/forms.css` | Shared tokens and route styles; no legacy CSS dependency |
| `scripts/build.mjs`, `scripts/server.mjs`, `scripts/dev.mjs`, `scripts/check-artifact.mjs` | Static build, buffered local server, bounded source watcher, release checks |
| `tests/assets.test.mjs`, `tests/catalogue.test.mjs`, `tests/query.test.mjs`, `tests/store.test.mjs`, `tests/compare.test.mjs`, `tests/forms.test.mjs`, `tests/home.test.mjs`, `tests/inventory.test.mjs`, `tests/vehicle.test.mjs`, `tests/compare-page.test.mjs`, `tests/form-pages.test.mjs`, `tests/artifact.test.mjs`, `tests/server.test.mjs` | Native Node test suites; browser checks separately recorded |
| `docs/qa/carzone-browser-checklist.md`, `docs/qa/carzone-results.md`, `README.md` | Repeatable journey/visual checks, measured results, truthful setup and demo boundaries |

No source module may read the DOM, storage, or filesystem during import. Browser controllers receive a `Document`; domain modules remain pure except the injected storage adapter. Build copies `src/domain`, `src/ui`, and `src/browser` to `dist/assets/domain`, `dist/assets/ui`, and `dist/assets/browser`, preserving relative imports. Build-time `src/pages` never ships as runtime code.

## Shared types and route registry

Use JSDoc for these exact structures in the owning modules. `null`, never `0` or an empty string, represents unknown numeric facts.

```js
/** @typedef {'new'|'used'|'upcoming'} Availability */
/** @typedef {'sedan'|'coupe'|'hatchback'|'suv'|'wagon'} Body */
/** @typedef {{value:number, unit:'kW'|'hp'}|null} Power */
/** @typedef {{id:string,name:string,availability:Availability,body:Body,
 * powertrain:'petrol'|'hybrid'|'electric',transmission:'automatic'|'manual',
 * priceUsd:number|null,image:string,alt:string,power:Power,seats:number|null,
 * mileageKm:number|null,condition:string|null,owners:number|null,
 * editorial:{latest:boolean,popular:boolean},review:string}} Vehicle */
/** @typedef {{view:'all'|'latest'|'popular'|'upcoming',
 * condition:'any'|'new'|'used'|'upcoming',budget:'any'|'25000'|'40000'|'60000',
 * body:'any'|Body,sort:'featured'|'price-asc'|'price-desc'|'name'}} Filters */
/** @typedef {{title:string,description:string,body:string,
 * controller:'home'|'inventory'|'vehicle'|'compare'|'forms'|'style-guide'}} Page */
/** @typedef {{saved:string[],compare:string[]}} Selection */
/** @typedef {{snapshot:()=>Selection,toggleSaved:(id:string)=>boolean,
 * addCompare:(id:string)=>boolean,removeSaved:(id:string)=>(()=>void),
 * removeCompare:(id:string)=>(()=>void),replaceCompare:(ids:string[])=>void,
 * subscribe:(fn:(selection:Selection)=>void)=>(()=>void)}} Store */
/** @typedef {'enquiry'|'seller'|'review'|'valuation'} FormKind */
```

Route defaults and content are fixed:

| Route | Family / bare-URL fixture or view |
| --- | --- |
| `index.html` | home |
| `latest-cars.html` | inventory / latest |
| `popular-cars.html` | inventory / popular |
| `upcoming-cars.html` | inventory / upcoming |
| `car-details.html` | vehicle detail / touring-coupe |
| `used-car-details.html` | vehicle detail / city-sedan |
| `car-specification.html` | vehicle specifications / concept-fastback |
| `car-price.html` | vehicle price / city-sedan |
| `car-review.html` | vehicle sample review / city-sedan |
| `compare-car.html` | compare / empty build-time state |
| `sell-your-car.html` | forms / seller |
| `write-review.html` | forms / review, city-sedan context |
| `car-valuation.html` | forms / valuation |
| `style-guide.html` | live design-system examples |

## Task 1: Produce inspectable visual and production-asset inputs

**Files:** Create `assets/manifest.json`, `assets/provenance.md`, the three `assets/source/*.png` files, the ten `docs/design/references/*.png` files listed above, `docs/design/references/manifest.json`, `tests/assets.test.mjs`, `scripts/prepare-assets.mjs`, `package.json`, `package-lock.json`, `.gitignore`.

**Interfaces:** Consumes the approved spec, `docs/design/carzone-refined-direction.png`, and the original `images/` files. Produces `prepareAssets(outDir:string):Promise<void>` and a manifest `{images:Array<{id,source,alt,widths:number[],role:'hero'|'vehicle'|'brand',provenance:string}>}`. Encoded images live at `/assets/media/<id>-<width>.webp`; fonts at `/assets/fonts/`; icons at `/assets/icons/`.

- [ ] Inspect the consolidated reference and these ten unique subjects: `images/pic1.jpg`, `pic2.jpg`, `pic3.jpg`, `pic4.jpg`, `pic5.jpg`, `pic6.jpg`, `pic7.jpg`, `pic8.jpg`, `car2.png`, `car3.png`. Confirm exact filenames with `rg --files images`. `thum1`, `thum3`, `pic2-2`, and `thum2` are alternate views, not new vehicles. Exclude unrelated portrait/garage logos and person-heavy marketing images.
- [ ] Generate the homepage desktop/mobile references with this direction, attaching the consolidated image: “Extend the approved Carzone design, retaining graphite #111214, white #ffffff, red #d81416, Barlow Condensed headings and Manrope controls. Desktop logical viewport 1440px, mobile 390px. Copy: Find your next great drive.; Explore cars; Compare cars; Find what fits.; Cars to explore. Blue City sedan $22,500 precedes red Sport sedan $28,900 in low-to-high order. Empty Save/Compare. No invented metrics, finder questionnaire, finance, contact details or badges. Show legible spacing and exact interaction labels.” Save separate images and record actual native dimensions, logical target and state; do not claim exact pixel fidelity if dimensions differ.
- [ ] Generate inventory desktop/mobile references attached to that system: open image-led result rows, applied filter chips, results count, editorial label, sort, save and compare controls. Mobile includes an explicitly labeled filter-drawer draft/Apply state. Show readable zero-results and clear-filters treatment in an accompanying reference note.
- [ ] Generate vehicle desktop/mobile references: one honest single-view image, sample facts, used-specific fields, tab links to existing specification/price/review filenames, prominent save/compare and local enquiry preview. Record the upcoming variant in the notes: no enquiry, unknown price, unconfirmed launch.
- [ ] Generate compare desktop/mobile references: three selected vehicles, removable columns, separate saved drawer entry, differences-only switch, sticky attribute column inside a horizontal table scroller, empty/one-car notes. Do not silently omit the third car on mobile.
- [ ] Generate forms desktop/mobile references: fictional defaults, selected-car context, field error, review/edit step and exact unsent confirmation. Seller, review and valuation extend this same form system; valuation shows factors and a summary, never a numeric price estimate. Inspect each image for readable labels and record any generator deviation in the manifest.
- [ ] Generate three separate production assets with ImageGen. Hero: “cinematic unbranded graphite performance coupe, three-quarter front, dark neutral studio, no people/text/logos, car occupying the right two thirds, left third dark negative space for white copy, 16:9, realistic editorial automotive photography, restrained red reflected accent not a red wash.” Family SUV: “unbranded dark green family SUV, single three-quarter front view, neutral pale studio, no text/logos/people, consistent 16:10 catalogue photography.” Touring wagon: same treatment with a silver long-roof touring wagon. Save originals non-destructively, inspect them, and record generated provenance. Do not relabel the coupe hero as a particular catalogue model.
- [ ] Write the asset contract test before the pipeline:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
test('production manifest identifies every subject and its provenance', async () => {
  const m = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  assert.equal(new Set(m.images.map(x => x.id)).size, m.images.length);
  assert.equal(m.images.filter(x => x.role === 'vehicle').length, 12);
  assert.equal(m.images.filter(x => x.role === 'hero').length, 1);
  for (const x of m.images) {
    assert.ok(x.alt.length > 12 && x.provenance.length > 10);
    assert.ok(x.widths.every(w => Number.isInteger(w) && w > 0));
    await access(x.source);
  }
});
```

- [ ] Run `node --test tests/assets.test.mjs`; expect failure until the manifest exists and all thirteen creative assets resolve.
- [ ] Add this package definition and install with `npm install`; create `.gitignore` entries for `node_modules/`, `dist/`, `.worktrees/`, `.tmp/` and `.DS_Store`. Installation is an execution action, not part of writing this plan.

```json
{
  "name": "carzone-modernized", "version": "1.0.0", "private": true,
  "type": "module", "engines": {"node": ">=24 <25"},
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "build": "node scripts/build.mjs",
    "dev": "node scripts/dev.mjs",
    "preview": "node scripts/server.mjs",
    "check": "npm test && npm run build && node scripts/check-artifact.mjs"
  },
  "devDependencies": {
    "@fontsource/barlow-condensed": "5.3.0",
    "@fontsource/manrope": "5.3.0",
    "lucide-static": "1.38.0",
    "sharp": "0.35.4"
  }
}
```

- [ ] Implement image encoding using the loop below inside `prepareAssets`. The repository manifest, not directory recursion, selects inputs. Use widths `[640,960,1440,1920]` for hero and `[360,720]` for vehicles; never upscale. Inspect the source logo and copy the matching CARZONE asset unchanged. Copy only Manrope Latin 400/500/600/700 and Barlow Condensed Latin 600/700 WOFF2 files from the installed package, their licenses, and actual Lucide `heart`, `plus`, `minus`, `x`, `menu`, `arrow-right`, `arrow-left`, `sliders-horizontal`, `check`, `chevron-down` SVG files and license. Verify exact installed paths before copying.

```js
import sharp from 'sharp';
import {mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
export async function prepareAssets(outDir) {
  const m = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  const media = path.join(outDir, 'assets', 'media');
  await mkdir(media, {recursive:true});
  for (const item of m.images.filter(x => x.role !== 'brand')) {
    for (const width of item.widths) {
      await sharp(item.source).resize({width, withoutEnlargement:true})
        .webp({quality:82}).toFile(path.join(media, `${item.id}-${width}.webp`));
    }
  }
}
```

The loop is an encoding operation, not permission for creative editing. Preserve source aspect ratios and transparency; art-directed replacements use ImageGen. Add explicit `copyFile` entries for the verified font/icon/brand/license paths to the same function.

- [ ] Run `node --test tests/assets.test.mjs`; expect pass. Inspect encoded hero and both generated vehicle images, ensuring no stretching, wrong subjects, synthetic text or visible crop damage. Record unknown original-image rights honestly in `assets/provenance.md`; do not claim commercial clearance.
- [ ] Commit only Task 1's listed files with message `design: prepare Carzone references and local assets`.

## Task 2: Establish the validated illustrative catalogue

**Files:** Create `src/domain/catalogue.mjs`, `src/domain/schema.mjs`, `tests/catalogue.test.mjs`.

**Interfaces:** Produces `vehicles:readonly Vehicle[]`, `getVehicle(id:string):Vehicle|null`, `validateCatalogue(records:Vehicle[]):string[]`. Image IDs match Task 1. No DOM or storage.

- [ ] Write this failing test:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicles,getVehicle} from '../src/domain/catalogue.mjs';
import {validateCatalogue} from '../src/domain/schema.mjs';
test('twelve stable, diverse and explicitly sample vehicles', () => {
  assert.equal(vehicles.length, 12);
  assert.deepEqual(validateCatalogue(vehicles), []);
  assert.equal(getVehicle('city-sedan').priceUsd, 22500);
  assert.match(getVehicle('city-sedan').alt, /blue/i);
  assert.equal(getVehicle('sport-sedan').priceUsd, 28900);
  assert.match(getVehicle('sport-sedan').alt, /red/i);
  assert.equal(getVehicle('does-not-exist'), null);
  assert.ok(validateCatalogue([...vehicles, vehicles[0]]).length > 0);
  assert.ok(validateCatalogue([{...vehicles[0],priceUsd:-1}]).length > 0);
});
```

- [ ] Run `node --test tests/catalogue.test.mjs`; expect module-not-found failure.
- [ ] Create the following exact fixture matrix. Prices/specifications are fabricated design fixtures, not assertions about pictured manufacturers. All review copy begins “Sample editorial review.” Every used vehicle has sample condition and owners; upcoming price/mileage/condition/owners are null.

| ID / name | Availability / body | USD | Source image ID | Powertrain / transmission | kW / seats / km / owners | Latest / Popular |
| --- | --- | ---: | --- | --- | --- | --- |
| city-sedan / City sedan | used / sedan | 22500 | city-sedan (pic1) | petrol / automatic | 110 / 5 / 42000 / 1 | true / true |
| sport-sedan / Sport sedan | used / sedan | 28900 | sport-sedan (car2) | petrol / automatic | 145 / 5 / 28000 / 1 | true / true |
| touring-coupe / Touring coupe | new / coupe | 58900 | touring-coupe (pic2) | petrol / automatic | 220 / 4 / null / null | true / false |
| daily-hatch / Daily hatch | used / hatchback | 19400 | daily-hatch (pic3) | petrol / manual | 95 / 5 / 51000 / 2 | false / true |
| concept-coupe / Concept coupe | upcoming / coupe | null | concept-coupe (pic4) | electric / automatic | null / 2 / null / null | false / false |
| concept-fastback / Concept fastback | upcoming / sedan | null | concept-fastback (pic5) | electric / automatic | null / null / null / null | true / false |
| grand-coupe / Grand coupe | used / coupe | 46500 | grand-coupe (pic6) | petrol / automatic | 240 / 2 / 19000 / 1 | false / true |
| track-coupe / Track coupe | new / coupe | 98500 | track-coupe (pic7 illustration) | petrol / manual | 360 / 2 / null / null | false / false |
| redline-coupe / Redline coupe | new / coupe | 64200 | redline-coupe (pic8) | petrol / automatic | 270 / 2 / null / null | true / true |
| performance-coupe / Performance coupe | used / coupe | 52800 | performance-coupe (car3 rear view) | petrol / automatic | 250 / 2 / 24000 / 2 | false / false |
| family-suv / Family SUV | new / suv | 42800 | family-suv (generated) | hybrid / automatic | 160 / 5 / null / null | true / true |
| touring-wagon / Touring wagon | used / wagon | 31900 | touring-wagon (generated) | hybrid / automatic | 140 / 5 / 36000 / 1 | false / true |

- [ ] Use this construction and validator core; add enum, required-string, image/alt, finite-number, nullable-field and used/upcoming checks with returned error strings, not thrown errors for user-controlled IDs.

```js
export function validateCatalogue(records) {
  const errors = [], seen = new Set();
  for (const v of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.id) || seen.has(v.id)) errors.push('Invalid or duplicate id');
    seen.add(v.id);
    for (const key of ['priceUsd','seats','mileageKm','owners']) {
      if (v[key] !== null && (!Number.isFinite(v[key]) || v[key] < 0)) errors.push(`${v.id}: invalid ${key}`);
    }
    if (v.availability === 'upcoming' && v.priceUsd !== null) errors.push(`${v.id}: upcoming price must be unknown`);
    if (v.availability === 'used' && (v.mileageKm === null || v.owners === null || !v.condition)) errors.push(`${v.id}: missing sample used fields`);
  }
  return errors;
}
// In catalogue.mjs, after constructing records from the matrix:
export const vehicles = Object.freeze(records.map(record => Object.freeze(record)));
export const getVehicle = id => vehicles.find(vehicle => vehicle.id === id) ?? null;
```

For used records set condition to `Illustrative condition — inspection not verified`; for all others null. `image` is `/assets/media/<id>-720.webp`. Set specific truthful alt text from the inspected asset (including illustration/rear-view where applicable). Add two short labelled sample strengths and one sample trade-off to each `review` string without adding verified safety/history claims.

- [ ] Extend the test with invalid enum, missing alt, non-finite power, upcoming numeric price and missing used fields; assert each returns at least one error. Run the catalogue test until all pass.
- [ ] Commit the three files with message `feat: add validated illustrative vehicle catalogue`.

## Task 3: Make inventory and detail URLs deterministic

**Files:** Create `src/domain/routes.mjs`, `src/domain/query.mjs`, `tests/query.test.mjs`.

**Interfaces:** Consumes `vehicles`, `getVehicle`. Produces `parseFilters(params:URLSearchParams,route:string):Filters`, `serializeFilters(filters:Filters):string`, `selectVehicles(records:Vehicle[],filters:Filters):Vehicle[]`, `resolveVehicle(route:string,params:URLSearchParams):Vehicle|null`, `vehicleHref(vehicle:Vehicle,returnTo?:string):string`, `safeReturn(value:string|null):string`. `return` stores one same-site inventory URL; no arbitrary redirect. Serializers return no leading `?`.

- [ ] Write these failing contracts:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicles,getVehicle} from '../src/domain/catalogue.mjs';
import {parseFilters,serializeFilters,selectVehicles} from '../src/domain/query.mjs';
import {resolveVehicle,vehicleHref,safeReturn} from '../src/domain/routes.mjs';
test('route default only applies when view is absent', () => {
  assert.equal(parseFilters(new URLSearchParams(), 'popular-cars.html').view, 'popular');
  assert.equal(parseFilters(new URLSearchParams('view=all'), 'popular-cars.html').view, 'all');
  assert.equal(parseFilters(new URLSearchParams('view=bad'), 'popular-cars.html').view, 'all');
});
test('filter round-trip, ordering, budget and vehicle identity', () => {
  const f = parseFilters(new URLSearchParams('view=all&condition=used&sort=price-asc'), 'latest-cars.html');
  assert.deepEqual(parseFilters(new URLSearchParams(serializeFilters(f)), 'latest-cars.html'), f);
  const ids = selectVehicles(vehicles,f).map(v => v.id);
  assert.ok(ids.indexOf('city-sedan') < ids.indexOf('sport-sedan'));
  assert.equal(selectVehicles(vehicles,{...f,view:'upcoming',condition:'any',budget:'60000'}).length, 0);
  assert.equal(resolveVehicle('car-details.html',new URLSearchParams('car=city-sedan')).id,'city-sedan');
  assert.equal(resolveVehicle('car-details.html',new URLSearchParams('car=missing')),null);
  assert.equal(resolveVehicle('car-details.html',new URLSearchParams('car=')),null);
  assert.match(vehicleHref(getVehicle('concept-coupe')), /^car-specification\.html\?/);
  assert.equal(safeReturn('https://evil.example/'), 'latest-cars.html?view=all');
  assert.equal(safeReturn('//evil.example/'), 'latest-cars.html?view=all');
});
```

- [ ] Run `node --test tests/query.test.mjs`; expect import failure.
- [ ] Implement allowlists and serialization exactly:

```js
export function parseFilters(params, route) {
  const defaults = {'latest-cars.html':'latest','popular-cars.html':'popular','upcoming-cars.html':'upcoming'};
  const pick = (key, choices, fallback) => choices.includes(params.get(key)) ? params.get(key) : fallback;
  return {
    view: params.has('view') ? pick('view',['all','latest','popular','upcoming'],'all') : (defaults[route] ?? 'all'),
    condition:pick('condition',['any','new','used','upcoming'],'any'),
    budget:pick('budget',['any','25000','40000','60000'],'any'),
    body:pick('body',['any','sedan','coupe','hatchback','suv','wagon'],'any'),
    sort:pick('sort',['featured','price-asc','price-desc','name'],'featured')
  };
}
export function serializeFilters(f) {
  return new URLSearchParams(Object.entries(f)).toString();
}
export function selectVehicles(records, f) {
  const rows = records.filter(v =>
    (f.view === 'all' || (f.view === 'upcoming' ? v.availability === 'upcoming' : v.editorial[f.view])) &&
    (f.condition === 'any' || v.availability === f.condition) &&
    (f.body === 'any' || v.body === f.body) &&
    (f.budget === 'any' || (v.priceUsd !== null && v.priceUsd <= Number(f.budget))));
  return rows.sort((a,b) => {
    if (f.sort === 'name') return a.name.localeCompare(b.name);
    if (f.sort === 'featured') return 0;
    if (a.priceUsd === null || b.priceUsd === null) return a.priceUsd === b.priceUsd ? 0 : a.priceUsd === null ? 1 : -1;
    return (f.sort === 'price-desc' ? -1 : 1) * (a.priceUsd-b.priceUsd) || a.id.localeCompare(b.id);
  });
}
```

- [ ] Implement route mapping using the bare fixtures in the registry table. Explicit `car`, including empty, always calls `getVehicle` directly. `safeReturn` parses against `https://carzone.invalid/`, requires that origin and one of the three inventory paths, and returns `pathname.slice(1)+'?'+serializeFilters(parseFilters(...))`; otherwise returns `latest-cars.html?view=all`. Generated links use `URLSearchParams({car:v.id,return:safeReturn(returnTo)})`, availability-to-filename mapping, and no interpolated raw query HTML.

```js
export function resolveVehicle(route, params) {
  if (params.has('car')) return getVehicle(params.get('car'));
  const defaults = {'car-details.html':'touring-coupe','used-car-details.html':'city-sedan',
    'car-specification.html':'concept-fastback','car-price.html':'city-sedan',
    'car-review.html':'city-sedan','write-review.html':'city-sedan'};
  return getVehicle(defaults[route] ?? '');
}
export function vehicleHref(v, returnTo) {
  const route = {new:'car-details.html',used:'used-car-details.html',upcoming:'car-specification.html'}[v.availability];
  return `${route}?${new URLSearchParams({car:v.id,return:safeReturn(returnTo)})}`;
}
```

- [ ] Add query tests for encoded markup in all filter values, null prices last in either price sort, every body/condition enum, zero results, valid return round-trip and return URL traversal. Run `node --test tests/query.test.mjs`; expect all pass.
- [ ] Commit the three files with message `feat: define stable inventory and vehicle URL contracts`.

## Task 4: Separate saved state from comparison state

**Files:** Create `src/domain/store.mjs`, `src/domain/compare.mjs`, `tests/store.test.mjs`, `tests/compare.test.mjs`.

**Interfaces:** Consumes catalogue IDs and Vehicle records. Produces:

```js
// store.mjs
createStore({validIds:Set<string>,storage:Storage|null,onNotice:(text:string)=>void})
// returns {snapshot():Selection, toggleSaved(id):boolean, addCompare(id):boolean,
// removeSaved(id):()=>void, removeCompare(id):()=>void, replaceCompare(ids):void,
// subscribe(fn:(selection:Selection)=>void):()=>void}
// compare.mjs
resolveComparison(params:URLSearchParams, deviceIds:string[], validIds:Set<string>)
// => {ids:string[],notice:string|null,fromUrl:boolean}
comparisonQuery(ids:string[]):string // includes cars= even when empty
comparisonRows(records:Vehicle[],differencesOnly:boolean)
// => Array<{key:string,label:string,values:string[]}>
```

- [ ] Write store tests with `storage:null` and injected throwing storage. Save four valid IDs and assert compare remains empty; add three compare IDs and reject the fourth without replacement. Remove the second and invoke its returned undo function; assert original ordering is restored. Test corrupt JSON, stale IDs, malformed shapes, storage read/write failures and subscriber unsubscribe.

```js
test('save is unlimited; compare is ordered and capped', () => {
  const notices = [];
  const store = createStore({validIds:new Set(['a','b','c','d']),storage:null,onNotice:s=>notices.push(s)});
  for (const id of ['a','b','c','d']) store.toggleSaved(id);
  assert.deepEqual(store.snapshot(),{saved:['a','b','c','d'],compare:[]});
  for (const id of ['a','b','c']) assert.equal(store.addCompare(id),true);
  assert.equal(store.addCompare('d'),false);
  assert.deepEqual(store.snapshot().compare,['a','b','c']);
  const undo = store.removeCompare('b'); undo();
  assert.deepEqual(store.snapshot().compare,['a','b','c']);
  assert.ok(notices.some(s=>s.includes('three')));
});
```

- [ ] Run `node --test tests/store.test.mjs tests/compare.test.mjs`; expect missing-module failures. Test files import `test`, strict `assert` and the named functions above.
- [ ] Implement one storage key, `carzone.selection.v1`, with JSON `{saved,compare}` only. Validate both arrays on load; wrong top-level shapes are corrupt. Filter every ID through `validIds`, deduplicate, cap compare to three. Guard the getter for `window.localStorage` at the caller as well as every `getItem`/`setItem` inside the store. On failure or a null adapter, keep current in-memory selection and announce “Device storage unavailable; changes last for this page.” Corrupt content starts an empty in-memory selection with “Saved device data could not be read; starting a temporary selection.” Disable further persistence for that instance after a read/parse failure. Never persist forms or drafts. Each mutation copies arrays, notifies subscribers and attempts a guarded write when the adapter remains usable. `snapshot` returns copies.

```js
const clean = (ids, validIds, limit=Infinity) => [...new Set(ids.filter(id=>typeof id==='string' && validIds.has(id)))].slice(0,limit);
// Inside createStore:
const persist = () => {
  try { storage?.setItem('carzone.selection.v1', JSON.stringify(state)); }
  catch { onNotice('Device storage unavailable; changes last for this page.'); }
  for (const listener of listeners) listener({saved:[...state.saved],compare:[...state.compare]});
};
const remove = (key,id) => {
  const index = state[key].indexOf(id);
  if (index < 0) return () => {};
  state[key] = state[key].filter(x=>x!==id); persist();
  return () => {
    if (state[key].includes(id) || !validIds.has(id)) return;
    if (key === 'compare' && state.compare.length >= 3) { onNotice('Compare up to three cars.'); return; }
    state[key].splice(Math.min(index,state[key].length),0,id); persist();
  };
};
```

Define `state` as a validated Selection and `listeners` as a Set inside `createStore`. Invalid mutation IDs return false/no-op and a notice; duplicate compare adds return true without duplication. `replaceCompare` sanitizes and persists only on an explicit UI mutation. Undo never erases newer choices to force an old item back in.

- [ ] Write the URL-precedence and value-comparison tests:

```js
test('explicit shared URL never falls back or persists by itself', () => {
  const valid = new Set(['a','b','c','d']);
  assert.deepEqual(resolveComparison(new URLSearchParams('cars='),['a'],valid).ids,[]);
  const result = resolveComparison(new URLSearchParams('cars=b,b,bad,a,c,d'),['d'],valid);
  assert.deepEqual(result.ids,['b','a','c']);
  assert.equal(result.fromUrl,true); assert.ok(result.notice);
  assert.deepEqual(resolveComparison(new URLSearchParams(),['d'],valid).ids,['d']);
  assert.equal(comparisonQuery([]),'cars=');
});
test('differences normalize power and retain known versus missing', () => {
  const a = {...getVehicle('city-sedan'),power:{value:100,unit:'kW'},seats:null};
  const b = {...a,id:'other',power:{value:134.102,unit:'hp'}};
  assert.equal(comparisonRows([a,b],true).length,0);
  b.seats = 5;
  assert.deepEqual(comparisonRows([a,b],true).map(r=>r.key),['seats']);
});
```

- [ ] Implement URL parsing and rows. Use exactly these compared keys: availability, body, priceUsd, powertrain, transmission, power, seats, mileageKm, condition, owners. Normalize power to kW rounded to one decimal (`hp * 0.745699872`); USD/km already canonical. Compare normalized raw values, not names, images or formatted strings. All-null rows are equal. Label missing as Not provided except upcoming price as Price not announced. Empty input returns no rows; one vehicle returns all rows even with differences-only, with the UI explaining another car is needed.

```js
export function resolveComparison(params, deviceIds, validIds) {
  const fromUrl = params.has('cars');
  const raw = fromUrl ? (params.get('cars') ? params.get('cars').split(',') : []) : deviceIds;
  const valid = [...new Set(raw.filter(id=>validIds.has(id)))];
  const ids = valid.slice(0,3);
  const discarded = raw.some(id=>!validIds.has(id)) || valid.length > 3;
  return {ids,fromUrl,notice:discarded ? 'Some unknown or excess cars were omitted.' : null};
}
export const comparisonQuery = ids => new URLSearchParams({cars:ids.join(',')}).toString();
const normalizedPower = p => p === null ? null : Math.round(p.value*(p.unit==='hp'?0.745699872:1)*10)/10;
```

- [ ] Run both suites, plus catalogue/query tests. Assert stored JSON contains only `saved` and `compare`. Commit the four files with message `feat: add resilient shortlist and comparison state`.

## Task 5: Define form previews that cannot send or retain personal data

**Files:** Create `src/domain/forms.mjs`, `tests/forms.test.mjs`.

**Interfaces:** Produces `sampleDraft(kind:FormKind):Record<string,string>`, `validateDraft(kind,draft):Record<string,string>` (field-name errors), `reviewDraft(kind,draft):Array<{label:string,value:string}>`. These functions never access storage, URL, network or DOM. Unknown draft keys are discarded.

| Kind | Allowed fields and validation | Fictional defaults |
| --- | --- | --- |
| enquiry | name 2–80 chars, email valid simple address ≤120, message 10–1000 | Alex Example / alex@example.test / I would like to explore this sample vehicle. |
| seller | make 2–60, model 1–60, year integer 1980–2027, mileageKm integer 0–1000000, askingUsd integer 1–10000000, notes ≤1000 | Example Motors / City / 2021 / 42000 / 22500 / Fictional listing for a portfolio preview. |
| review | title 5–100, rating integer 1–5, review 20–1500, author 2–80 | A practical sample drive / 4 / This fictional review demonstrates the local preview flow. / Alex Example |
| valuation | make 2–60, model 1–60, year integer 1980–2027, mileageKm integer 0–1000000, condition one of Excellent/Good/Fair | Example Motors / City / 2021 / 42000 / Good |

- [ ] Write and run this test; expect import failure before implementation:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleDraft,validateDraft,reviewDraft} from '../src/domain/forms.mjs';
for (const kind of ['enquiry','seller','review','valuation']) {
  test(`${kind} accepts fictional defaults only through its field allowlist`, () => {
    const draft = sampleDraft(kind);
    assert.deepEqual(validateDraft(kind,draft),{});
    const rows = reviewDraft(kind,{...draft,secret:'do not retain'});
    assert.ok(rows.length > 0);
    assert.ok(!JSON.stringify(rows).includes('do not retain'));
  });
}
test('enquiry errors are field-specific and reject missing content', () => {
  const errors = validateDraft('enquiry',{name:'',email:'bad',message:'short'});
  assert.deepEqual(Object.keys(errors).sort(),['email','message','name']);
});
```

Run: `node --test tests/forms.test.mjs`.

- [ ] Define `definitions`, keyed by FormKind, containing the table's labels, defaults and field predicates. Implement these functions; `definitions` belongs to this module, not a shared mutable browser state.

```js
const textLength = (value,min,max) => value.length >= min && value.length <= max;
const integerRange = (value,min,max) => /^\d+$/.test(value) && Number(value)>=min && Number(value)<=max;
const email = value => value.length<=120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const sampleDraft = kind => Object.fromEntries(Object.entries(definitions[kind]).map(([key,field])=>[key,field.sample]));
export function validateDraft(kind,draft) {
  return Object.fromEntries(Object.entries(definitions[kind])
    .filter(([key,field])=>!field.valid(String(draft[key] ?? '').trim()))
    .map(([key,field])=>[key,field.error]));
}
export const reviewDraft = (kind,draft) => Object.entries(definitions[kind])
  .map(([key,field])=>({label:field.label,value:String(draft[key] ?? '').trim()}));
```

Error copy names the constraint (for example “Enter a name between 2 and 80 characters.”). Unknown kind throws a programming error; user input cannot choose a kind because it comes from the fixed route/controller.

- [ ] Extend tests for whitespace, non-finite/negative/fractional numeric values, every minimum/maximum length and an injected `<script>` string remaining ordinary text for the UI escaping layer. Assert valuation rows contain only the five supplied fields and no generated estimate.
- [ ] Run `node --test tests/forms.test.mjs`; expect pass. Commit with message `feat: define local-only demo form contracts`.

## Task 6: Ship the shared shell and real homepage through a safe static build

**Files:** Create `src/ui/{escape,format,vehicle-row,shell}.mjs`, `src/pages/{home,registry}.mjs`, `src/browser/{main,dialog,home,motion}.mjs`, `src/styles/{tokens,base,shell,home}.css`, `scripts/{build,server,dev}.mjs`, `tests/{home,server}.test.mjs`. Modify `scripts/prepare-assets.mjs` only for verified asset paths.

**Interfaces:** Consumes Tasks 1–4. Produces `escapeHtml(value:unknown):string`, `formatPrice(v:Vehicle):string`, `formatKm(value:number|null):string`, `vehicleRow(v:Vehicle,{returnTo?:string}={}):string`, `renderShell(page:Page):string`, `renderHome():Page`, `renderPages():Map<string,Page>`, `build(outDir?:string):Promise<void>`, `createStaticServer(root:string):http.Server`, `mountHome(doc:Document):void`, `mountDialog(dialog:HTMLDialogElement,opener:HTMLElement):{open():void,close():void}`, `mountMotion(doc:Document):void`.

All later `mount…` controllers have signature `(doc:Document,store:Store):void` unless explicitly pure/home/motion. `main.mjs` creates one Store per page, binds shared controls and calls the matching controller using `body.dataset.controller`. Its top-level DOM initialization is browser-only; never import it in pure tests. Controllers obtain route/query from `doc.defaultView.location`, not global request data.

- [ ] Write home rendering assertions and server tests before implementation:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderHome} from '../src/pages/home.mjs';
import {renderShell} from '../src/ui/shell.mjs';
test('home has real content, local assets and a disabled no-JS finder', () => {
  const html = renderShell(renderHome());
  assert.match(html,/Find your next great drive\./);
  assert.match(html,/<html lang="en"/);
  assert.match(html,/id="finder"/);
  assert.match(html,/fieldset disabled/);
  assert.match(html,/Demo portfolio/);
  assert.doesNotMatch(html,/webflow\.js|jquery|WebFont\.load|href="#"|style="opacity:\s*0/);
  assert.ok(html.indexOf('City sedan') < html.indexOf('Sport sedan'));
});
```

`tests/server.test.mjs` creates a temporary directory with `index.html`/one CSS file using Node filesystem fixtures, listens on port 0, and uses `fetch` to assert GET 200 with correct Content-Type/Length, HEAD no body, unknown `.html` 404, POST 405 and encoded traversal 403/404. Close server/remove the exact temporary directory with test cleanup.

- [ ] Run `node --test tests/home.test.mjs tests/server.test.mjs`; expect missing exports/modules.
- [ ] Implement escaping and the shared markup pattern below. Every interpolation originating from data/query/draft passes through escaping; no inline event handlers, script bodies or user-produced markup.

```js
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const formatPrice = v => v.priceUsd === null ? (v.availability==='upcoming'?'Price not announced':'Not provided') : new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v.priceUsd);
export const formatKm = value => value === null ? 'Not provided' : `${new Intl.NumberFormat('en-US').format(value)} km`;
// vehicle-row.mjs imports escaping, formatting and vehicleHref from their owning modules.
export function vehicleRow(v,{returnTo}={}) {
  return `<article class="vehicle-row" data-car="${escapeHtml(v.id)}">
    <img src="${escapeHtml(v.image)}" alt="${escapeHtml(v.alt)}" width="720" height="450" loading="lazy">
    <div><p class="eyebrow">${escapeHtml(v.availability)} · Illustrative vehicle</p>
    <h3><a href="${escapeHtml(vehicleHref(v,returnTo))}">${escapeHtml(v.name)}</a></h3>
    <p>${escapeHtml(v.body)} · ${escapeHtml(v.transmission)} · ${escapeHtml(v.powertrain)}</p>
    <p class="price">${escapeHtml(formatPrice(v))}</p></div>
    <div class="vehicle-actions"><button type="button" data-save="${escapeHtml(v.id)}" aria-pressed="false" disabled>Save ${escapeHtml(v.name)}</button>
    <button type="button" data-compare="${escapeHtml(v.id)}" disabled>Add to compare</button>
    <a href="${escapeHtml(vehicleHref(v,returnTo))}">View details</a></div></article>`;
}
```

Resolve actual width/height from asset metadata where source aspect is not 16:10; enforce a consistent rendered media box with `object-fit:contain`. Do not distort differently proportioned cutouts.

- [ ] Implement `renderShell` with one h1 supplied by body, skip link to `main`, responsive shared nav and working footer links from the route table; local font/CSS references and external `type="module" src="/assets/browser/main.mjs"`. Include a shared `<dialog id="saved-dialog">`, `<dialog id="mobile-menu">`, initially hidden compare tray and `role="status" aria-live="polite"`. No-JS navigation stays visible; enhancement alone enables the mobile toggle. Include `<noscript>` stating that representative content and links work but filtering, saving, comparing and form previews require JavaScript.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'">
```

- [ ] Implement `renderHome` with the approved exact hero/finder copy and matching Task 1 reference. Hero uses `<picture>` responsive generated assets, explicit dimensions, eager loading and `fetchpriority="high"`; no other media gets high priority. Finder is a form with `fieldset disabled`, explicit labels and preview button `type="button"`; New/Used maps to condition, budget/body to Task 3 enums. Featured rows are `[city-sedan,sport-sedan,family-suv]` and labelled “Price: low to high”. Both hero actions work; Explore uses `#finder`, Compare uses `compare-car.html`. Footer says “Demo portfolio. Vehicles, prices and specifications are illustrative. Nothing is sold or submitted here.”
- [ ] Implement homepage enhancement: attach the submit-blocker before enabling the finder, then navigate through the safe serializer only.

```js
export function mountHome(doc) {
  const form = doc.querySelector('[data-finder]');
  if (!form) return;
  form.addEventListener('submit', event => event.preventDefault());
  const fieldset = form.querySelector('fieldset');
  form.querySelector('[data-find]').addEventListener('click', () => {
    const f = parseFilters(new URLSearchParams(new FormData(form)), 'latest-cars.html');
    f.view = 'all';
    doc.defaultView.location.assign(`latest-cars.html?${serializeFilters(f)}`);
  });
  fieldset.disabled = false;
}
```

- [ ] Implement base tokens/layout before route decoration. Font faces load the local installed weights. Use the actual Lucide SVG files as CSS masks, not handcrafted drawings. Native dialog `showModal()` provides focus containment; close/Escape restores opener focus. Add visible focus ring, errors/status styles and 44px minimum control targets.

```css
:root{--red:#d81416;--graphite:#111214;--paper:#fff;--ink:#111214;--muted:#565b61;--line:#d9dde1;--gutter:clamp(20px,4.45vw,64px);--content:1312px;--radius:6px}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font:400 16px/1.6 Manrope,Arial,sans-serif}
h1,h2,h3{font-family:'Barlow Condensed','Arial Narrow',sans-serif;line-height:1.02;letter-spacing:-.015em}
.container{width:min(calc(100% - 2*var(--gutter)),var(--content));margin-inline:auto}
button,input,select,textarea{font:inherit}button,a.button,input,select{min-height:44px}
:focus-visible{outline:3px solid #1769d2;outline-offset:3px}img{max-width:100%;height:auto}
[hidden]{display:none!important}.vehicle-row{display:grid;grid-template-columns:minmax(180px,30%) 1fr auto;gap:24px;padding-block:28px;border-bottom:1px solid var(--line)}
@media(max-width:700px){.vehicle-row{grid-template-columns:1fr}.vehicle-actions{display:flex;flex-wrap:wrap;gap:12px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}}
```

- [ ] Implement the static build. Reject catalogue validation errors, call `prepareAssets`, render `registry` entries through `renderShell`, write exact filenames, copy only the three runtime module directories and styles. Permit an explicit temporary `outDir` for tests. Never recursively delete the repo or a computed unchecked directory; normal builds overwrite generated files and the final artifact checker rejects unexpected files. Do not copy legacy Webflow HTML/CSS/JS, docs, `.git`, `node_modules` or source PNGs into `dist`.

```js
export async function build(outDir = path.resolve('dist')) {
  const errors = validateCatalogue(vehicles);
  if (errors.length) throw new Error(errors.join('\n'));
  await mkdir(outDir,{recursive:true});
  await prepareAssets(outDir);
  for (const [filename,page] of renderPages()) {
    if (!/^[a-z-]+\.html$/.test(filename)) throw new Error('Unsafe output filename');
    await writeFile(path.join(outDir,filename),renderShell(page),'utf8');
  }
  for (const dir of ['domain','ui','browser']) await cp(path.join('src',dir),path.join(outDir,'assets',dir),{recursive:true});
  await cp('src/styles',path.join(outDir,'assets','styles'),{recursive:true});
}
```

Imports are Node `path`, `mkdir/writeFile/cp`, catalogue/schema, `prepareAssets`, `renderPages` and `renderShell` from the named files. CLI execution is guarded by comparing `import.meta.url` with `pathToFileURL(process.argv[1]).href`, so tests can import without running a build.

- [ ] Implement `createStaticServer` using buffered `readFile` responses. Resolve a decoded URL path beneath a validated absolute `root`; reject traversal, NUL and malformed encoding; `/` maps to index. Content types include html/css/js/mjs/svg/webp/png/woff2. Only GET/HEAD, exact404, `Content-Length`, `Cache-Control:no-store`; bind CLI to `127.0.0.1:4176`. `dev.mjs` first builds, starts that server, then watches only `src/` and `assets/` with debounced rebuilds and a queued rerun during an active build. No HMR/websocket or browser auto-opening is necessary; document manual refresh.
- [ ] Run the home/server tests and `npm run build`. Open the first preview in the selected browser; verify `getComputedStyle` reports Manrope/body16px and graphite hero, every CSS request succeeds, `document.fonts.check` succeeds and no legacy network calls occur. Match home screenshots to both references before proceeding. Record any browser limitation as unresolved, not pass.
- [ ] Commit Task 6 files with message `feat: build the shared Carzone shell and cinematic homepage`.

## Task 7: Deliver the three inventory routes and reversible filtering

**Files:** Create `src/pages/inventory.mjs`, `src/ui/inventory.mjs`, `src/browser/inventory.mjs`, `src/styles/inventory.css`, `tests/inventory.test.mjs`. Modify `src/pages/registry.mjs`, `src/browser/main.mjs`.

**Interfaces:** Consumes `Filters`, `parseFilters`, `serializeFilters`, `selectVehicles`, `vehicleRow`, Store. Produces `renderInventory(route:string,filters?:Filters):Page`, `inventoryResults(filters:Filters,route:string):string`, `mountInventory(doc:Document,store:Store):void`. `inventoryResults` is browser-safe and belongs in `src/ui/inventory.mjs`; import domain helpers there. Never import `src/pages` from browser modules.

- [ ] Write the failing test and run `node --test tests/inventory.test.mjs`:

```js
test('inventory has meaningful editorial and empty states', () => {
  const popular = renderInventory('popular-cars.html');
  assert.match(popular.body,/Editorial sample selection/);
  const f = parseFilters(new URLSearchParams('view=upcoming&budget=25000'), 'upcoming-cars.html');
  const empty = inventoryResults(f,'upcoming-cars.html');
  assert.match(empty,/No cars match/);
  assert.match(empty,/Unknown prices are excluded/);
  assert.match(empty,/Clear filters/);
  assert.doesNotMatch(empty,/Reserve|Book now/);
});
```

Import the exact functions from `src/pages/inventory.mjs`, `src/ui/inventory.mjs` and `src/domain/query.mjs`, plus Node test/assert.

- [ ] Render view tabs All/Latest/Popular/Upcoming, filter labels, sort label, applied chips with remove buttons, live count and rows using the same serialized return URL. Popular is explicitly editorial. Budget help appears whenever a numeric budget is applied to upcoming candidates. Empty state offers reset to `view=all` and chip removal; unknown prices never sort as zero. Use Task 1 inventory references at desktop/mobile before building the controls.
- [ ] Bind one committed filter state and a separate mobile draft. Opening the drawer copies current controls; closing without Apply discards draft; Apply reads/validates controls, pushes one history entry and renders; desktop changes commit directly. Back/forward reads location without pushing again. Re-render only results/count/chips, leaving focused filter controls stable.

```js
let current = parseFilters(new URLSearchParams(win.location.search),route);
const render = () => {
  results.innerHTML = inventoryResults(current,route);
  syncSelection(doc,store.snapshot());
};
const commit = next => {
  current = parseFilters(new URLSearchParams(serializeFilters(next)),route);
  win.history.pushState(null,'',`${route}?${serializeFilters(current)}`);
  render();
};
win.addEventListener('popstate',()=>{
  current = parseFilters(new URLSearchParams(win.location.search),route);
  render();
  syncFilterControls(doc,current);
});
```

Here `win=doc.defaultView`, `route` is its filename, `results` is `[data-results]`. Define `syncFilterControls(doc:Document,filters:Filters):void` locally to assign matching named select/radio values; define/export `syncSelection(doc:Document,selection:Selection):void` in `src/browser/saved.mjs` in Task 9 (until that task, skip selection decoration and keep unbound save/compare controls disabled). Use event delegation from the stable document for newly rendered row controls. Removing one chip sets that field to its documented default; Clear sets all defaults with `view:'all'`.

- [ ] Add structural tests for all three headings, safe encoded return links and result order. Browser-check zero results, Apply/Cancel, Escape/focus return, every filter, sort, back/forward and details return on mobile and desktop. No desktop control should duplicate an enabled hidden mobile control with the same name.
- [ ] Run inventory/query/home tests and build. Commit with message `feat: connect inventory routes and URL-driven filtering`.

## Task 8: Render every vehicle-reading route from the same selected record

**Files:** Create `src/pages/vehicle.mjs`, `src/ui/vehicle.mjs`, `src/browser/vehicle.mjs`, `src/styles/vehicle.css`, `tests/vehicle.test.mjs`. Modify `src/pages/registry.mjs`, `src/browser/main.mjs`.

**Interfaces:** Consumes `resolveVehicle`, `safeReturn`, catalogue, formatting. Produces `renderVehicle(route:string):Page`, `vehicleContent(v:Vehicle|null,route:string,returnTo:string):string` in `src/ui/vehicle.mjs`, `mountVehicle(doc:Document,store:Store):void`. This covers five filenames: detail, used detail, specification, price and review.

- [ ] Write this failing test; run `node --test tests/vehicle.test.mjs`:

```js
test('record availability, not a mismatched filename, owns actions', () => {
  const used = vehicleContent(getVehicle('city-sedan'),'car-details.html','latest-cars.html?view=all');
  assert.match(used,/42,000 km/); assert.match(used,/22,500/);
  const upcoming = vehicleContent(getVehicle('concept-fastback'),'used-car-details.html','latest-cars.html?view=all');
  assert.match(upcoming,/Price not announced/);
  assert.match(upcoming,/Launch timing unconfirmed/);
  assert.doesNotMatch(upcoming,/data-enquiry|Reserve|Buy now/);
  assert.match(vehicleContent(null,'car-details.html','latest-cars.html?view=all'),/Vehicle not found/);
});
```

- [ ] Implement detail markup against vehicle references. Use a single honest image, no fake gallery controls. Used content includes labelled sample mileage/condition/owners. New content omits meaningless used fields. Upcoming has only specs/save/compare. Every vehicle page offers safe Return to results and selected-ID-preserving detail/specification/price/review links; upcoming links omit irrelevant enquiry. Explicit wrong filename never changes the record. Explicit invalid ID renders not-found with back-to-inventory, no actions against a default vehicle.

```js
const params = new URLSearchParams(doc.defaultView.location.search);
const route = doc.defaultView.location.pathname.split('/').pop();
const vehicle = resolveVehicle(route,params);
const returnTo = safeReturn(params.get('return'));
doc.querySelector('[data-vehicle-content]').innerHTML = vehicleContent(vehicle,route,returnTo);
doc.title = vehicle ? `${vehicle.name} | Carzone` : 'Vehicle not found | Carzone';
```

- [ ] Render specification groups with semantic definition lists for Identity, Powertrain, Practicality and Sample history; format nulls as Not provided. Price route states listed illustrative USD price with “Taxes, registration and financing are not calculated.” Upcoming price remains unknown. Review route displays that record's labelled sample editorial string, no verified-user stars/counters, and links to `write-review.html?car=<id>&return=<safe URL>`.
- [ ] Render bare-URL representative content at build time and include a visible no-JS note that selecting another vehicle through a query requires JavaScript. On enhancement, rerender before enabling controls; hydrate forms/actions only after current record resolution. Existing route tabs remain links, not fake buttons. Enquiry button stays disabled until Task 10 binds it.
- [ ] Add tests for all five bare fixtures, invalid empty ID, new-on-used and upcoming-on-price permutations, null field text, selected IDs on tabs and escaped review content. Browser-check each family at desktop/mobile and return-filter preservation. Run vehicle/catalogue/query suites and build; commit with message `feat: unify detail specifications price and sample reviews`.

## Task 9: Connect saved drawer, compare tray and semantic comparison UI

**Files:** Create `src/browser/saved.mjs`, `src/browser/compare.mjs`, `src/ui/saved.mjs`, `src/ui/compare.mjs`, `src/pages/compare.mjs`, `src/styles/compare.css`, `tests/compare-page.test.mjs`. Modify `src/ui/vehicle-row.mjs`, `src/ui/shell.mjs`, `src/browser/main.mjs`, `src/browser/inventory.mjs`, `src/pages/registry.mjs`.

**Interfaces:** Consumes Store, `resolveComparison`, `comparisonRows`, `comparisonQuery`, shared dialog. Produces `syncSelection(doc:Document,selection:Selection):void`, `mountSaved(doc:Document,store:Store):void`, `renderCompare():Page`, `compareContent(ids:string[],differencesOnly:boolean):string` in `src/ui/compare.mjs`, `savedContent(ids:string[]):string` in `src/ui/saved.mjs`, `mountCompare(doc:Document,store:Store):void`. Add the Task 7 `syncSelection` import/call now that its module exists.

- [ ] Write and run `node --test tests/compare-page.test.mjs` before implementation:

```js
test('compare content exposes all columns and honest empty states', () => {
  assert.match(compareContent([],false),/Choose cars to compare/);
  assert.match(compareContent(['city-sedan'],true),/Add another car/);
  const three = compareContent(['city-sedan','sport-sedan','family-suv'],false);
  assert.match(three,/<table/); assert.match(three,/scope="row"/);
  assert.match(three,/Family SUV/); assert.match(three,/Scroll horizontally/);
  assert.match(savedContent([]),/No saved cars yet/);
  assert.match(savedContent(['city-sedan']),/Add to compare/);
});
```

- [ ] Implement shared delegated Save/Compare controls. `syncSelection` updates pressed labels, saved count and tray visibility from current selection. Save does not mutate compare. Tray reserves layout/safe-area space and appears only after explicit selections, including previously stored deliberate selections. The saved drawer has View details, Remove/Undo, Add to compare and a real inventory empty link. Opening it is read-only; removal and undo use Store. Announce changes without moving focus unnecessarily.
- [ ] Implement compare page with explicit URL precedence, never an initialization write. Keep page-local IDs separate from device state until an edit. Supply an Add car select listing unselected catalogue records and an Add button; three selections disable Add with explanatory text. When a user adds/removes/undoes, update both URL and store. Back/forward reads the URL without persisting it. A shared `cars=` stays empty after reload.

```js
const validIds = new Set(vehicles.map(v=>v.id));
let current = resolveComparison(new URLSearchParams(win.location.search),store.snapshot().compare,validIds).ids;
function edit(ids) {
  current = ids;
  store.replaceCompare(current);
  win.history.pushState(null,'',`compare-car.html?${comparisonQuery(current)}`);
  render();
}
win.addEventListener('popstate',()=>{
  current = resolveComparison(new URLSearchParams(win.location.search),store.snapshot().compare,validIds).ids;
  render();
});
```

Define `render()` in the controller to replace `[data-compare-content]` using `compareContent`, restore focus to the closest surviving remove/add control, and show parsing notices. Compare-page row Add actions must edit `current`, not silently combine with older device IDs. Disable differences-only for fewer than two selections; otherwise preserve its in-memory boolean across renders and announce the no-differences state.

- [ ] Use the approved compare references. Render `<th scope="col">` vehicle headers and `<th scope="row">` attributes. Scroller is labelled and keyboard-focusable; sticky first column has an opaque background. Keep all car columns in DOM. No overflow hiding on body as a substitute for fixing layout.

```css
.comparison-scroll{overflow-x:auto;max-width:100%;border-block:1px solid var(--line)}
.comparison-table{border-collapse:separate;border-spacing:0;min-width:760px;width:100%}
.comparison-table th,.comparison-table td{padding:16px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.comparison-table th[scope=row]{position:sticky;left:0;background:#fff;z-index:1;min-width:150px}
.compare-tray{padding-bottom:max(16px,env(safe-area-inset-bottom));background:var(--graphite);color:white}
```

- [ ] Browser-check unlimited saves, fourth compare rejection, separate states, reload, shared-link non-overwrite, empty shared query, URL edits, undo ordering, corrupt/disabled storage, keyboard dialog containment and mobile horizontal table. Run store/compare/page suites and full build; commit with message `feat: connect saved cars and accessible comparison`.

## Task 10: Deliver seller, review, valuation and enquiry preview flows

**Files:** Create `src/pages/forms.mjs`, `src/ui/forms.mjs`, `src/browser/forms.mjs`, `src/styles/forms.css`, `tests/form-pages.test.mjs`. Modify `src/ui/shell.mjs`, `src/ui/vehicle.mjs`, `src/pages/registry.mjs`, `src/browser/main.mjs`, `src/browser/vehicle.mjs`.

**Interfaces:** Consumes Task 5 pure form contracts, selected vehicle resolution, escaping/dialog primitives. Produces `renderFormPage(kind:FormKind):Page`, `formContent(kind:FormKind,vehicle:Vehicle|null):string` in `src/ui/forms.mjs`, `mountForms(doc:Document,store:Store):void`. Three existing form routes plus a shared enquiry dialog, no new route. On vehicle routes, call `mountForms` after `mountVehicle` has resolved and rendered the selected record; bind an enquiry dialog only to a current new/used record. Review-route resolution follows Task 3, including explicit invalid IDs.

- [ ] Write structural safety tests and run `node --test tests/form-pages.test.mjs`; expect failure before module creation:

```js
test('forms are inert without JS and do not claim submission', () => {
  for (const kind of ['seller','review','valuation','enquiry']) {
    const html = formContent(kind,getVehicle('city-sedan'));
    assert.match(html,/<fieldset disabled/);
    assert.match(html,/type="button"/);
    assert.match(html,/autocomplete="off"/);
    assert.doesNotMatch(html,/action="https?:|type="submit"|type="file"|Message sent|Listing published|Review submitted/);
  }
  assert.doesNotMatch(formContent('valuation',null),/Estimated value|Guaranteed offer/);
});
```

- [ ] Render the exact Task 5 labels/defaults with `<label for>`, unique IDs, associated error spans and a top error summary. Personal/free-text field values are empty in static HTML. “Use fictional sample” fills defaults only after enhancement, so browser-restored real values are never mistaken for defaults. Forms start with disabled fieldsets, `autocomplete="off"`, no action and only `type="button"` controls. Shell CSP `form-action 'none'` is defense in depth, not the only protection. Hide/disable enquiry for upcoming records; invalid review IDs show not-found rather than switching fixtures.
- [ ] Bind `submit.preventDefault()` first, reset fields, then enable fieldsets. Preview collects only allowed fields, calls `validateDraft`, focuses an error summary/first invalid field, and renders review text with `textContent` or `escapeHtml`. Edit returns to the form with the same in-memory draft. Confirmation remains local and says the exact unsent copy. No fetch, sendBeacon, XMLHttpRequest, mailto, storage, query serialization or form navigation.

```js
function bindLocalForm(form,kind) {
  form.addEventListener('submit',event=>event.preventDefault());
  const review = form.querySelector('[data-review]');
  const clear = () => {
    form.reset();
    for (const input of form.querySelectorAll('input,textarea,select')) input.value = '';
    review.replaceChildren();
    form.querySelector('[data-completion]').hidden = true;
    showErrors(form,{});
    showStep(form,'edit');
  };
  clear();
  form.querySelector('[data-preview]').addEventListener('click',()=>{
    const draft = Object.fromEntries(new FormData(form));
    const errors = validateDraft(kind,draft);
    showErrors(form,errors);
    if (Object.keys(errors).length) return;
    review.replaceChildren(...reviewDraft(kind,draft).map(row=>{
      const p = form.ownerDocument.createElement('p');
      p.textContent = `${row.label}: ${row.value}`; return p;
    }));
    showStep(form,'review');
  });
  form.ownerDocument.defaultView.addEventListener('pagehide',clear);
  form.ownerDocument.defaultView.addEventListener('pageshow',clear);
  form.querySelector('fieldset').disabled = false;
  return clear;
}
```

Define local `showErrors(form:HTMLFormElement,errors:Record<string,string>):void` to clear old aria-invalid/describedby states then attach current field errors, populate/focus summary; `showStep(form,step:'edit'|'review'|'complete'):void` toggles hidden regions and focuses the new heading. Wire sample/edit/reset/confirm buttons with explicit listeners. Wire dialog close and Escape to returned `clear`, then restore opener focus. Clear all review content as well as fields on reset/reload/pagehide/pageshow to cover back-forward cache.

- [ ] Extend seller with preview-only draft summary, review with selected car and sample attribution, valuation with educational age/mileage/condition/service-record factors and the five-field summary only. Valuation confirm copy adds “No price estimate or dealer offer is generated.” Use the matching forms reference, visible privacy notice and no sensitive storage.
- [ ] Browser-check empty/invalid/valid/sample/Edit/Reset/Close/Escape/Reload/Back states for each kind. Inspect network while typing/previewing/confirming: no receiver requests, form navigation, analytics or legacy endpoints. Inspect local/session storage and URL before/after: no contact/free-text values. Test JavaScript disabled: no form can submit by button or Enter. Run form/domain/page tests and build; commit with message `feat: add safe local-only enquiry seller and review previews`.

## Task 11: Complete the style guide, progressive motion and responsive polish

**Files:** Create `src/pages/style-guide.mjs`. Modify `src/pages/registry.mjs`, `src/browser/motion.mjs`, `src/styles/{tokens,base,shell,home,inventory,vehicle,compare,forms}.css`, `tests/home.test.mjs`.

**Interfaces:** Produces `renderStyleGuide():Page`; uses actual shared primitives/tokens, no separate design system. Final registry now contains exactly fourteen entries. `mountMotion` owns visual enhancement only, never required visibility/state.

- [ ] Add a failing registry test asserting exact set equality with the fourteen-route table, unique page titles/descriptions, and that the style-guide body includes actual buttons, inputs, vehicle row, notice, empty state, validation error and comparison-table examples. Run `node --test tests/home.test.mjs`; expect missing style-guide/registry entry failure.
- [ ] Render style-guide sections: Colors (exact hex values), Typography (two actual families/weights), Spacing, Buttons/Focus, Form states, Vehicle row, Empty/Status, Comparison. Controls with no demo action are labelled examples and disabled rather than fake links. Include representative route content, no empty placeholder page.
- [ ] Add one brief hero entrance only after confirming reduced-motion preference; default DOM/CSS stays fully visible.

```js
export function mountMotion(doc) {
  if (doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = doc.querySelector('[data-hero-copy]');
  hero?.animate([{transform:'translateY(12px)',opacity:0.85},{transform:'translateY(0)',opacity:1}],
    {duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
}
```

Use short color/transform transitions for hover/save feedback only. No autoplay, scroll hijacking, blocking introduction, initial inline opacity zero or essential reveal-on-scroll.

- [ ] Check every route at 1440, 768, 390 and 320 CSS-pixel widths and 200% zoom. Adjust measured layout defects: mobile copy before hero image, stacked full-width finder/rows, no clipped labels, safe-area tray spacing, visible focus, correctly contained comparison scrolling. Preserve 16px body/form text. Verify text/background contrast ≥4.5:1 for normal text and ≥3:1 for large text/UI boundaries where required; do not assume brand red works for every text role.
- [ ] Compare matching reference and browser screenshot together in the same visual-inspection input for all five families. Record typography, imagery/crop, spacing, copy, color and state differences; fix material visible mismatches and compare again. Record generator-reference limitations, not invented pixel accuracy.
- [ ] Run all tests/build. Commit with message `feat: complete style guide and responsive progressive enhancement`.

## Task 12: Verify the whole artifact and document the handoff

**Files:** Create `scripts/check-artifact.mjs`, `tests/artifact.test.mjs`, `docs/qa/carzone-browser-checklist.md`, `docs/qa/carzone-results.md`. Modify `README.md`. Fix implementation files only for defects reproduced by this gate.

**Interfaces:** Produces `checkArtifact(root:string):Promise<string[]>` and CLI nonzero exit on any issue. Consumes built files and the fixed fourteen-route list, not the registry alone (so omissions are detectable independently).

- [ ] Write this failing test; run `node --test tests/artifact.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {build} from '../scripts/build.mjs';
import {checkArtifact} from '../scripts/check-artifact.mjs';
test('complete build is self-contained and preserves all routes', async t => {
  const root = await mkdtemp(path.join(tmpdir(),'carzone-artifact-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await build(root);
  assert.deepEqual(await checkArtifact(root),[]);
});
```

The test cleanup target comes directly from `mkdtemp` and is never the repository. Add negative fixture tests for a missing route, unresolved asset, dangling fragment, `href="#"`, remote form action, copied Webflow runtime and an unexpected root HTML page.

- [ ] Implement checks: exact fourteen HTML paths; unique title/description, lang=en and one h1 each; local src/href/CSS-url and ES-module imports resolve within artifact; fragments resolve on target files; nonempty meaningful route content; no unfinished hash actions; only approved external links, if any; no old Webflow/jQuery/WebFont/Turnstile scripts or form endpoints; no initial zero-opacity requirements; no remote fonts/analytics; CSP present; no source PNGs/docs/.git/node_modules. Whitelist script modules/styles/media/fonts/icons/licenses only. The test runner's regex parsing is for generated controlled HTML, not a general HTML sanitizer.

```js
const forbidden = [/webflow\.js/i,/jquery/i,/WebFont\.load/,/formdata\.webflow/i,/href=["']#["']/i,/style=["'][^"']*opacity:\s*0/i];
for (const filename of expectedRoutes) {
  const html = await readFile(path.join(root,filename),'utf8');
  for (const pattern of forbidden) if (pattern.test(html)) issues.push(`${filename}: forbidden legacy/placeholder pattern ${pattern}`);
  if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) issues.push(`${filename}: expected one h1`);
}
```

Define `expectedRoutes` as the literal table's fourteen filenames, `issues=[]`, and catch missing file errors into issues. Resolve decoded local paths against an artificial same-origin URL, validate containment, strip query before file checking and then verify fragments against target IDs. Browser testing remains required; static checks alone do not prove working controls.

- [ ] Run `npm run check` from the exact Carzone checkout. Record Node/package versions, pass/fail counts and artifact byte totals. If first full run finds a broken contract, add the failing regression test before fixing it, rerun the narrow test then the full check.
- [ ] Create and execute this browser matrix in the selected browser; every row gets observed pass/fail, viewport, date and evidence path in `docs/qa/carzone-results.md`:

| Area | Required observed sequence |
| --- | --- |
| First preview | Buffered server assets all load; computed CSS/font checks; console clear; no unexplained style-loading failure |
| Buyer journey | Home finder → filtered results → save four → compare three → inspect used detail → return with same filters/order → unsent enquiry |
| URL/history | All fourteen direct routes; bare fixtures; invalid/empty/wrong-route IDs; malicious filter values; back/forward; return context |
| Inventory | All enum filters/sorts, null prices last, numeric budget exclusion, removable chips, zero results, mobile draft cancel/apply |
| Saved/compare | Empty/one/three, fourth rejected, remove/undo, different stored/shared sets, explicit empty query, invalid/duplicate/excess IDs, known/missing and equal normalized power |
| Forms/privacy | Fictional fill, invalid errors, review/edit/confirm/reset/close/reload/BFCache; no POST/GET submission or receiver calls; no text/contact storage |
| Keyboard | Skip link, full nav, mobile menu, dialog containment/Escape/focus return, field errors, comparison scroller and status announcements |
| Responsive | 1440/768/390/320 widths, 200% zoom, no page overflow, all comparison columns reachable, 44px targets |
| Progressive enhancement | JavaScript disabled readable representative content/navigation, blocked forms and clear limitations; reduced motion immediate content |
| Visual fidelity | Reference + screenshot together per family/state, compare/fix/recompare; honest deviations documented |
| Performance | First-load resource list/bytes, image dimensions/loading priority, font requests/weights and observed timing; state browser/network conditions |

- [ ] Measure rather than promise performance: record homepage transfer size, hero derivative actually selected, eager/lazy requests, local font count and browser timing entries where available. Report unsupported measurements as unavailable; do not invent Lighthouse/Web Vitals scores. Resolve missing assets, console errors and unintended overflow. No hosted audit or deployment is authorized.
- [ ] Rewrite README with Webflow origin/baseline, new static architecture, Node24 requirement, `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run preview`, and “serve/deploy dist only”. Explain sample inventory/unknown asset rights, local-only storage and forms, no Webflow-editor round trip, tested scope and remaining limitations. Link the approved spec, this plan, provenance and QA results. Clearly distinguish root historical files from current generated output.
- [ ] Commit only reviewed changes with message `test: verify and document the complete Carzone demo`. No push or deployment. Show the working local prototype first in the final implementation handoff, then concise scope/test results and any real limitation.

## Dependency order and review gates

Task 1 must supply the corresponding readable reference before Tasks 6–11 style a family. Tasks 2–5 are separately testable domain slices; Task 5 can run alongside state work once the shared contracts are fixed. Task 6 supplies the first runnable homepage. Tasks 7 and 8 can be delegated separately after the shell/contracts land, with one owner merging shared registry/main edits. Task 9 depends on Task 4 and completes previously disabled save/compare interactions; Task 10 depends on Tasks 5/8 and completes enquiries. Task 11 follows all routes; Task 12 is the completion gate.

Use a fresh implementer per coherent task, with spec-compliance and code-quality reviews at each task boundary if executing subagent-driven. Avoid concurrent edits to the same registry, shared primitives or stylesheet. Do not ask the user to reselect the approved visual direction; ask only if new authority or a genuine scope-changing decision is needed.

## Plan self-review record

Completed by the primary planning agent before handoff:

- Coverage: visual identity/references/assets → 1/6/11; catalogue/unknown values → 2; all route/query defaults and safe return → 3/7/8; persistence/undo/share semantics → 4/9; local-only forms/valuation → 5/10; shared build/no legacy runtime → 6/12; all fourteen routes/style guide → 7–12; mobile/keyboard/no-JS/reduced-motion → 6–12; measured QA/README/no deployment → 12.
- Interface audit: `Vehicle`, `Filters`, `Selection`, `Store`, `FormKind`, serializer conventions, fixed route names and controller signatures are shared explicitly; runtime never imports build-only page modules. Family render helpers have dedicated files, and Task 9 owns the delayed inventory selection binding.
- Corrections from the self-review: specified the null/corrupt-storage memory-only notice and behavior, reset form error/step state as well as content, and fixed enquiry initialization order after selected-record rendering.
- Execution status at plan handoff: no application implementation, package installation or deployment has been performed. Unchecked boxes represent future execution, not completed work.
