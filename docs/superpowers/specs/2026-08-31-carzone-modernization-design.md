# Carzone: cinematic discovery, practical decisions

Date: 2026-08-31. Status: recommended direction accepted in principle; consolidated visual and written specification ready for user review. No application implementation or deployment is included in this design pass.

## Decision

Combine the cinematic identity of **Redline Studio** with the clear inventory interaction of **Find Your Fit**. Use one typography, spacing, color, and component system across the existing site. Defer **Decision Garage**'s guided questionnaire until the core buyer journey is complete and separately requested.

The product promise is: **Find a suitable car, understand the differences, and make a considered choice.** This is an English-language automotive portfolio demo, not a real dealership or live marketplace.

The refined homepage visual is [the consolidated concept](../../design/carzone-refined-direction.png). It defines the primary visual language and homepage composition, not a claim that the other routes have already been visually designed or implemented. Existing source evidence is recorded in [the baseline audit](../../CARZONE-BASELINE.md).

The generated image's actual size is **918 × 1714 pixels**, rather than the requested 1440px-wide composition. It is a full-page direction reference, not a verified 1:1 desktop export. Do not stretch it into a background or claim pixel fidelity at a different viewport; obtain the matching desktop/mobile section references before implementation.

## Buyer journey

**Explore → filter → save → compare → inspect details → preview an enquiry.**

People who already know what they want can start filtering immediately. People browsing for inspiration get a cinematic introduction and a curated entry point. No login is required. Returning from a detail page preserves the originating filters and ordering.

Success means the visitor can complete this journey with consistent data and useful empty/error states. The design must not depend on a chatbot, an invented match score, or simulated dealer activity.

## Visual system

- Preserve the recognizable CARZONE wordmark and red accent `#d81416`.
- Use graphite `#111214` for the hero and restrained dark bands; use true white `#ffffff` for browsing and reading. Do not substitute beige or apply a red wash to all imagery.
- Use Barlow Condensed for display headings and Manrope for body/controls, with licensed local font files and usable fallbacks. Body and form text start at 16px; labels must remain readable.
- Use fluid gutters around 20px on phones and 64px on the reference desktop, with a wide but bounded content area. Keep dense reading text narrower than the image-led sections.
- Favor open rows, deliberate whitespace, and light dividers. Use subtle corners and very few shadows. Avoid nested cards, generic dashboard blocks, and ornamental badges.
- Use actual vehicle imagery with stable aspect ratios and accurate subject labels. Do not imply multi-angle galleries or 360-degree viewing when the available assets do not support them.
- Initial homepage state has no pre-saved or pre-compared cars. The generated concept's vehicle prices and specifications are illustrative design fixtures.

### Homepage composition

1. Dark shared header: logo, Explore cars, Compare, Sell your car, Saved cars.
2. Cinematic hero: "Find your next great drive." and "Explore the cars. Understand the differences. Find what fits you." Primary Explore cars scrolls to the finder; secondary Compare cars opens the comparison route with its real empty/filled state.
3. White finder: "Find what fits." with New/Used, budget, body type, and Find cars. Submission navigates to the inventory route with selected values in the URL.
4. Curated inventory preview: "Cars to explore", representative sample cars, visible sample-data disclosure, Save controls, and View details. Preview ordering must match the displayed sort label.
5. Shared restrained footer with honest portfolio disclosure and working existing-route links. No fabricated contact information or social destinations.

The refined concept intentionally removes the earlier Help me choose link because the guided questionnaire is deferred. It also normalizes blue City sedan / red Sport sedan identity and low-to-high price ordering, which were inconsistent in the earlier generated options.

## Whole-site scope and route compatibility

All existing `.html` entry points remain directly accessible. The modernization is not limited to the hero. Shared styling and navigation apply to every route; distinct page content must remain meaningful rather than becoming aliases of the homepage.

| Existing route | Role in the modernized experience |
| --- | --- |
| `index.html` | Cinematic entry, finder, curated inventory, shared footer |
| `latest-cars.html` | Main inventory experience; Latest is the default editorial view, with an All cars view |
| `popular-cars.html` | Same catalogue system with an explicitly editorial Popular selection |
| `upcoming-cars.html` | Upcoming model concepts, not available stock or reservation offers |
| `car-details.html` | New model detail, sample facts, save/compare, local enquiry preview where appropriate |
| `used-car-details.html` | Used listing detail with separate sample mileage/condition fields |
| `car-specification.html` | Grouped specifications for the selected vehicle |
| `car-price.html` | Clearly illustrative listed price and assumptions; no invented loan or tax quote |
| `compare-car.html` | Two or three selected vehicles, full/differences-only comparison |
| `sell-your-car.html` | Accessible local-only listing draft and review step; nothing published |
| `car-valuation.html` | Educational valuation factors and a local vehicle-information summary; no price estimate or dealer offer |
| `car-review.html` | Clearly labeled sample editorial/review content for the chosen vehicle |
| `write-review.html` | Local review preview with validation; nothing submitted or persisted |
| `style-guide.html` | Actual tokens and reusable UI/state examples, not an empty placeholder |

