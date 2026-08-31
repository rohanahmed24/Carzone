# Carzone

A cinematic automotive portfolio demo with a practical browsing, shortlist and comparison experience. This is **not a live dealership**: vehicles, prices, specifications and reviews are illustrative. Nothing is sold, sent or published.

## Run locally

Use Node **24.x** (tested with 24.19.0). From this directory:

```sh
npm ci
npm run dev
```

The local preview runs at `http://127.0.0.1:4176/`. Development watches `src/` and `assets/`, rebuilds and requires a manual browser refresh; there is no HMR connection.

```sh
npm test          # Node domain, rendering, controller and server tests
npm run build    # Generate the self-contained dist/ artifact
npm run preview  # Serve the existing dist/ build on 127.0.0.1:4176
npm run check    # Tests, build, and independent artifact verification
```

**Serve/deploy `dist/` only.** Do not serve the repository root: its historical HTML still belongs to the original Webflow export. No deployment or Git push is part of this modernization.

## Architecture

- Static multi-page HTML preserves all fourteen original entry paths.
- `src/domain/` owns the validated twelve-vehicle catalogue, URL filters, storage/compare rules and local form contracts.
- `src/ui/` contains escaped, browser-safe markup helpers. `src/pages/` owns build-time page rendering and the route registry.
- `src/browser/` provides progressive enhancement; `src/styles/` owns shared tokens and responsive family styles.
- `scripts/` builds allowlisted assets/pages, serves buffered exact-file responses, watches development sources and validates the final artifact.
- Local Manrope/Barlow Condensed fonts, Lucide icons and responsive WebP derivatives are prepared from pinned development dependencies and the asset manifest.

No framework migration, backend, account system, payment flow or analytics service is used. Missing facts remain “Not provided”; upcoming concepts have no announced price or confirmed launch date. Popular means an editorial sample selection, not live popularity.

## Privacy and demo boundaries

Saved cars are an unrestricted device-local shortlist; comparison is a separate ordered selection of up to three vehicle IDs. Only IDs persist under `carzone.selection.v1`. Unavailable/corrupt device storage falls back to page-memory selection with a notice. Reading a shared comparison does not replace device selection; an explicit edit does.

Enquiry, seller, review and valuation forms are local previews. Use their fictional sample button instead of personal details. Entered fields and review content are cleared on reset, close and page lifecycle changes, never stored or added to the URL. Forms cannot submit without JavaScript and the application CSP blocks external connections and form actions. Completion says **“Demo preview only — nothing was sent.”** Valuation explains factors; it does not produce an estimate or dealer offer.

Photo uploads, exports, real enquiries, financing, live stock, verified reviews, guided questionnaires and 360-degree viewing are outside scope.

## Webflow origin and image provenance

The project began as a Webflow portfolio concept. Root `.html`, `css/`, `js/` and original `images/` files are historical source material; the new build does not copy their legacy runtime into `dist/`. The export is hard-coded and is not connected to a live Webflow CMS. These source-code changes do not round-trip into the Webflow editor.

Selected existing vehicle photos and the original wordmark are retained. Their original licensing/subject rights are not established by this repository, so commercial clearance is **not claimed**. Generated hero/SUV/wagon assets are documented separately in [asset provenance](assets/provenance.md). The hero is an un-named editorial image, not a verified model listing.

## Verification status

All fourteen routes are implemented on `codex/carzone-modernization`. The final automated gate, `npm run check`, passed: **73 tests, 0 failures**, followed by a successful build and artifact verification. Independent task reviews approved the application source and the final real-build integration test; whole-branch review is pending. This is automated/code evidence, not whole-site visual acceptance.

First-homepage desktop/mobile captures verified local CSS/fonts/images, visible copy, no console errors, and fixed 44px finder controls plus menu Escape/focus restoration. Later tablet/narrow-screen fixes are implemented but have not been recaptured.

Further real-browser testing is blocked by the selected browser's URL security policy. No alternate browser/port or indirect bypass was used. Remaining route-family visual comparisons, complete browser journeys, native keyboard cycling, 200% zoom, browser-storage/network observations and no-JS/reduced-motion browser emulation must not be treated as passed. Static/controller tests complement, but do not replace, those checks.

The host also rewrites HTML response headers: native HTML/HEAD Content-Length and actual CSS network length are tested separately. Browser performance timings/transfer bytes are unavailable; file sizes are not labelled network measurements. No Lighthouse or Web Vitals score is claimed.

The authoritative results and remaining gates are in [QA results](docs/qa/carzone-results.md) and [design QA](design-qa.md).

## Project records

- [Baseline audit](docs/CARZONE-BASELINE.md)
- [Approved design](docs/superpowers/specs/2026-08-31-carzone-modernization-design.md)
- [Implementation plan](docs/superpowers/plans/2026-08-31-carzone-modernization.md)
- [Route-family references and visual system](docs/design/references/design-system.md)
- [Browser checklist](docs/qa/carzone-browser-checklist.md)
- [Implementation decisions and rework costs](docs/qa/implementation-decisions.md)
