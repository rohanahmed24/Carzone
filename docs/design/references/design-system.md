# Carzone implementation reference inventory

The user approved the consolidated direction and written spec, then requested implementation. These ImageGen references are extensions of that decision, not a new round of visual choices. The [manifest](manifest.json) records native dimensions and all observed generator deviations.

## Locked system

- Palette: graphite `#111214`, true white `#ffffff`, red `#d81416`; ink graphite, body-muted `#565b61`, separator `#d9dde1`. No beige surfaces or color wash over photography.
- Typography: Barlow Condensed 600/700 for headings; Manrope 400/500/600/700 for body, navigation and controls. Local WOFF2 files. Body/control minimum16px. Display hero approximately112px desktop and60px mobile; page title72px desktop/48px mobile; section heading48px desktop/36px mobile. Tune within this scale against references, never shrink utility text to make a raster-sized composition fit.
- Space: logical20px mobile gutters, fluid64px desktop; max content1312px. Header80–88px desktop/72px mobile. Desktop hero approximately590px below header, with copy left and car right. Mobile copy and buttons precede a separate full-width image; content drives height.
- Hero treatment: standalone red sedan on dark concrete studio with natural left negative space. No CSS artwork, tinted overlay, screenshot background, invented title badge or decorative proof strip. Hero image is not a named catalogue model.
- Rows: open media/content/actions with thin separators, no surrounding shadow/card grid. Consistent rendered media aspect ratio with contained images, native image proportions preserved. Original dark studio photographs and transparent cutouts stay truthful rather than fabricating new views.
- Buttons: red primary, thin outlined secondary or text link; subtle6px corners,44px minimum targets, visible focus. No red gradients despite slight generated-image tonal variations.
- Icon family: actual Lucide Static outline assets selected to match the reference's thin rounded outline controls (heart, plus/minus, x, menu, arrows, filter sliders, check and chevron).24px visual size,44px interactive area. Preserve the original `logo-light.png` brand asset rather than drawing it.
- Tables: semantic row/column headings, readable16px text, solid white sticky attribute column; dedicated horizontal scroll region at small widths. Selected-car list remains visible.
- Dialogs: native modal semantics, constrained width, scrollable content and focus restoration. Mobile filter drafts remain separate until Apply. Shared saved drawer and enquiry dialog use the same tokens; no fake window chrome.
- Motion: brief420ms hero enhancement, otherwise restrained feedback. Default content visible; reduced-motion immediate.

## Allowed first-view copy and page families

| Family | Exact primary text | Required continuation |
|---|---|---|
| Home | Find your next great drive. / Explore the cars. Understand the differences. Find what fits you. / Explore cars / Compare cars | Find what fits. / A few filters. A clearer shortlist. / Cars to explore / Illustrative listings / Price: low to high / See all twelve / Look closer. / A short path. Local only. / Understand the differences. / Try the other routes. |
| Inventory | Find what fits. / Explore illustrative cars. Build a shortlist that makes sense. | All cars / Latest / Popular / Upcoming; actual result count; filter chips; rows; useful zero-result state |
| Vehicle | Selected record name / Illustrative vehicle / Illustrative listed price · USD / Return to results | Facts; Overview / Specifications / Price / Sample review; typed new/used/upcoming actions |
| Comparison | Understand the differences. / Compare up to three illustrative cars side by side. | Differences only; actual selections; all/equal/missing rows; empty/one/limit states |
| Local forms | Preview an enquiry / Review your preview / Use fictional sample / Finish preview / Edit / Reset | Field errors, review/edit, exact Demo preview only — nothing was sent. |

Shared header: original CARZONE logo, Explore cars, Compare, Sell your car, Saved cars. Mobile menu retains these links and a labeled Menu/Close control. Footer: Demo portfolio. Vehicles, prices and specifications are illustrative. Nothing is sold or submitted here. Include only valid existing-route links, no invented contacts/social destinations.

## States extending the references

Inventory zero state: “No cars match these filters.” Clear filters button plus individually removable chips. Numeric upcoming budget: “Unknown prices are excluded by this budget.” Popular: “Editorial sample selection.” Mobile draft cancellation restores current filters/results.

Vehicle not-found: “Vehicle not found” with Return to results and Explore cars, no silently selected fixture. Unknown values: “Not provided”; upcoming price “Price not announced” and “Launch timing unconfirmed”. Upcoming has specifications/save/compare, no enquiry or reservation.

Saved empty: “No saved cars yet” and Explore cars. Compare empty: “Choose cars to compare”; one: “Add another car to compare differences”; equal values: “No differences in the displayed sample facts.” Fourth selection: “Compare up to three cars.” Remove provides Undo without overwriting later choices.

Forms: build one active step at a time. Reuse the reference's label/input/error/summary/button language for seller fields, review fields and valuation information. Valuation is educational, no numeric estimate. No uploads, exports, real bookings or deliveries.

## Prompt set and production inputs

Built-in ImageGen was used, with the consolidated PNG attached as visual-language reference to every route-family request. Desktop requests named a1440px logical canvas, exact copy/data and open white layouts. Mobile requests named390px logical width, single-column flow,16px readable body and44px controls. Actual generated sizes differ and are preserved without stretching.

- Home desktop: red sedan dark-studio hero, full header and two CTAs, white New/Used finder, blue City$22,500 then red Sport$28,900 rows, empty selections, demo footer.
- Home mobile: strict copy/buttons → separate car image → full-width finder → stacked vehicle row. An initial two-column mobile generation was rejected and not copied into this directory.
- Inventory desktop: All/Latest/Popular/Upcoming, Used+Sedan chips, price ascending, two actual matches, save/compare/detail actions. Mobile: filter draft overlay with Close/Clear/Apply, no immediate committed changes.
- Vehicle desktop/mobile: selected used City record, source-photo image, price/facts, sample history, save/compare/local enquiry and existing-route tab links; mobile single-column.
- Comparison desktop: three selected vehicles with true sample values, all rows and differences switch. Mobile: fixed attributes with horizontal car columns and visible all-three selections, never page-wide overflow.
- Forms desktop: explicitly separated input/review/error examples with fictional values. Mobile: one review state, Edit/Finish/Reset and unsent disclosure.
- Production hero: red sport sedan three-quarter front facing left, dark concrete studio, car on right60%, dark copy space left40%, natural highlights/reflection, no UI/text/logos/people/red wash; follow-up removed emblem-like marks.
- Production SUV: dark-green unbranded family SUV, front three-quarter facing right, pale neutral studio, whole body/wheels, soft contact shadow, no people/text/logos.
- Production wagon: silver unbranded long-roof wagon, same catalogue treatment and full-body framing, no people/text/logos.

Production sources are in `assets/source/`, original selected sources remain in `images/`, and only encoded allowlisted derivatives belong in the built application. Reference PNGs are review documentation, never UI assets. See [asset provenance](../../../assets/provenance.md).
