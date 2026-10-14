/* =====================================================================
   CHAT ENGINE, INTENT ROUTER & CONVERSATION CONTROLLER
   ===================================================================== */
const ANSWERS = {
  me:         { text: `Here's the short version of who I am 👇`, card: presentationCard },
  experience: { text: `Here's my career so far, most recent first. Click an engagement to expand the details.`, card: experienceCard },
  projects:   { text: `A few things I've built on the side. Open any card for the full story, or jump straight to the GitHub repo.`, card: projectsCard },
  skills:     { text: `Here's my toolkit, grouped the way I actually use it:`, card: skillsCard },
  fun:        { text: `Outside of work, two things take up most of my attention:`, card: funCard },
  contact:    { text: `Here's how to reach me. Email or LinkedIn is fastest.`, card: contactCard },
  education:  { text: `My academic background:`, card: educationCard },
  hire:       { text: `Always happy to talk about Forward Deployed Engineering and applied GenAI work. Here's how to reach me:`, card: () => contactCard('Open to a conversation about FDE and applied AI roles.') },
  greet:      { text: `Hey! 👋 I'm Aman, a Forward Deployed Engineer at HCLTech. Ask me about my <strong>experience</strong>, <strong>projects</strong>, or <strong>skills</strong>, or pick a quick question below.` },
  fallback:   { text: `I can only answer from my résumé for now, so I might miss that one. Try asking about my <strong>experience</strong>, <strong>projects</strong>, <strong>skills</strong>, <strong>education</strong>, what I do for <strong>fun</strong>, or how to <strong>contact</strong> me 👇` }
};

function route(q) {
  const t = q.toLowerCase().trim();
  const has = (...ws) => ws.some(w => t.includes(w));
  if (/^(hi|hello|hey|yo|hola|namaste|good (morning|evening|afternoon))\b/.test(t) && t.length < 25) return 'greet';
  if (has('hire', 'hiring', 'recruit', 'opportunit', 'open to', 'available', 'looking for', 'job offer', 'freelance', 'notice period')) return 'hire';
  if (has('contact', 'email', 'e-mail', 'mail', 'phone', 'call', 'linkedin', 'reach', 'connect', 'get in touch', 'talk')) return 'contact';
  if (has('fun', 'hobby', 'hobbies', 'free time', 'cricket', 'play chess', 'outside work', 'outside of work', 'interests', 'passion', 'weekend')) return 'fun';
  if (has('project', 'archess', 'chess', 'cdn', 'content delivery', 'health monitor', 'side project', 'built', 'github', 'repo', 'open source')) return 'projects';
  if (has('skill', 'stack', 'tech', 'tool', 'language', 'python', 'c#', '.net', 'docker', 'rag', 'llm', 'agent', 'prompt', 'certif', 'framework', 'good at', 'expert')) return 'skills';
  if (has('educat', 'college', 'universit', 'degree', 'b.tech', 'btech', 'iiit', 'study', 'studied', 'school', 'graduat', 'major')) return 'education';
  if (has('experience', 'work', 'job', 'career', 'hcl', 'deutsche', 'bank', 'keysight', 'telecom', 'intern', 'signify', 'consult', 'patent', 'resume', 'résumé', 'cv', 'role', 'company', 'employ', 'client', 'migration')) return 'experience';
  if (has('who', 'about you', 'yourself', 'introduce', 'intro', 'tell me about', 'background', 'summary', 'bio', 'name', 'where', 'based', 'location', 'live', 'what do you do', 'what are you')) return 'me';
  return 'fallback';
}

const landing = $('#landing'), chat = $('#chat'), thread = $('#thread'), messages = $('#messages');
const chatInput = $('#chatInput'), landingInput = $('#landingInput');
let busy = false;

