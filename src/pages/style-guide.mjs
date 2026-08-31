import {getVehicle} from '../domain/catalogue.mjs';
import {vehicleRow} from '../ui/vehicle-row.mjs';
import {compareContent} from '../ui/compare.mjs';

// Reuse production markup without binding these labelled static examples to state.
function staticExample(html) {
  return html.replace(/\sdata-[\w-]+(?:="[^"]*")?/g,'')
    .replace(/<(button|input|select)\b([^>]*)>/g,(_match,tag,attributes) =>
      `<${tag}${attributes.replace(/\sdisabled\b/g,'')} disabled>`);
}

export function renderStyleGuide() {
  return {
    title:'Carzone style guide',
    description:'The actual Carzone colors, typography, spacing and accessible component examples used throughout this illustrative portfolio.',
    controller:'style-guide',
    body:`<div class="container style-guide">
      <header><p class="eyebrow">The shared design system</p><h1>Style guide</h1><p>Real components, local fonts and shared tokens. Examples are labelled and disabled; navigation links open their real destinations.</p></header>
      <section aria-labelledby="guide-colors"><h2 id="guide-colors">Colors</h2>
        <ul class="guide-swatches">
          <li><span class="guide-swatch guide-red"></span>Accent red <code>--red: #d81416</code></li>
          <li><span class="guide-swatch guide-graphite"></span>Graphite / ink <code>--graphite / --ink: #111214</code></li>
          <li><span class="guide-swatch guide-paper"></span>True white <code>--paper: #ffffff</code></li>
          <li><span class="guide-swatch guide-muted"></span>Muted text <code>--muted: #565b61</code></li>
          <li><span class="guide-swatch guide-line"></span>Decorative separator <code>--line: #d9dde1</code></li>
          <li><span class="guide-swatch guide-border"></span>Control boundary <code>--control-border: #858a90</code></li>
        </ul><p>Red text belongs on white, not graphite. Light separators are decorative; inputs use the darker control boundary.</p>
      </section>
      <section aria-labelledby="guide-type"><h2 id="guide-type">Typography</h2>
        <h3>Barlow Condensed · 700 · Find what fits.</h3><p class="guide-heading-medium">Barlow Condensed · 600 · Illustrative listed price</p>
        <p>Manrope · 400 · Explore the cars. Understand the differences. Find what fits you.</p>
        <p class="guide-medium">Manrope · 500 · View details</p><p class="guide-semibold">Manrope · 600 · Explore cars</p><p class="guide-bold">Manrope · 700 · $22,500</p>
        <p>Body and controls start at 16px. Page headings use 72px / 48px; section headings use 48px / 36px across desktop / mobile.</p>
      </section>
      <section aria-labelledby="guide-space"><h2 id="guide-space">Spacing</h2><p>20px mobile gutters grow to 64px; content is capped at 1312px. Components share a 6px radius and at least 44px control targets.</p>
        <dl class="guide-spacing"><div><dt>Small separation</dt><dd>8px</dd></div><div><dt>Control gap</dt><dd>16px</dd></div><div><dt>Row padding</dt><dd>24px</dd></div><div><dt>Section space</dt><dd>48px</dd></div></dl>
      </section>
      <section aria-labelledby="guide-buttons"><h2 id="guide-buttons">Buttons and focus</h2><p>Disabled visual examples. Tab to the real catalogue link to inspect the shared visible focus outline.</p>
        <div class="guide-actions"><button class="button" type="button" disabled>Primary example</button><button type="button" disabled>Secondary example</button><a class="details-link" href="latest-cars.html?view=all">Explore the catalogue</a></div>
      </section>
      <section aria-labelledby="guide-forms"><h2 id="guide-forms">Form states</h2><p>Static field examples — no information can be entered or submitted here.</p>
        <div class="preview-field"><label for="guide-name">Name — default example</label><input id="guide-name" value="Alex Example" disabled></div>
        <div class="preview-field"><label for="guide-email">Email — error example</label><input id="guide-email" type="email" value="alexexample.test" aria-invalid="true" aria-describedby="guide-email-error" disabled><p id="guide-email-error" class="error">Enter a valid email address.</p></div>
      </section>
      <section aria-labelledby="guide-row"><h2 id="guide-row">Vehicle row</h2><p>Static example with disabled selection buttons and working vehicle links.</p>${staticExample(vehicleRow(getVehicle('city-sedan')))}</section>
      <section aria-labelledby="guide-status"><h2 id="guide-status">Empty and status</h2><p class="form-privacy">Notice example: Demo preview only — nothing was sent.</p><div class="compare-empty"><h3>Choose cars to compare</h3><p>Add up to three cars, or explore the catalogue.</p><a href="compare-car.html">Open comparison</a></div></section>
      <section aria-labelledby="guide-comparison"><h2 id="guide-comparison">Comparison</h2><p>Static comparison example. Selection controls are disabled; scroll the real semantic table to inspect all columns.</p>${staticExample(compareContent(['city-sedan','sport-sedan','family-suv'],false))}</section>
    </div>`,
  };
}
