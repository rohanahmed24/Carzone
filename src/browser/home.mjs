import {parseFilters,serializeFilters} from '../domain/query.mjs';
export function mountHome(doc) {
  const form=doc.querySelector('[data-finder]');
  if(!form) return;
  form.addEventListener('submit',event=>event.preventDefault());
  form.querySelector('[data-find]').addEventListener('click',()=>{
    const filters=parseFilters(new URLSearchParams(new doc.defaultView.FormData(form)),'latest-cars.html');
    filters.view='all';
    doc.defaultView.location.assign(`latest-cars.html?${serializeFilters(filters)}`);
  });
  form.querySelector('fieldset').disabled=false;
}
