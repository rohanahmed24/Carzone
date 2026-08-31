# Carzone design QA

Date: 2026-08-31. Scope: approved static automotive portfolio modernization, fourteen existing routes. Comparison targets are in `docs/design/references/manifest.json` and `docs/design/references/design-system.md`; consolidated direction is `docs/design/carzone-refined-direction.png`.

## Evidence and comparison method

The source references have recorded native raster dimensions and logical desktop/mobile targets. They are generated visual direction, not exact browser exports. Compare source and rendered screenshots together in the same inspection input at matching route, selected data, theme and logical width. Normalize density without stretching aspect ratios. Record factual/accessibility overrides from the reference manifest instead of reproducing generator mistakes.

Initial rendered evidence is in `docs/qa/screenshots/home-{desktop,mobile}-pass1.png`, corresponding pass2 captures, and `home-mobile-top-pass2.png`. Source and rendered captures were opened together for each comparison. Desktop source1374×1145 is compared at logical1440; browser content width1425 after15px scrollbar, pass1 height2201 and pass2 height2023. Mobile source837×1880 is compared at logical390; full-page content capture excludes a15px scrollbar while the focused viewport capture is390×844. No raster is stretched; images are displayed at their native aspect. Density/layout differences from generated reference utility text are explicitly not treated as measured pixel fidelity.

## Required surfaces

| Surface | Status |
|---|---|
| Manrope / Barlow typography, hierarchy, wrapping | Initial home comparison recorded; remaining families blocked |
| Spacing, grids, section rhythm, shapes, responsive layout | Initial home comparison recorded; final responsive recaptures blocked |
| Graphite / white / red tokens, contrast, states | Initial home comparison and source contrast checks recorded; full rendered states blocked |
| Hero / catalogue imagery, crop, proportions, Lucide icons | Initial home comparison recorded; remaining families blocked |
| Exact copy, honest demo content and interactive state | Code/tests reviewed; full browser journey blocked |

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

- [P2, source fix implemented; visual recheck pending] At768px (`docs/qa/screenshots/home-768.png`), the earlier desktop hero treatment cropped the vehicle rear and placed supporting copy over the red car. Commit `132f5f8` adds a copy-first stacked hero, full-aspect contained image and two-column finder at701–1000px. The existing screenshot predates this change; post-fix proportions/crop are unverified.
- [P2, source fix implemented; visual recheck pending] At320px (`docs/qa/screenshots/home-320.png`), the earlier190px logo plus Menu wrapped and CTA text was cramped in two columns. Commit `132f5f8` uses a150px wordmark, one-row enhanced header and stacked CTAs at360px and below, without reducing16px body text. The existing screenshot predates this change; post-fix layout is unverified.

### Final source polish and automated evidence

All fourteen routes, including the production-component style guide, are implemented. Task11 source review approved the responsive changes, nearest-neighbour comparison focus restoration, readable shared CSS and safe optional/reduced-motion behavior. The final `npm run check` passed73/73 tests, built the artifact and passed its independent checker. These results do not substitute for rendered comparisons.

Source-color calculations: red/white5.209:1, muted/white6.852:1, control boundary/white3.479:1, error/white7.072:1, focus blue/white5.266:1 and focus blue/graphite3.559:1. These are intended solid-color pairings, not measurements of every rendered state/background.

## Findings

- The two narrow/tablet homepage findings have code fixes but remain visually unverified.
- Remaining route families and end-to-end interactions are implemented and covered by local tests/code review, but their browser/visual acceptance remains blocked.
- The selected browser explicitly denied further access under its URL security policy. No alternate browser, port, raw automation or indirect workaround was used. Resume rendered checks only when legitimate permitted access becomes available.

## Implementation checklist

- Capture the first working homepage at 1440 and 390 CSS pixels.
- Verify local fonts, stylesheet delivery and native image dimensions.
- Compare full composition plus readable hero/finder/row regions; fix/re-capture any P0/P1/P2 findings.
- Extend the same comparison to every remaining route family and key states.
- Record responsive, keyboard and privacy observations in `docs/qa/carzone-results.md`.

final result: blocked
