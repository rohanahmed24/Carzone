# Carzone modernization verification

Date: 2026-08-31 (Asia/Dhaka). Target: local generated application only; no deployment.

## Environment

- Node v24.19.0; npm 12.0.2, observed from the Carzone checkout.
- Installed locked packages: @fontsource/barlow-condensed 5.3.0, @fontsource/manrope 5.3.0, lucide-static 1.38.0, sharp 0.35.4.
- Browser: Codex in-app browser through the selected browser runtime. No alternate browser automation has been used.
- Preview target: `http://127.0.0.1:4176/`, serving `dist/` only.

## Final automated evidence

Application Tasks1–11 have scoped independent spec/quality approval. After source commit `132f5f8`, the canonical `npm run check` completed with exit0: **73 tests passed, 0 failed**, then `Carzone built to dist.` and `Artifact verification passed.` The new real-build integration test is committed as `da693eb`; its independent scoped review approved spec compliance and quality with no findings. Individual RED/GREEN reports remain in the implementation ledger. Final whole-branch review is pending.

The artifact tests ran the real `build(root)` and `checkArtifact(root)` in a fresh temporary directory: initial RED8/9 (only the then-missing style-guide route), final GREEN9/9. The fixed route list independently checks all fourteen paths rather than trusting the renderer registry. Metadata, local assets/imports/fragments, CSP, approved output paths and legacy/placeholder checks passed. This establishes the automated gate, not whole-site browser acceptance.

All fourteen routes: `index.html`, `latest-cars.html`, `popular-cars.html`, `upcoming-cars.html`, `car-details.html`, `used-car-details.html`, `car-specification.html`, `car-price.html`, `car-review.html`, `car-valuation.html`, `compare-car.html`, `sell-your-car.html`, `write-review.html`, `style-guide.html`.

### Generated artifact size

Measured after the final build: **95 files, 1,019,399 bytes**. Homepage HTML:10,252 bytes.

| Type | Files | Bytes |
|---|---:|---:|
| HTML | 14 | 140,150 |
| CSS | 8 | 29,549 |
| MJS | 25 | 74,762 |
| WebP | 28 | 654,440 |
| WOFF2 | 6 | 101,288 |
| SVG | 10 | 3,605 |
| Brand PNG | 1 | 1,847 |
| Licenses | 3 | 13,758 |

These are filesystem byte totals, **not network transfers or performance scores**. No Lighthouse or Web Vitals score is claimed. Original root HTML, CSS, JavaScript and images were unchanged in the Git diff against baseline `cc63d101e382666f47f85d2f645da41e1d57ee0c`.

## Observed browser matrix

| Area | Status | Viewport | Evidence |
|---|---|---|---|
| First preview / CSS / fonts | Passed for initial homepage | 1440 / 390 | Home pass1/pass2 captures and measured CSS/font/image values below |
| Buyer journey | Blocked | 1440 / 390 planned | Browser URL safety-policy denial |
| Direct routes / URLs / history | Blocked in browser | 1440 / 390 planned | Pure/structural tests are separate evidence |
| Inventory / draft filters / zero results | Blocked in browser | 1440 / 390 planned | Controller tests are separate evidence |
| Saved / comparison / shared URLs | Blocked in browser | 1440 / 390 planned | Store/controller tests are separate evidence |
| Forms / privacy / lifecycle | Blocked in browser | 1440 / 390 planned | Form/controller tests are separate evidence |
| Keyboard / dialog focus / scroller | Partial | 390 | Menu open/Close/Escape restoration passed; native Tab/scroller unverified |
| Responsive / overflow / target sizes | Partial; final recaptures blocked | 1440 / 768 / 390 / 320 | Homepage captures only; two P2 source fixes await rendered recheck |
| 200% zoom | Unavailable | Attempted at1440 | Injected shortcut did not change zoom |
| No-JS / reduced motion | Unavailable in browser | — | Static/runtime evidence only |
| Visual fidelity | Blocked overall | Per reference manifest | Home paired captures exist; other families and post-fix viewport captures unavailable |
| Performance measurements | Partial | 1440 | File sizes and selected hero observed; browser timing/transfer values unavailable |

## First homepage observations

At1440/390, four stylesheet objects had rules, both local font checks returnedtrue, computed body was Manrope16px and hero rgb(17,18,20). All visible images loaded; hero selected hero-1440.webp (1440×810,52314filebytes). Browser console warnings/errors were empty. Media output totals654440bytes across28WebPfiles; hero640/960/1672 derivatives14128/27474/65924bytes. These are filesystem sizes, not measured transferred bytes.

Mobile menu opened, explicit Close restored focus, and after a scoped Escape-handler fix Escape left zeroopen dialogs with Menu focused. Finder native select heights were corrected32→44px. Page overflow was absent at1440/768/390/320 in the home measurements (15px desktop scrollbars reduce content client width). Tablet hero crop and320 header/CTA wrap were recorded as P2 defects. Task11 implemented source fixes in `132f5f8`; those fixes were not recaptured and are not recorded as visual passes.

Evidence: `screenshots/home-desktop-pass1.png`, `home-desktop-pass2.png`, `home-mobile-pass1.png`, `home-mobile-pass2.png`, `home-mobile-top-pass2.png`, `home-768.png`, `home-320.png`; paired-reference comparisons are recorded in project-root `design-qa.md`.

## Browser verification blocker

Further browser testing was explicitly denied by the selected browser's URL security policy during the home-finder/inventory transition. Browser operations stopped immediately after the policy denial. No alternate browser, port, raw automation or indirect bypass was attempted. The remaining route/interaction/visual matrix is unverified; local implementation and the final Node test/build gate completed independently.

Other observed capability limitations: injected native Tab didnotcycle; Control+plus fourtimes didnotchange CSSwidth (Control0reset was sent), so200%zoom is unverified. The documented browser interface offers no JavaScript-disabled or reduced-motion emulation; static/runtime tests are not labelled browser observations. The read-only page scope exposes no performance object, so resource timing/transfer measurements are unavailable. Browser storage inspection is prohibited by the selected Browser skill; persistence/privacy can be checked in pure tests and source analysis, not claimed as browser-storage proof.

HTML response headers are rewritten by a host intermediary: minimal server/native header evidence preserves Content-Length, while fetched HTML is chunked and has injected Permissions-Policy; CSS preserves native length over HTTP. The tests verify emitted HTML/HEAD length and received CSS length without claiming end-to-end HTML preservation.

Follow [the browser checklist](carzone-browser-checklist.md) and the approved plan. Replace pending rows only with actual observations, not code-review inference.

## Acceptance status

Automated build/test/artifact gate: passed. Whole-site Product Design/browser acceptance: **blocked**, not complete. Remaining work is permitted-browser journey, keyboard/zoom checks and paired final reference comparisons. No push, merge, deployment, real form submission or data export was performed.
