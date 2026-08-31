import {renderHome} from './home.mjs';

/** Build-time route registry. Later route families register their own pages here. */
export function renderPages() {
  return new Map([['index.html',renderHome()]]);
}
