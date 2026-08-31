import {escapeHtml as e} from './escape.mjs';

const navLinks=()=>`<a href="latest-cars.html?view=all">Explore cars</a><a href="compare-car.html">Compare</a><a href="sell-your-car.html">Sell your car</a>`;
const brand=()=>`<a class="brand" href="index.html" aria-label="Carzone home"><img src="/assets/brand/carzone-logo.png" width="300" height="47" alt="CARZONE"></a>`;
export function renderShell(page) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'">
<title>${e(page.title)} | Carzone</title><meta name="description" content="${e(page.description)}">
<link rel="preload" href="/assets/fonts/barlow-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
${['tokens','base','shell','home'].map(name=>`<link rel="stylesheet" href="/assets/styles/${name}.css">`).join('\n')}
<script type="module" src="/assets/browser/main.mjs"></script></head>
<body data-controller="${e(page.controller)}"><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="container header-inner">${brand()}<nav class="desktop-nav" aria-label="Main navigation">${navLinks()}<button type="button" class="saved-toggle" data-open-saved disabled><span class="icon icon-heart" aria-hidden="true"></span>Saved cars (<span data-saved-count>0</span>)</button></nav><button type="button" class="menu-toggle" data-open-menu disabled hidden aria-haspopup="dialog"><span class="icon icon-menu" aria-hidden="true"></span>Menu</button></div></header>
<main id="main">${page.body}</main>
<footer class="site-footer"><div class="container footer-inner"><div>${brand()}<p>Demo portfolio. Vehicles, prices and specifications are illustrative. Nothing is sold or submitted here.</p></div><nav aria-label="Footer navigation">${navLinks()}</nav></div></footer>
<noscript><div class="container no-script">Representative content and links work without JavaScript. Filtering, saving, comparing and form previews require JavaScript.</div></noscript>
<dialog id="saved-dialog" aria-labelledby="saved-title"><div class="dialog-heading"><h2 id="saved-title">Saved cars</h2><button type="button" data-close-dialog aria-label="Close saved cars"><span class="icon icon-x" aria-hidden="true"></span>Close</button></div><div data-saved-list><h3>No saved cars yet</h3><p>Keep a shortlist on this device.</p><a href="latest-cars.html?view=all">Explore cars</a></div></dialog>
<dialog id="mobile-menu" aria-labelledby="menu-title"><div class="dialog-heading"><h2 id="menu-title">Menu</h2><button type="button" data-close-dialog><span class="icon icon-x" aria-hidden="true"></span>Close</button></div><nav aria-label="Mobile navigation">${navLinks()}<button type="button" data-open-saved disabled>Saved cars (<span data-saved-count>0</span>)</button></nav></dialog>
<aside class="compare-tray" data-compare-tray hidden aria-label="Selected cars for comparison"><div data-compare-list></div><a class="button" href="compare-car.html">Compare cars</a></aside>
<div class="status" role="status" aria-live="polite" data-status></div></body></html>`;
}