No new top-level routes, account system, payment flow, or admin dashboard are required. Saved cars opens a shared accessible drawer with View details, Remove, and an explicit Add to compare control for each saved vehicle; an empty state links back to inventory.

## Data and state contracts

### Vehicle data

Maintain one static, validated catalogue containing at least twelve distinct illustrative vehicles spanning new, used, and upcoming status and enough body styles/prices to exercise filters. Each record has a stable ID, display name, availability, body type, powertrain, transmission, nullable price in USD, image/alt text, and optional specification groups. Used vehicles additionally have explicitly sample mileage, condition, and ownership fields. Reviews and editorial category membership reference the same IDs.

The same ID must render the same core facts on every page. Missing values display Not provided, not zero. Do not invent technical accuracy for source images; fixtures remain explicitly illustrative. Currency is USD throughout and distance units are kilometres. Upcoming models use Price not announced and Launch timing unconfirmed, do not appear as purchasable stock, and offer specification/compare actions rather than enquiry/reservation claims. Popular is editorial sample selection, not a live popularity ranking.

### URLs and filter behavior

Vehicle pages use `?car=<stable-id>`. A bare legacy route selects a documented representative fixture appropriate to that route. An explicitly invalid ID produces a useful not-found state; it must not silently display a different vehicle. Generated links use the new detail route for new records, the used detail route for used records, and specifications for upcoming records. If a valid explicit ID is opened on another detail filename, render that same vehicle's correctly typed content and allowed actions rather than replacing the selected record; preserve the return-to-results context.

Inventory uses validated `view`, `condition`, `budget`, `body`, and `sort` query parameters. Its route supplies a default view only when the URL does not specify one. Find cars from the homepage sets `view=all`. Unsupported filter values fall back safely and are not rendered as HTML. Filters, sort order, browser back/forward, and the return-to-results link remain consistent. Numeric budget filters exclude unknown prices; the UI explains this on upcoming views. Empty results offer Clear filters and individually removable active filters.

### Saved and compared cars are distinct

Save is a device-local shortlist with no three-car limit; it can hold any valid catalogue IDs. Compare is a separate ordered selection of up to three IDs. A fourth compare selection explains the limit without replacing an existing car. Saving does not silently select for comparison. The compare tray appears only after an explicit compare selection and links to the comparison route.

Only vehicle IDs, compare IDs, and non-sensitive display preferences may persist locally. Storage writes are guarded; unavailable/corrupt storage falls back to memory with an honest notice. Stale catalogue IDs are discarded. Remove actions offer undo. Enquiry, review, and seller content are not persisted.

Comparison accepts a validated `cars` list in the URL when present; otherwise it uses the device selection. Duplicates are removed, the first three valid IDs retain order, and discarded invalid IDs produce a notice. One-car and empty states invite the user to add another. Numeric comparisons normalize units. Differences-only hides rows only when all compared values are equal; all-missing rows count as equal, while known-versus-missing remains visible. Explain when no differences remain.

Opening a shared comparison URL does not overwrite the visitor's stored device selection. Explicit additions/removals update both the current URL and the device selection so reload preserves the user's edit. A present but empty `cars` parameter means an intentionally empty comparison, not permission to restore an older device selection.

## Architecture and migration boundaries

Retain the static multi-page deployment model and existing route compatibility. Share header/footer/page-shell and repeated vehicle markup at build time; use focused browser modules for behavior. A backend and a framework migration are unnecessary for this scope. Exact tooling and package versions belong to the implementation plan, not this visual decision.

| Unit | Responsibility and boundary |
| --- | --- |
| Catalogue and schema | Own vehicle records, editorial groups, and fixture validation; independent of DOM/storage |
| Query/filter helpers | Parse/serialize URL state; pure filtering, sorting, and result counts |
| Saved/compare store | Validate IDs, enforce compare limit, guarded device persistence; no form content |
| Shared shell and UI primitives | Navigation, buttons, inputs, vehicle row, drawer, notices, footer |
| Route controllers | Compose page-specific DOM from the shared data and helpers; no copied business rules |
| Local preview forms | Validation, review step, edit/reset controls; no network submission |
| Motion layer | Progressive enhancement; never owns essential visibility, navigation, or state |

