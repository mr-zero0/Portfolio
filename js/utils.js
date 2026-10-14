/* =====================================================================
   CORE DOM HELPERS & UTILITIES
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const imgTag = (cls, alt) => `<img class="${cls}" src="${AVATAR}" alt="${esc(alt)}" onerror="this.onerror=null;this.src='${AVATAR_FALLBACK}'">`;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typeof window !== 'undefined') {
  window.$ = $;
  window.esc = esc;
  window.el = el;
  window.sleep = sleep;
  window.imgTag = imgTag;
  window.reducedMotion = reducedMotion;
}
