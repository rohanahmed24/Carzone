# Carzone modernization verification

Date: 2026-08-31 (Asia/Dhaka), with a 2026-09-01 Playwright follow-up. The original snapshot below is retained. The later GitHub update and Vercel publication are recorded in [the deployment record](vercel-deployment.md). Publication still does not close whole-site Product Design acceptance.

## 2026-09-01 follow-up (Playwright against dist/)

Environment: Node v24.20.0 via nvm (host `/exec-daemon/node` remains 22.14.0; checks used the nvm binary). `npm ci` then `npm run check` on this checkout: **78 tests passed, 0 failed**, `Carzone built to dist.`, `Artifact verification passed.` Preview: `npm run preview` at `http://127.0.0.1:4176/`, serving `dist/` only. Browser: Playwright MCP Chromium, not the earlier Codex in-app browser. Favicon.ico 404 is the only console error observed (browser-default request; not an application asset).

This follow-up was stopped before a complete visual-acceptance matrix. No application CSS/JS fixes were landed. Remaining P2 findings below are observed, not marked passed.

### Recaptured homepage after Task11 (`132f5f8`)

Measured with `overflowX = 0` and no sub-43px primary controls on home at 1440 / 768 / 390 / 320. Local Manrope 16px and Barlow Condensed checks returned true. Recaptures: `screenshots/home-768.png`, `home-320.png`, plus refreshed `home-desktop-pass2.png`, `home-mobile-pass2.png`, `home-mobile-top-pass2.png`.

- **768px passed for the Task11 defects.** Copy-first stacked hero (content bottom 354px, image top 354px, overlap area 0). Full-aspect contained image ~753×424. Two-column finder. Header logo + Menu on one 72px row. 72px h1.
- **320px passed for the Task11 defects.** 150px wordmark, enhanced header `flex-wrap: nowrap`, Menu 44px, stacked hero CTAs, overlap area 0, 16px body. Hero image still uses the intended 150vw crop (`left` negative) without document overflow.

### Journeys actually run (not inferred)

Buyer: empty saved/compare → finder Used / sedan / Under $40,000 → `latest-cars.html?view=all&condition=used&budget=40000&body=sedan&sort=featured` with **2 illustrative cars**, City $22,500 then Sport $28,900. Four saves (City, Sport, Family SUV, Daily hatch) left compare `[]`. Saved drawer remove moved focus to **Undo saved car removal**; undo restored count 4 and focused Remove. Page-level Undo (drawer closed) sat below the header at 1440 (`top: 88`, padding `16px 64px`, overflowX 0); focus stayed on the still-connected Save control; undo restored **Saved City sedan**. Compare accepted three cars and rejected a fourth with **Compare up to three cars.** Shared `?cars=family-suv,touring-wagon` rendered those two columns without replacing stored `['city-sedan','sport-sedan']`; an explicit remove updated URL and storage. Duplicate/unknown/excess IDs showed three valid columns and **Some unknown or excess cars were omitted.** Bare `compare-car.html` with empty device storage showed **Choose cars to compare**.

City sedan: `$22,500`, `42,000 km`, sample owners 1. Overview / Specifications / Price / Sample review kept `car=city-sedan`. Upcoming Concept coupe: no enquiry, **Price not announced**, **Launch timing unconfirmed**. Invalid id: **Vehicle not found**. `car-details.html?car=city-sedan` still showed City (availability owns actions).

Inventory: mobile Filters and sort Escape restored **Filters and sort** without committing; Apply with body SUV committed `body=suv` and **0 illustrative cars**. Upcoming + $25,000: **No cars match these filters.** plus **Unknown prices are excluded by this budget.** Clear filters went to `view=all` (matches existing controller tests). Back/forward restored the zero-result URL. Script-like `condition` query text was not rendered as markup.

Forms: empty seller preview showed accessible field errors; fictional sample → review → finish used exact **Demo preview only — nothing was sent.** Enquiry Escape restored **Preview enquiry**. Valuation completion includes **No price estimate or dealer offer is generated.** Reset returned the edit step with empty fields.

Keyboard: skip link Tab showed **Skip to content** at `top: 12`. Mobile menu Enter, Tab stayed inside the dialog (**Explore cars**), Escape closed all dialogs and restored **Menu**. Compare table at 390/320: page `overflowX` 0; `.comparison-scroll` `overflow: auto` (scrollWidth 789 vs client 348 / 278).

Fourteen routes × 1440/768/390/320: **56/56** with `overflowX ≤ 1` and no `href="#"` placeholders. Reduced-motion emulation: `prefers-reduced-motion: reduce` matched, hero animations 0, opacity 1. No-JS: readable home/inventory, finder and form fieldsets disabled, no submit control, 320px header wraps to expose desktop-nav links (documented no-JS behaviour). CSS `zoom: 2` at 1440 reported overflowX 23; CDP `setPageScaleFactor(2)` reported overflowX 0. Treat 200% as partial, not a pass.

