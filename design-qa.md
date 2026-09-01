# Carzone design QA

Date: 2026-08-31. Scope: approved static automotive portfolio modernization, fourteen existing routes. Comparison targets are in `docs/design/references/manifest.json` and `docs/design/references/design-system.md`; consolidated direction is `docs/design/carzone-refined-direction.png`.

## Evidence and comparison method

The source references have recorded native raster dimensions and logical desktop/mobile targets. They are generated visual direction, not exact browser exports. Compare source and rendered screenshots together in the same inspection input at matching route, selected data, theme and logical width. Normalize density without stretching aspect ratios. Record factual/accessibility overrides from the reference manifest instead of reproducing generator mistakes.

Initial rendered evidence is in `docs/qa/screenshots/home-{desktop,mobile}-pass1.png`, corresponding pass2 captures, and `home-mobile-top-pass2.png`. Source and rendered captures were opened together for each comparison. Desktop source1374×1145 is compared at logical1440; browser content width1425 after15px scrollbar, pass1 height2201 and pass2 height2023. Mobile source837×1880 is compared at logical390; full-page content capture excludes a15px scrollbar while the focused viewport capture is390×844. No raster is stretched; images are displayed at their native aspect. Density/layout differences from generated reference utility text are explicitly not treated as measured pixel fidelity.

## Required surfaces

| Surface | Status |
|---|---|
| Manrope / Barlow typography, hierarchy, wrapping | Home 1440/768/390/320 recaptured; remaining family pairing unfinished |
| Spacing, grids, section rhythm, shapes, responsive layout | Task11 home 768/320 passed; compare-tray overlap is an open P2 |
| Graphite / white / red tokens, contrast, states | Home comparison plus source contrast; warning/toast states observed as P2 |
| Hero / catalogue imagery, crop, proportions, Lucide icons | Home recaptures inspected; other families captured but not fully paired |
| Exact copy, honest demo content and interactive state | Listed journeys run; whole-site pairing not claimed |

## Comparison history

### Home pass1 → pass2

- [P2, fixed] Mobile finder select hit areas were32px instead of44px. Native control heights were measured from the rendered DOM. Updated CSS gives44px; reloaded pass2 capture and measurements confirm the fix. Wrapper outlines now use #858a90, while decorative separators remain lighter.
- [P2, fixed] Desktop media made the three preview rows overly tall for scanning. Capped contained desktop media at200px; pass2 preserves full subjects and reduces full page height2201→2023 without shrinking text.
- [P2, fixed] The host's injected Escape event did not trigger default native dialog dismissal. Explicit scoped Escape/cancel handlers were added; reloaded browser retest observed openDialogs0 and activeElement Menu after Escape. Close-button focus restoration also passed.
- Fonts: browser computed Manrope16px and Barlow Condensed (mobile h1 60px), both font checks true. Generated reference display lettering is more compressed than the mandated font/token scale; actual local approved typefaces are authoritative.
- Layout: copy precedes a separate full-width car image on mobile; desktop image is right with usable left copy space. Open separated rows, full-width mobile finder and original wordmark are retained. Required three preview cars, readable16px utilities and44px controls deliberately add height relative to the generated compressed two/one-row references.
- Colors/assets/copy: exact graphite/white/red tokens, standalone unbranded red sedan, unchanged blue City source with dark studio background, original red Sport source, generated green SUV. Hero is not relabelled as a catalogue model. No gradient wash, CSS art, fabricated gallery or fake icons. Exact headline/finder/demo copy and ascending prices are present.
- Focused mobile header/hero/finder capture confirms readable hierarchy, complete vehicle crop and legible real Lucide menu icon. The full-view desktop capture keeps header, hero, finder, all rows and footer visibly inspectable.

Remaining inventory, vehicle, comparison and forms captures must each be paired with their references. Whole-site acceptance is not yet claimed.

### Additional viewport findings for Task11

- [P2, visually recaptured 2026-09-01] At768px (`docs/qa/screenshots/home-768.png`), post-`132f5f8` layout is copy-first stacked hero, overlap area 0, full-aspect contained image, two-column finder. Header remains one row with Menu.
- [P2, visually recaptured 2026-09-01] At320px (`docs/qa/screenshots/home-320.png`), 150px wordmark, nowrap enhanced header, stacked CTAs, 16px body, overflowX 0.

### Final source polish and automated evidence

All fourteen routes, including the production-component style guide, are implemented. Task11 source review approved the responsive changes, nearest-neighbour comparison focus restoration, readable shared CSS and safe optional/reduced-motion behavior. After the final review fix wave, `npm run check` passed78/78 tests, built the artifact and passed its independent checker. These results do not substitute for rendered comparisons.

The final source fix wave adds an enduring storage-warning surface and page-level Undo for saved-toggle removals. 2026-09-01 rendered both: Undo at 1440 sits below the header with a 44px control and restores focus to Save. The warning at 1440/320 wraps without overflow but is unpadded graphite text and is duplicated by the status toast (open P2). Page-level Undo at 320 is not sticky, so a mid-list toggle leaves the control off-screen (open P2).

Source-color calculations: red/white5.209:1, muted/white6.852:1, control boundary/white3.479:1, error/white7.072:1, focus blue/white5.266:1 and focus blue/graphite3.559:1. These are intended solid-color pairings, not measurements of every rendered state/background.

### 2026-09-01 family captures (working notes, not a finished pairing)

Playwright captured inventory, vehicle, compare and forms at 1440/390 plus extra 768/320 notes. These were inspected for overflow, copy and the compare-tray overlay. They were **not** scored line-by-line against every manifest raster in one inspection input. Whole-site visual acceptance is not claimed.

Open P2 from rendered captures:

- Compare tray covers comparison-table rows and the last inventory row (`compare-desktop.png`, `compare-mobile.png`, `compare-320.png`).
- Storage warning + status toast duplication (`storage-warning-desktop.png`, `storage-warning-320.png`).
- Page-level Undo easy to miss at 320 after a scrolled save click (`page-saved-undo-320.png` shows the row, not the top bar).

## Findings

- Task11 home 768/320 defects are visually resolved in the 2026-09-01 recaptures.
- Buyer/inventory/saved-compare/forms/keyboard journeys were run against `dist/`; see `docs/qa/carzone-results.md`.
- Three P2 visual issues remain unfixed. Family reference pairing was not finished. This follow-up was stopped before further recaptures.

## Implementation checklist

- Capture the first working homepage at 1440 and 390 CSS pixels.
- Verify local fonts, stylesheet delivery and native image dimensions.
- Compare full composition plus readable hero/finder/row regions; fix/re-capture any P0/P1/P2 findings.
- Extend the same comparison to every remaining route family and key states.
- Record responsive, keyboard and privacy observations in `docs/qa/carzone-results.md`.

final result: incomplete — Task11 home recaptures and listed journeys done; whole-site pairing and P2 fixes not done
