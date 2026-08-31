# Carzone modernization baseline

Date: 2026-08-31

## Source and checkout

- Repository: https://github.com/rohanahmed24/Carzone
- Branch: `main`
- Baseline commit: `cc63d101e382666f47f85d2f645da41e1d57ee0c`
- Cloned into a separate `Carzone` directory inside Portfolio Projects. Existing sibling projects were not changed.
- No application changes, Git push, or deployment have been made. This report is the only added source file.

## Existing surface

Static Webflow export: 13 content pages, one placeholder style-guide page, three stylesheets, one exported JavaScript runtime, and 105 local images (approximately 26.2 MB).

Content pages cover the homepage, latest/popular/upcoming listings, new and used car details, specifications, pricing, comparison, valuation, selling a car, reading reviews, and writing a review.

The README describes Webflow CMS work, but this checkout contains hard-coded content, not a retained live inventory data source. No package manifest, build command, or automated test suite is present. Local preview can be served with `python -m http.server 4176 --bind 127.0.0.1` from this directory.

## Source-level findings

1. **Search is not a working inventory query.** All 24 forms lack an explicit action; many filter choices are divs or placeholder links rather than form inputs. The exported runtime routes actionless forms to the old Webflow form service. Its availability was not tested, and no forms were submitted. See `index.html:111`, `latest-cars.html:105`, and the forms module in `js/webflow.js`.
2. **Navigation and CTAs need real destinations.** There are 246 `href="#"` links across content pages. The write-review navigation, detail tabs, and listing price actions include placeholder destinations despite relevant local pages existing. See `write-review.html:45`, `car-details.html:117`, and `latest-cars.html:178`.
3. **Demo inventory is inconsistent.** Listing prices are repeated, homepage budget choices use lakh while listings use dollars, and some selectors retain generic labels. A shared, explicitly illustrative dataset should connect filtering, details, and comparison. Do not present sample prices or specifications as verified market information.
4. **Existing animation is a migration dependency.** Twenty-four elements start with inline zero opacity. Removing the Webflow runtime without replacing its reveal and navigation behavior can hide content. Default content should remain accessible when motion or JavaScript is unavailable. See `index.html:248`, `latest-cars.html:159`, and `write-review.html:109`.
5. **Performance and semantics need attention.** Hero images are lazy-loaded; some originals are 3840/7680 pixels wide, and CSS backgrounds reference multi-megabyte images. Font loading requests all Montserrat weights and italics. HTML documents lack a language attribute and description metadata; 11 of the 13 content pages lack an h1.

All examined local HTML file/asset references and custom-CSS background references resolve to existing files. This checks existence, not complete browser loading, accessibility, or image rights.

## Strengths to retain

- Recognizable red/black identity and local car imagery.
- Existing multi-page URLs and content coverage.
- Responsive image variants and tablet/mobile CSS breakpoints.
- No backend or framework migration is required to make a credible interactive portfolio demo.

## Proposed direction — awaiting approval

Modernize the full site as a cohesive premium automotive experience, using charcoal/red art direction, stronger typography, responsive fluid containers, restrained cinematic motion, and accessible reduced-motion states. Retain useful routes and assets while consolidating shared layout, styling, and vehicle data.

First implementation slice: shared navigation/footer, homepage, inventory filtering, and vehicle details. Follow with connected comparison and transparent local-demo review/sell/valuation flows. No real dealer lead submission, financing service, authentication, or live market valuation is implied. External deployment and Git push are outside this initial pass.

Alternatives to discuss: a lighter visual refresh of the export, or an editable rebuild in the original Webflow project (which would require that project's access). The proposed source-code modernization does not promise round-trip editing in Webflow.

## Verification status

- Git source, branch, and baseline commit verified.
- Static source and local asset references audited.
- Local HTTP server returned the homepage and CSS with status 200.
- The in-app browser could read page content, but repeated preview attempts incompletely applied the local stylesheets despite valid HTTP responses. Visual and responsive QA are therefore **not complete**; this observation is not proof of a source CSS defect.
- No form submission, external write, or production change occurred.
- Implementation, concept generation, build tooling, and browser acceptance testing remain pending design approval.
