import {getVehicle} from '../domain/catalogue.mjs';
import {vehicleRow} from '../ui/vehicle-row.mjs';

export function renderHome() {
  return {title:'Find your next great drive',description:'Explore illustrative cars, understand the differences, and find what fits you. A Carzone portfolio demo.',controller:'home',body:`
<section class="hero" aria-labelledby="hero-title">
  <picture class="hero-picture"><source type="image/webp" srcset="/assets/media/hero-640.webp 640w, /assets/media/hero-960.webp 960w, /assets/media/hero-1440.webp 1440w, /assets/media/hero-1920.webp 1672w" sizes="(max-width: 700px) 150vw, 100vw"><img src="/assets/media/hero-1920.webp" width="1672" height="941" alt="Red sports sedan in a dark editorial studio" loading="eager" fetchpriority="high"></picture>
  <div class="container hero-content"><h1 id="hero-title">Find your next great drive.</h1><p>Explore the cars. Understand the differences. Find what fits you.</p><div class="hero-actions"><a class="button" href="#finder">Explore cars</a><a class="hero-compare" href="compare-car.html">Compare cars</a></div></div>
</section>
<section class="container finder-section" id="finder" aria-labelledby="finder-title"><h2 id="finder-title">Find what fits.</h2><p class="section-intro">A few filters. A clearer shortlist.</p>
  <form data-finder><fieldset disabled><legend class="sr-only">Find cars by condition, budget and body style</legend><div class="condition-control"><label><input type="radio" name="condition" value="new"><span>New</span></label><label><input type="radio" name="condition" value="used" checked><span>Used</span></label></div>
  <label class="finder-select">Budget<select name="budget"><option value="any">Any budget</option><option value="25000">Under $25,000</option><option value="40000">Under $40,000</option><option value="60000">Under $60,000</option></select></label>
  <label class="finder-select">Body style<select name="body"><option value="any">Any body</option><option value="sedan">Sedan</option><option value="coupe">Coupe</option><option value="hatchback">Hatchback</option><option value="suv">SUV</option><option value="wagon">Wagon</option></select></label><button class="button" type="button" data-find>Find cars</button></fieldset></form>
</section>
<section class="container featured-section" aria-labelledby="featured-title"><div class="section-heading"><div><h2 id="featured-title">Cars to explore</h2><p>Illustrative listings</p></div><p>Price: low to high</p></div>${['city-sedan','sport-sedan','family-suv'].map(id=>vehicleRow(getVehicle(id))).join('')}</section>`};
}
