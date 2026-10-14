/* =====================================================================
   MICRO-INTERACTIONS & MOTION EFFECTS
   Live clock, magnetic send buttons, 3D avatar tilt, and scroll fade.
   ===================================================================== */

/* ---------- Live Clock (top bar) ---------- */
(function liveClock() {
  const t = $('#clockTime'), d = $('#clockDate');
  if (!t || !d) return;
  function tick() {
    const now = new Date();
    t.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    d.textContent = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Logo fade on scroll ---------- */
(function logoScrollFade() {
  const msgs = $('#messages');
  const update = () => {
    const sc = (window.scrollY || 0) > 24 || (msgs && msgs.scrollTop > 24);
    document.body.classList.toggle('scrolled', sc);
  };
  window.addEventListener('scroll', update, { passive: true });
  if (msgs) msgs.addEventListener('scroll', update, { passive: true });
})();

/* ---------- Magnetic pull on send buttons (fine pointers only) ---------- */
(function magnetize() {
  if (!window.matchMedia('(pointer: fine)').matches || reducedMotion()) return;
  document.querySelectorAll('.send').forEach(btn => {
    const wrap = btn.closest('.ask-wrap');
    if (!wrap) return;
    let raf = 0;
    wrap.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > 90) { btn.style.transform = ''; return; }
      const pull = (1 - dist / 90) * 10;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { btn.style.transform = `translate(${(dx / dist) * pull}px,${(dy / dist) * pull}px)`; });
    });
    wrap.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); btn.style.transform = ''; });
  });
})();

/* ---------- Pin composer above virtual keyboard ---------- */
(function pinToKeyboard() {
  if (!window.visualViewport) return;
  const vv = window.visualViewport;
  const chatEl = $('#chat');
  const sync = () => {
    if (!chatEl) return;
    const shrunk = vv.height < window.innerHeight - 100;
    chatEl.style.height = shrunk ? vv.height + 'px' : '';
    if (shrunk && document.body.classList.contains('in-chat') && typeof scrollBottom === 'function') {
      scrollBottom();
    }
  };
  vv.addEventListener('resize', sync);
})();

/* ---------- Avatar 3D tilt tracking fine pointers ---------- */
(function avatarTilt() {
  const wrap = $('.avatar-wrap'), av = $('#avatar');
  if (!wrap || !av || !window.matchMedia('(pointer: fine)').matches || reducedMotion()) return;
  wrap.style.perspective = '700px';
  let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  function spring() {
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    av.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) requestAnimationFrame(spring);
    else running = false;
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(spring); } };
  wrap.addEventListener('pointermove', e => {
    const r = wrap.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
    ty = ((e.clientY - r.top) / r.height - 0.5) * -16;
    kick();
  });
  wrap.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
})();
