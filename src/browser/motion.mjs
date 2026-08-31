export function mountMotion(doc) {
  const preference = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
  // Without preference support, leave the fully visible page unchanged.
  if (!preference || preference.matches) return;
  const content = doc.querySelector('.hero-content');
  content?.animate?.(
    [{transform:'translateY(12px)',opacity:0.85},{transform:'translateY(0)',opacity:1}],
    {duration:420,easing:'cubic-bezier(.2,.8,.2,1)'},
  );
}
