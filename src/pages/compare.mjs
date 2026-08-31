import {compareContent} from '../ui/compare.mjs';

export function renderCompare() {
  return {
    title: 'Compare cars',
    description: 'Compare up to three illustrative cars side by side.',
    controller: 'compare',
    body: `<section class="container compare-page"><h1>Understand the differences.</h1><p>Compare up to three illustrative cars side by side.</p><p data-compare-notice role="status"></p><div data-compare-content><fieldset class="compare-static" disabled>${compareContent([],false)}</fieldset></div><div data-compare-undo hidden><p data-compare-undo-message></p><button type="button" data-undo-compare>Undo</button></div></section>`,
  };
}
