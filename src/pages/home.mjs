import {getVehicle} from '../domain/catalogue.mjs';
import {vehicleRow, vehicleImageSize} from '../ui/vehicle-row.mjs';
import {escapeHtml as e} from '../ui/escape.mjs';

const collections = [
  {
    id: 'touring-coupe',
    href: 'latest-cars.html',
    kicker: 'Latest',
    title: 'Just in.',
    copy: 'An editorial latest view of the same twelve illustrative cars.',
  },
  {
    id: 'grand-coupe',
    href: 'popular-cars.html',
    kicker: 'Popular',
    title: 'Often compared.',
    copy: 'Editorial sample selection — not a ranking or live demand signal.',
  },
  {
    id: 'concept-coupe',
    href: 'upcoming-cars.html',
    kicker: 'Upcoming',
    title: 'Not announced.',
    copy: 'Launch timing unconfirmed. Unknown prices stay unknown.',
  },
];

function collectionTile({id, href, kicker, title, copy}) {
  const vehicle = getVehicle(id);
  const [width, height] = vehicleImageSize(vehicle);
  return `<a class="home-collection" href="${e(href)}">
    <img src="${e(vehicle.image)}" alt="${e(vehicle.alt)}" width="${width}" height="${height}" loading="lazy">
    <p class="eyebrow">${e(kicker)}</p>
    <h3>${e(title)}</h3>
    <p>${e(copy)}</p>
    <span class="details-link">Open collection<span class="icon icon-arrow" aria-hidden="true"></span></span>
  </a>`;
}

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
<section class="container featured-section" aria-labelledby="featured-title"><div class="section-heading"><div><h2 id="featured-title">Cars to explore</h2><p>Illustrative listings</p></div><div class="featured-heading-meta"><p>Price: low to high</p><a class="details-link" href="latest-cars.html?view=all">See all twelve<span class="icon icon-arrow" aria-hidden="true"></span></a></div></div>${['city-sedan','sport-sedan','family-suv'].map(id=>vehicleRow(getVehicle(id))).join('')}</section>
<section class="container home-collections" aria-labelledby="collections-title">
  <p class="eyebrow">Editorial views</p>
  <h2 id="collections-title">Look closer.</h2>
  <p class="section-intro">Latest, popular and upcoming are views of the same twelve illustrative cars. Not live stock.</p>
  <div class="home-collection-grid">${collections.map(collectionTile).join('')}</div>
</section>
<section class="container home-path" aria-labelledby="path-title">
  <p class="eyebrow">This demo</p>
  <h2 id="path-title">A short path. Local only.</h2>
  <p class="section-intro">Explore, compare and keep a shortlist on this device. Nothing is sold or submitted here.</p>
  <ol class="home-path-list">
    <li><p class="home-path-index">01</p><h3>Explore</h3><p>Filter twelve illustrative cars by condition, budget and body style.</p></li>
    <li><p class="home-path-index">02</p><h3>Compare</h3><p>Up to three cars side by side. Missing facts stay labelled missing.</p></li>
    <li><p class="home-path-index">03</p><h3>Keep</h3><p>Save a shortlist on this device. If storage is unavailable, changes last for this page.</p></li>
  </ol>
</section>
<section class="home-compare" aria-labelledby="home-compare-title">
  <div class="container home-compare-inner">
    <p class="eyebrow">Side by side</p>
    <h2 id="home-compare-title">Understand the differences.</h2>
    <p>Compare up to three illustrative cars. Known facts stay comparable. Missing facts stay missing. A shared link never overwrites the cars on this device.</p>
    <a class="button" href="compare-car.html">Compare cars</a>
  </div>
</section>
<section class="container home-studio" aria-labelledby="studio-title">
  <p class="eyebrow">Local previews</p>
  <h2 id="studio-title">Try the other routes.</h2>
  <p class="section-intro">Forms stay on this page. Finish with the exact unsent disclosure.</p>
  <div class="home-studio-grid">
    <article>
      <h3>Sell your car</h3>
      <p>Preview a listing with fictional sample values. Review, edit and finish without sending anything.</p>
      <a class="details-link" href="sell-your-car.html">Preview selling<span class="icon icon-arrow" aria-hidden="true"></span></a>
    </article>
    <article>
      <h3>About car valuation</h3>
      <p>Educational fields only. No price estimate or dealer offer is generated.</p>
      <a class="details-link" href="car-valuation.html">Open valuation<span class="icon icon-arrow" aria-hidden="true"></span></a>
    </article>
  </div>
</section>`};
}