const EASE_OUT = 'cubic-bezier(.2,.8,.2,1)';
function showChat() {
  if (!chat.classList.contains('hidden')) return Promise.resolve();
  const swap = () => {
    landing.classList.add('hidden');
    chat.classList.remove('hidden');
    document.body.classList.add('in-chat');
    $('#logoBtn').classList.add('hidden');
    if (!reducedMotion()) chat.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 300, easing: EASE_OUT });
  };
  if (reducedMotion()) { swap(); return Promise.resolve(); }
  // choreographed exit: hero drifts up, avatar shrinks, input & chips drift down
  const out = (sel, keyframes, delay = 0) => {
    const n = $(sel, landing);
    return n ? n.animate(keyframes, { duration: 240, delay, easing: 'ease-in', fill: 'forwards' }) : null;
  };
  const anims = [
    out('.hero', [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px)' }]),
    out('.avatar-wrap', [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.88)' }], 30),
    out('.ask', [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' }], 50),
    out('.chips', [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(18px)' }], 70),
    out('.resume-pill', [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(20px)' }], 90),
    out('.bg-word', [{ opacity: 1 }, { opacity: 0 }])
  ].filter(Boolean);
  return Promise.all(anims.map(a => a.finished.catch(() => {})))
    .then(() => { swap(); anims.forEach(a => a.cancel()); });
}

function goHome() {
  const finish = () => {
    chat.classList.add('hidden');
    landing.classList.remove('hidden');
    document.body.classList.remove('in-chat');
    $('#logoBtn').classList.remove('hidden');
    document.body.classList.remove('scrolled');
    thread.innerHTML = '';
    history.replaceState(null, '', location.pathname);
    landingInput.value = '';
    landingInput.focus();
  };
  if (reducedMotion() || chat.classList.contains('hidden')) { finish(); return; }
  chat.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' }],
    { duration: 220, easing: 'ease-in' }).finished.catch(() => {}).then(finish);
}

function scrollBottom() { messages.scrollTo({ top: messages.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' }); }

/* word-by-word AI text reveal — walks text nodes so inline markup survives */
function staggerWords(sayEl) {
  if (!sayEl || reducedMotion()) return;
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok.trim()) { frag.append(tok); return; }
          const s = document.createElement('span');
          s.className = 'w'; s.textContent = tok;
          s.style.animationDelay = `${i++ * 26}ms`;
          frag.append(s);
        });
        ch.replaceWith(frag);
      } else walk(ch);
    });
  };
  walk(sayEl);
}

/* scroll-triggered reveals: card children animate in as they enter the view */
const revealIO = new IntersectionObserver(entries => {
  let d = 0;
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.style.setProperty('--d', d++);
    en.target.classList.add('inview');
    revealIO.unobserve(en.target);
  });
}, { root: messages, threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

function applyStagger(root) {
  root.classList.add('card-in');
  if (reducedMotion()) return root;
  root.querySelectorAll('.pcard,.skill-group,.role,.ctile,.ftile').forEach(n => {
    n.classList.add('reveal');
    revealIO.observe(n);
  });
  return root;
}

async function ask(q, intent, sourceForm) {
  q = (q || '').trim();
  if (!q || busy) return;
  busy = true;
  const sendBtn = sourceForm && sourceForm.querySelector('.send');
  if (sendBtn && !reducedMotion()) {
    sendBtn.classList.add('pulse');
    sendBtn.addEventListener('animationend', () => sendBtn.classList.remove('pulse'), { once: true });
  }
  await showChat();
  thread.appendChild(el(`<div class="msg-user"></div>`)).textContent = q;
  const tip = el(`<div class="msg-ai"><div class="typing" role="status" aria-label="Typing"><i></i><i></i><i></i></div></div>`);
  thread.appendChild(tip);
  scrollBottom();
  try {
    await sleep(reducedMotion() ? 120 : 550 + Math.random() * 350);
    tip.remove();
    const a = ANSWERS[intent || route(q)];
    const node = el(`<div class="msg-ai"><p class="say">${a.text}</p></div>`);
    staggerWords(node.querySelector('.say'));
    if (a.card) node.appendChild(applyStagger(a.card()));
    thread.appendChild(node);
    scrollBottom();
  } finally {
    busy = false;
  }
  chatInput.value = '';
  landingInput.value = '';
  if (window.matchMedia('(min-width: 768px)').matches) chatInput.focus();
}

/* quick chips */
const landingChipsEl = $('#landingChips');
if (landingChipsEl) {
  landingChipsEl.innerHTML = QUICK.map((c, i) =>
    `<button class="chip" type="button" style="--i:${i}" data-key="${c.key}">${icon(c.icon, 'icon', c.color)}<span>${c.label}</span></button>`).join('');
}
const quickRowEl = $('#quickRow');
if (quickRowEl) {
  quickRowEl.innerHTML = QUICK.map(c =>
    `<button class="qchip" type="button" data-key="${c.key}">${icon(c.icon, 'icon', c.color)}<span>${c.label}</span></button>`).join('') +
    `<button class="qchip round" type="button" data-home aria-label="Back to home">${icon('home', 'icon', '#6b7280')}</button>`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-key]');
  if (b) { const c = QUICK.find(x => x.key === b.dataset.key); ask(c.q, c.key); return; }
  if (e.target.closest('[data-home]')) goHome();
});

const landingFormEl = $('#landingForm');
if (landingFormEl) landingFormEl.addEventListener('submit', e => { e.preventDefault(); ask(landingInput.value, null, e.target); });
const chatFormEl = $('#chatForm');
if (chatFormEl) chatFormEl.addEventListener('submit', e => { e.preventDefault(); ask(chatInput.value, null, e.target); });
const logoBtnEl = $('#logoBtn');
if (logoBtnEl) logoBtnEl.addEventListener('click', goHome);

/* toggle quick questions */
const toggleQuickBtn = $('#toggleQuick');
if (toggleQuickBtn) {
  toggleQuickBtn.setAttribute('aria-expanded', 'true');
  toggleQuickBtn.setAttribute('aria-controls', 'quickRow');
  toggleQuickBtn.addEventListener('click', () => {
    const row = $('#quickRow'); const hidden = row.classList.toggle('hidden');
    toggleQuickBtn.setAttribute('aria-expanded', String(!hidden));
    $('#toggleLabel').textContent = hidden ? 'Show quick questions' : 'Hide quick questions';
    $('#toggleIcon').style.transform = hidden ? 'rotate(180deg)' : '';
  });
}

if (typeof window !== 'undefined') {
  window.ANSWERS = ANSWERS;
  window.route = route;
  window.showChat = showChat;
  window.goHome = goHome;
  window.ask = ask;
}