Storage warning (localStorage getter throws): copy **Device storage unavailable; changes last for this page.** at 1440 (`top: 88`, height 26, 16px, transparent background, 0 padding) and 320 (height 51, width 265, overflowX 0). The same copy also appears in the floating `.status` toast. Page-level Undo at 320 measured 208×48 with overflowX 0; the viewport capture scrolled to the clicked row, so the top Undo bar is not in `page-saved-undo-320.png`.

### Open P2 findings (observed, not fixed)

1. **Compare tray covers page content.** On `compare-car.html` with three cars, the shell tray overlapped Availability (28px) and Body style (55px). On inventory it overlapped the last vehicle row by 84px (`body` padding-bottom 0). Mobile/320 compare captures show the tray over the table header/image. Hide the tray on the compare route and reserve space when it is visible elsewhere.
2. **Storage-warning surface is visually weak and duplicated.** Dedicated `[data-storage-warning]` is unpadded graphite body text flush under the header; `[data-status]` repeats the same sentence and, at 320, covers the Compare cars control.
3. **Page-level Undo is easy to miss after a mid-list save toggle at 320** because it is not sticky; the toast says undo is available but does not contain the control.

Whole-site paired reference comparison is **not** complete. Family captures exist as working notes (`inventory-*`, `vehicle-*`, `compare-*`, `forms-*`) but were not scored against every manifest raster in one inspection pass.

## Environment

- Node v24.19.0; npm 12.0.2, observed from the Carzone checkout.
- Installed locked packages: @fontsource/barlow-condensed 5.3.0, @fontsource/manrope 5.3.0, lucide-static 1.38.0, sharp 0.35.4.
- Browser: Codex in-app browser through the selected browser runtime. No alternate browser automation has been used.
- Preview target: `http://127.0.0.1:4176/`, serving `dist/` only.
- At wrap-up, the earlier server process session was unavailable and no listener was present on4176. No live preview tab/server is claimed. The README's local run commands remain the startup instructions; no browser access was retried.

## Final automated evidence

Application Tasks1–11 have scoped independent spec/quality approval. The real-build integration test is committed as `da693eb`; its independent scoped review approved spec compliance and quality with no findings. That initial final gate passed73/73. Whole-branch review then identified two selection-controller issues and one artifact-checker weakness, all handled in one bounded fix wave.

The latest canonical `npm run check` after source fix commit `3d77a35` completed with exit0: **78 tests passed, 0 failed**, then `Carzone built to dist.` and `Artifact verification passed.` Focused final tests passed27/27. The earlier RED run failed four of26 focused tests as expected, reproducing missing persistence visibility/binding, toggle-removal Undo and shell-only main content. Independent scoped re-review over `fabc6ed..89b1f9c` marked all three findings addressed, with no new breakage or out-of-scope observations. Individual RED/GREEN reports remain in the implementation ledger.

The artifact tests ran the real `build(root)` and `checkArtifact(root)` in a fresh temporary directory: initial RED8/9 (only the then-missing style-guide route), then GREEN9/9. The later content regression also rejects routes whose meaningful text exists only in the shared shell; route-specific main content excludes the heading. The fixed route list independently checks all fourteen paths rather than trusting the renderer registry. Metadata, local assets/imports/fragments, CSP, approved output paths and legacy/placeholder checks passed. This establishes the automated gate, not whole-site browser acceptance.

All fourteen routes: `index.html`, `latest-cars.html`, `popular-cars.html`, `upcoming-cars.html`, `car-details.html`, `used-car-details.html`, `car-specification.html`, `car-price.html`, `car-review.html`, `car-valuation.html`, `compare-car.html`, `sell-your-car.html`, `write-review.html`, `style-guide.html`.

### Generated artifact size

Measured after the final fix-wave build: **96 files, 1,025,287 bytes**.

| Type | Files | Bytes |
|---|---:|---:|
| HTML | 14 | 144,210 |
| CSS | 8 | 29,549 |
| MJS | 26 | 76,590 |
| WebP | 28 | 654,440 |
| WOFF2 | 6 | 101,288 |
| SVG | 10 | 3,605 |
| Brand PNG | 1 | 1,847 |
| Licenses | 3 | 13,758 |

These are filesystem byte totals, **not network transfers or performance scores**. No Lighthouse or Web Vitals score is claimed. Original root HTML, CSS, JavaScript and images were unchanged in the Git diff against baseline `cc63d101e382666f47f85d2f645da41e1d57ee0c`.

## Observed browser matrix

Original 2026-08-31 Codex-browser rows are superseded by the 2026-09-01 Playwright follow-up where that follow-up actually ran. Unfinished Product Design pairing remains open.

