/* =====================================================================
   ACCESSIBLE MODAL & PROJECT DETAIL VIEWER
   ===================================================================== */
function openModal(inner, label) {
  const root = $('#modalRoot');
  const opener = document.activeElement;
  const ov = el(`<div class="overlay" role="dialog" aria-modal="true" aria-label="${esc(label || 'Details')}"><div class="modal">
    <button class="modal-close" type="button" aria-label="Close">${icon('x')}</button>
    ${inner}</div></div>`);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const close = () => {
    ov.remove();
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = prevOverflow;
    if (opener && opener.focus) opener.focus();
  };
  const onKey = e => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const focusables = ov.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (!ov.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  $('.modal-close', ov).addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  root.appendChild(ov);
  $('.modal-close', ov).focus();
}

function openProject(p) {
  openModal(`
    ${projectVisual(p)}
    <div class="modal-body">
      <div class="pkind">${esc(p.kind)}</div>
      <h3 style="font-size:22px;margin:4px 0 10px">${esc(p.title)}</h3>
      <div class="tags">${p.tech.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <ul class="bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      <div class="pactions" style="margin-top:18px">
        <a class="btn btn-accent" href="${p.github}" target="_blank" rel="noopener">${icon('github')}View on GitHub ${icon('external')}</a>
      </div>
    </div>`, p.title);
}

if (typeof window !== 'undefined') {
  window.openModal = openModal;
  window.openProject = openProject;
}
