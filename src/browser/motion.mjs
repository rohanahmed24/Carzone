export function mountMotion(doc) {
  if(doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const content=doc.querySelector('.hero-content');
  if(content?.animate) content.animate([{transform:'translateY(10px)'},{transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
}