Replace the legacy Webflow form submission handler before any form interaction tests. Replace its navigation, sliders, and reveal behavior deliberately before removing the runtime; do not leave elements at inline opacity zero. Preserve original source/assets in Git history and maintain image provenance. Do not claim that source-code changes round-trip into the original Webflow editor.

Pages must serve readable headings, navigation, and representative route content without JavaScript. With JavaScript unavailable, forms and interactive search/compare clearly explain their limitation and cannot fall through to an external or accidental GET submission.

## Local-only form behavior

The buyer enquiry opens in the selected vehicle's context, validates fields, provides a review/edit step, and ends with **Demo preview only — nothing was sent.** Seller and review flows follow the same contract with listing/review-specific fields. Provide fictional sample values so reviewers need not enter personal information. Closing, resetting, or reloading clears entered personal/free-text content.

Do not call the old Webflow endpoint, email services, analytics, or any third-party form receiver. Do not use Message sent, Listing published, Review submitted, reservation success, or equivalent misleading confirmations. Photo upload, file export, and contact-data storage are outside scope.

## Responsive design, motion, and accessibility

On narrow screens, stack the hero with readable copy first and a correctly cropped car image; move navigation into a labeled, keyboard-operable menu. Finder fields become full-width controls. Inventory rows stack into coherent vehicle summaries without shrinking captions. Filter drawers preserve drafts until Apply and restore focus when closed.

Mobile comparison uses a dedicated horizontally scrollable semantic table with visible scroll affordance and a persistent attribute column. Do not create page-wide overflow or silently drop a selected car. Sticky action areas reserve space and respect safe-area insets.

Use one brief hero entrance and restrained image/row transitions with no scroll hijacking, autoplay carousel, or blocking intro. Reduced-motion users get immediate content and state changes. Keyboard focus, field errors, result/status announcements, drawer focus containment, Escape dismissal, readable contrast, and approximately 44px touch targets are acceptance requirements. Core layout must remain usable at 200% zoom.

## Delivery sequence and acceptance

The implementation plan will divide this single frontend product into coherent slices, not separate backend subsystems: shared foundation/home; inventory/details; save/compare; secondary existing routes/forms; whole-site verification. This sequence does not reduce the final whole-site scope.

Before coding each distinct route family, create a readable matching visual reference extending the consolidated system. The current homepage concept alone is not sufficient visual specification for comparison, long details, or form states. Generate standalone matching assets when the approved image treatment cannot be achieved with the existing source assets.

Required checks:

1. All fourteen legacy HTML paths load; real links have valid destinations and no unfinished `#` actions remain.
2. Catalogue schema, filters, sorting, query round-trips, invalid IDs, storage failures, compare limits, and missing-value semantics have automated tests.
3. End-to-end buyer flow works on desktop and mobile, including browser back/forward, zero results, empty/one/three-car comparison, undo, and unsent enquiry confirmation.
4. Form network checks prove no submission to Webflow or another receiver; reload/storage checks prove contact and free-text values are not retained.
5. Browser visual review compares each implemented surface with its matching reference, including typography, colors, copy, imagery, spacing, mobile behavior, and interaction states. The prior browser stylesheet-loading limitation must be resolved or clearly reported, not counted as a successful visual check.
6. Verify at 1440px desktop, approximately 768px tablet, and 390px mobile, plus narrow-width and zoom checks. Resolve console errors, missing images, and unintended page overflow.
7. Optimize hero derivatives, image loading, and font weights; record measured results rather than promising unmeasured performance scores. Only the lead hero is eager/high priority; below-fold media is lazy-loaded.
8. README explains Webflow origins, the modernized implementation, local setup, tested scope, and the portfolio/demo boundary. No production push or deployment without a separate request.

## Deferred work

Guided finder, AI assistant, live valuations, dealer inventory feeds, accounts, cross-device sync, payments, financing approvals, genuine appointment booking, real form delivery, verified reviews/history, and 360-degree viewing are not part of this pass.

## Review record

The user accepted following the recommendation rather than choosing a numbered mockup. The recommendation has therefore been made explicit here as a cinematic homepage plus a practical inventory journey, not an unrequested combination of every feature. Independent scope review clarified route fallbacks, upcoming status, separate save/compare state, and genuinely local-only forms. The specification and refined visual still require the written-spec review step before implementation planning.
