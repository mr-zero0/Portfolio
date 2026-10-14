/* =====================================================================
   THEME MANAGER & SKY/WEATHER SIMULATION
   Themes: Day → Evening → Night → Rainy (icon-only cycle)
   ===================================================================== */
const THEMES = [
  { key: 'day',     name: 'Day',     icon: 'sun',       bar: '#ffffff' },
  { key: 'evening', name: 'Evening', icon: 'sunset',    bar: '#3b2149' },
  { key: 'night',   name: 'Night',   icon: 'moon',      bar: '#0a0a0a' },
  { key: 'rainy',   name: 'Rainy',   icon: 'cloudrain', bar: '#0d1218' }
];

function themeFromClock() {
  const h = new Date().getHours();
  return h >= 5 && h < 17 ? 'day' : h < 20 ? 'evening' : 'night';
}

/* ---- starfield for the night theme (built once; CSS shows/hides it) ---- */
function buildStars() {
  const host = document.getElementById('stars');
  if (!host) return;
  let built = 0;
  function fill() {
    const n = Math.min(110, Math.floor(window.innerWidth / 12));
    if (Math.abs(n - built) < 20 && built) return; // density close enough
    built = n;
    let html = '';
    for (let i = 0; i < n; i++) {
      const size = Math.random() < .85 ? 2 : 3;
      html += `<i style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 72).toFixed(2)}%;width:${size}px;height:${size}px;--tw:${(2 + Math.random() * 3).toFixed(2)}s;--td:${(Math.random() * 4).toFixed(2)}s"></i>`;
    }
    host.innerHTML = html;
  }
  fill();
  let deb;
  window.addEventListener('resize', () => { clearTimeout(deb); deb = setTimeout(fill, 300); });
}

/* ---- live rain + thunderstorm (rainy theme only) ---- */
const rainEngine = (function () {
  const canvas = document.getElementById('rain'), flash = document.getElementById('flash');
  if (!canvas || !flash) return function() {};
  const ctx = canvas.getContext('2d');
  let drops = [], raf = 0, thunderTimer = 0, active = false;
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    const n = Math.min(200, Math.floor(canvas.width / 7));
    drops = Array.from({ length: n }, () => spawn(true));
    return dpr;
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * canvas.width * 1.1 - canvas.width * .05,
      y: anywhere ? Math.random() * canvas.height : -30 - Math.random() * 80,
      len: 14 + Math.random() * 22,
      sp: 9 + Math.random() * 9,
      w: Math.random() < .85 ? 1 : 1.6,
      a: .18 + Math.random() * .25
    };
  }
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const slant = 1.6;
    ctx.lineCap = 'round';
    for (const d of drops) {
      ctx.strokeStyle = `rgba(174,194,224,${d.a})`;
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - slant * (d.len / 8), d.y + d.len);
      ctx.stroke();
      d.y += d.sp; d.x -= slant;
      if (d.y > canvas.height + 30) Object.assign(d, spawn(false));
    }
    raf = requestAnimationFrame(frame);
  }
  function thunder() {
    flash.style.setProperty('--fx', `${15 + Math.random() * 70}%`);
    flash.classList.remove('go');
    void flash.offsetWidth; // restart the animation
    flash.classList.add('go');
    thunderTimer = setTimeout(thunder, 5000 + Math.random() * 11000);
  }
  window.addEventListener('resize', () => { if (active) size(); });
  document.addEventListener('visibilitychange', () => {
    if (!active) return;
    if (document.hidden) { cancelAnimationFrame(raf); clearTimeout(thunderTimer); }
    else { raf = requestAnimationFrame(frame); thunderTimer = setTimeout(thunder, 2500); }
  });
  return function run(on) {
    if (on === active) return;
    active = on;
    cancelAnimationFrame(raf); clearTimeout(thunderTimer);
    flash.classList.remove('go');
    if (!on || reducedMotion()) { active = false; ctx && ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    size();
    raf = requestAnimationFrame(frame);
    thunderTimer = setTimeout(thunder, 2200);
  };
})();

function applyTheme(key, animate) {
  const t = THEMES.find(x => x.key === key) || THEMES[0];
  if (animate && !reducedMotion()) {
    document.body.classList.add('theme-anim');
    setTimeout(() => document.body.classList.remove('theme-anim'), 900);
  }
  document.documentElement.dataset.theme = t.key;
  const themeIcon = $('#themeIcon');
  if (themeIcon) themeIcon.innerHTML = PATHS[t.icon];
  const btn = $('#themeBtn');
  if (btn) {
    btn.dataset.name = t.name;
    btn.setAttribute('aria-label', `Theme: ${t.name} — click to change`);
  }
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', t.bar));
  try { localStorage.setItem('tod-theme', t.key); } catch (e) {}
  rainEngine(t.key === 'rainy');
}

// Initialize stars & theme
buildStars();
let savedTheme = null;
try { savedTheme = localStorage.getItem('tod-theme'); } catch (e) {}
applyTheme(savedTheme || themeFromClock(), false);

const themeBtn = $('#themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const cur = THEMES.findIndex(t => t.key === document.documentElement.dataset.theme);
    applyTheme(THEMES[(cur + 1) % THEMES.length].key, true);
  });
}

if (typeof window !== 'undefined') {
  window.THEMES = THEMES;
  window.themeFromClock = themeFromClock;
  window.applyTheme = applyTheme;
  window.rainEngine = rainEngine;
}