| Area | Status | Viewport | Evidence |
|---|---|---|---|
| First preview / CSS / fonts | Passed (home) | 1440 / 768 / 390 / 320 | Recaptured home shots; Manrope 16px / Barlow true |
| Buyer journey | Passed for the finder → four saves → compare-limit path | 1440 | Playwright journey, `inventory-desktop.png`, `saved-drawer-desktop.png` |
| Direct routes / URLs / history | Passed for exercised URLs; not every fixture combination | 1440 / 390 | City tabs, invalid id, mismatch filename, inventory back/forward |
| Inventory / draft filters / zero results | Passed for Escape/Apply/zero upcoming budget/clear | 1440 / 390 | `inventory-mobile-filters.png`, `inventory-zero-desktop.png` |
| Saved / comparison / shared URLs | Passed for drawer undo, page undo at 1440, shared read/edit, malformed cars | 1440 | `page-saved-undo-desktop.png`, compare captures |
| Forms / privacy / lifecycle | Passed for seller/enquiry/review/valuation sample → unsent; Escape/reset | 1440 | `forms-desktop.png`, `forms-enquiry-review.png` |
| Keyboard / dialog focus / scroller | Passed for skip, menu Tab/Escape, compare internal scroller | 390 / 320 | Playwright keyboard + scrollWidth measurements |
| Responsive / overflow / target sizes | Home Task11 recaptures passed; 56-route overflow check passed; compare-tray overlap is an open P2 | 1440 / 768 / 390 / 320 | Recaptured home-768/320; matrix 56/56 |
| 200% zoom | Partial | 1440 | CSS zoom overflowX 23; CDP scale overflowX 0; `home-200pct-zoom.png` |
| No-JS / reduced motion | Passed as emulated, not a native browser setting UI | 1440 / 320 | `home-nojs-desktop.png`, `home-nojs-320.png`; reduced-motion animations 0 |
| Visual fidelity | Partial; whole-site pairing not finished | Per reference manifest | Home 768/320 recaptures inspected; family shots exist but were not fully paired |
| Performance measurements | Partial | 1440 | File sizes only; no Lighthouse / Web Vitals |

## First homepage observations

## First homepage observations

At1440/390, four stylesheet objects had rules, both local font checks returnedtrue, computed body was Manrope16px and hero rgb(17,18,20). All visible images loaded; hero selected hero-1440.webp (1440×810,52314filebytes). Browser console warnings/errors were empty. Media output totals654440bytes across28WebPfiles; hero640/960/1672 derivatives14128/27474/65924bytes. These are filesystem sizes, not measured transferred bytes.

Mobile menu opened, explicit Close restored focus, and after a scoped Escape-handler fix Escape left zeroopen dialogs with Menu focused. Finder native select heights were corrected32→44px. Page overflow was absent at1440/768/390/320 in the home measurements (15px desktop scrollbars reduce content client width). Tablet hero crop and320 header/CTA wrap were recorded as P2 defects. Task11 implemented source fixes in `132f5f8`. The 2026-09-01 recaptures of `home-768.png` and `home-320.png` confirm those two defects are visually resolved.

Evidence: `screenshots/home-desktop-pass1.png`, `home-desktop-pass2.png`, `home-mobile-pass1.png`, `home-mobile-pass2.png`, `home-mobile-top-pass2.png`, `home-768.png`, `home-320.png`; paired-reference comparisons are recorded in project-root `design-qa.md`.

## Historical Codex-browser blocker (2026-08-31)

The original session stopped at a URL safety-policy denial in the Codex in-app browser. The 2026-09-01 follow-up used Playwright against the same `dist/` preview instead. Do not read the older denial as the current gate.

HTML response headers are rewritten by a host intermediary: minimal server/native header evidence preserves Content-Length, while fetched HTML is chunked and has injected Permissions-Policy; CSS preserves native length over HTTP. The tests verify emitted HTML/HEAD length and received CSS length without claiming end-to-end HTML preservation.

Follow [the browser checklist](carzone-browser-checklist.md) and the approved plan. Replace pending rows only with actual observations, not code-review inference.

## Acceptance status

Automated build/test/artifact gate: **passed** (reconfirmed 2026-09-01). Permitted Playwright journeys listed above were actually run against `dist/`. Whole-site Product Design acceptance is **not complete**: family reference pairing was not finished, three P2 visual issues remain unfixed, and this follow-up was stopped before further recaptures. No real form submission or data export.

## Final whole-branch source review

- Important: storage write failure's temporary-mode warning was overwritten by an inaccurate persistent-save confirmation. The fix exposes read-only persistence state and keeps a dedicated storage-warning surface separate from action messages; unavailable/read/write/corrupt/getter fallback paths have local regressions.
- Important: an active Saved row/detail toggle removed without Undo. Saved removals now use the same order-preserving undo operation, with page-level Undo when the drawer is closed and drawer-local Undo when open.
- Minor: meaningful-content checking counted title/navigation/footer. The checker now requires route-specific main text beyond the heading and has a shell-preserving negative regression.

Source fixes and automated gate complete; independent scoped re-review approved all three fixes without new breakage. 2026-09-01 rendered the warning and page-level Undo (see follow-up). Placement/focus work at 1440; remaining P2 issues are the unstyled/duplicated warning, non-sticky 320 Undo, and compare-tray overlap.
