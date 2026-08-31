# Task 11 implementation report

Status: DONE_WITH_CONCERNS — source work complete; browser visual/responsive acceptance blocked by the controller-reported URL security policy. No browser calls, alternate ports or automation were attempted.

## Implemented

- Added the substantive style-guide route and exact fourteen-route registry. Metadata is unique and nonempty; all route bodies have one h1.
- The guide demonstrates actual shared palette variables, both local font families and available weights, spacing, buttons and focus, disabled fields, validation, notice, empty state, catalogue vehicle row and semantic comparison table. Row/table examples reuse production renderers; static-example transformation strips state hooks and disables controls. Working links lead to existing routes.
- Added footer utility links to educational valuation and the style guide.
- Kept DOM content visible by default. Motion checks reduced-motion support/preference before the single 420ms hero enhancement; absent APIs are safe. Added brief color transitions with reduced-motion override.
- Formatted compressed tokens/base/shell/home CSS as readable rules/declarations.
- Source fixes for known QA findings: tablet 701–1000px copy-first hero with full contained image and two-column finder; <=360px 150px wordmark with one-row enhanced header and stacked CTAs. No-JS navigation remains visible. Vehicle row name/price wrapping, narrow action stacking, wrapping inventory tabs and shrinkable vehicle-title grid cell address source-visible overflow risks without reducing 16px body/control text.
- Scoped Task9 minor: removal restores focus to the next nearest surviving car, or previous at the end, or add selector when empty, retaining the surviving active control where possible.
- Existing comparison scroll containment, safe-area tray padding and single-column mobile forms were retained; no unsupported new visual defects were invented.

## TDD evidence

RED: `node --test tests/home.test.mjs tests/compare-page.test.mjs` before implementation: 14 tests, 11 pass, 3 fail.

- Registry equality expected `style-guide.html` but the actual thirteen routes omitted it.
- Middle-car removal expected `family-suv` focus but actually focused `city-sedan`.
- Optional-motion test threw `doc.defaultView.matchMedia is not a function` when support was absent.

GREEN: same command after implementation: 14 tests, 14 pass, 0 fail. Covers all first/middle/last removals and last-car selector fallback, exact registry, unique metadata, real component examples, disabled static controls, footer reachability and reduced-motion behavior.

## Verification

- `npm test`: 73 tests, 73 pass, 0 fail (full suite run once after implementation; includes controller-owned artifact test updates present in the shared worktree).
- `npm run build`: `Carzone built to dist.`
- `node scripts/check-artifact.mjs`: `Artifact verification passed.`
- `git diff --check`: no whitespace errors. Git prints existing LF/CRLF normalization notices; test/build output has no failing diagnostics.
- Numerical sRGB relative-luminance calculations from source hex tokens: red/white 5.209:1; muted/white 6.852:1; control boundary/white 3.479:1; error/white 7.072:1; focus blue/white 5.266:1 and focus blue/graphite 3.559:1. These validate intended solid-color pairings, not every rendered state/background.

## Visual evidence and remaining acceptance

Read root `design-qa.md`, the complete reference manifest and design-system document. Viewed all ten desktop/mobile family references. Inspected home desktop/mobile reference images together with existing home-768.png and home-320.png before CSS changes.

- Typography: mandated Manrope/Barlow and readable 16px controls remain authoritative over compressed generated reference text.
- Imagery: source tablet capture showed rear clipping and copy overlapping red bodywork. Tablet source now uses a separate full-aspect contained image. Existing mobile source/crop remains unchanged; no fabricated vehicle view or tinted overlay was introduced.
- Spacing: narrow capture showed header wrapping and cramped two-column actions. Source now preserves a one-row enhanced header and stacked narrow CTAs. Post-fix proportions are not measured yet.
- Copy/colors/state: exact home/demo language, true catalogue facts, red/white/graphite tokens, empty initial selection, no-JS navigation, unknown-value conventions and separate local-only selection semantics are retained. Generated invented counts/vehicle facts are not reproduced.

Post-fix captures are pending. All fourteen routes still require browser checks at 1440/768/390/320 and 200% zoom, keyboard/state checks, and paired source/render comparison for the remaining families. No claim of whole-site visual QA passing is made. Did not edit design-qa.md, README, QA results or controller-owned artifact tests.

## Files changed

`src/pages/style-guide.mjs`, `src/pages/registry.mjs`, `src/browser/motion.mjs`, `src/browser/compare.mjs`, `src/ui/shell.mjs`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/shell.css`, `src/styles/home.css`, `src/styles/inventory.css`, `src/styles/vehicle.css`, `tests/home.test.mjs`, `tests/compare-page.test.mjs`, this report.

## Self-review

Confirmed scope stays static and local-only; guide controls have no mutation bindings; semantic table links/scroll region remain useful; no new dependencies or external actions. CSS changes are source-verified but explicitly not browser-verified. Commit pending serialized controller turn.
