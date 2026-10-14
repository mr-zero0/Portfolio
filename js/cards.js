/* =====================================================================
   CARD BUILDERS (Presentation, Skills, Experience, Projects, Contact, Fun)
   ===================================================================== */
function presentationCard() {
  return el(`
    <div class="card">
      <div class="pres-top">
        ${imgTag('pres-photo', 'Illustrated portrait of Mohd Aman')}
        <div>
          <h3 class="pres-name">${PROFILE.name}</h3>
          <p class="pres-role">${PROFILE.title} · ${PROFILE.company}</p>
          <div class="pres-meta">
            <span>${icon('pin')}${PROFILE.location}</span>
            <span>${icon('calendar')}5 yrs experience</span>
            <span>${icon('grad')}IIIT Una, B.Tech ECE</span>
          </div>
        </div>
      </div>
      <p class="pres-text">${PROFILE.summary}</p>
      <div class="tags">
        <span class="tag accent">GenAI</span><span class="tag accent">Agentic AI</span><span class="tag">Enterprise banking</span>
        <span class="tag">Python</span><span class="tag">C# / .NET</span><span class="tag">HCLTech AIForce</span>
      </div>
      <div class="pactions" style="margin-top:16px">
        <a class="btn btn-accent" href="${PROFILE.resume}" download>${icon('download')}Download résumé</a>
      </div>
    </div>`);
}

function skillsCard() {
  return el(`
    <div class="card">
      ${SKILLS.map(g => `
        <div class="skill-group">
          <div class="skill-head">${icon(g.icon, 'icon', g.color)}${g.label}</div>
          <div class="tags">${g.items.map(i => `<span class="tag">${esc(i)}</span>`).join('')}</div>
        </div>`).join('')}
    </div>`);
}

function educationBlock() {
  return `
    <div class="edu">
      <div class="ic">${icon('grad')}</div>
      <div>
        <b>${EDUCATION.degree}</b>
        <span>${EDUCATION.school}</span>
        <span>${EDUCATION.year}</span>
      </div>
    </div>`;
}

function educationCard() {
  return el(`<div class="card"><p class="card-title">${icon('grad')}Education</p>${educationBlock()}</div>`);
}

function experienceCard() {
  const roles = EXPERIENCE.map(r => `
    <div class="role">
      <div class="role-logo" style="background:${r.color}">${r.logo}</div>
      <div class="role-head">
        <div>
          <h4 class="role-title">${esc(r.title)}</h4>
          <div class="role-co">${esc(r.company)}${r.location ? ` · ${esc(r.location)}` : ''}</div>
        </div>
        <div class="role-dates">${esc(r.dates)}</div>
      </div>
      ${r.bullets ? `<ul class="bullets">${r.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${(r.engagements || []).map(e => `
        <details class="eng"${e.open ? ' open' : ''}>
          <summary>
            <span>${esc(e.name)} <span class="sub">${esc(e.sub)} · ${esc(e.dates)}</span></span>
            ${icon('chevdown')}
          </summary>
          ${e.impact ? `<div class="impact">${e.impact.map(i => `<span class="tag accent">${esc(i)}</span>`).join('')}</div>` : ''}
          <ul class="bullets">${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </details>`).join('')}
    </div>`).join('');
  return el(`
    <div class="card">
      <p class="card-title">${icon('briefcase')}Professional experience</p>
      ${roles}
      <div class="divider"></div>
      <p class="card-title">${icon('grad')}Education</p>
      ${educationBlock()}
    </div>`);
}

function projectVisual(p, extra = '') {
  return `
    <div class="pvisual" style="background:${p.gradient}">
      ${p.status ? `<span class="status"><i></i>${esc(p.status)}</span>` : ''}
      ${p.glyph ? `<span class="glyph">${p.glyph}</span>` : icon(p.icon)}
      ${extra}
    </div>`;
}

function projectsCard() {
  const card = el(`
    <div class="card">
      <div class="carousel-head">
        <h3>Selected projects</h3>
        <div class="nav">
          <button type="button" data-dir="-1" aria-label="Scroll left">${icon('chevleft')}</button>
          <button type="button" data-dir="1" aria-label="Scroll right">${icon('chevright')}</button>
        </div>
      </div>
      <div class="carousel" tabindex="0" role="region" aria-label="Projects">
        ${PROJECTS.map((p, i) => `
          <article class="pcard">
            ${projectVisual(p)}
            <div class="pbody">
              <div class="pkind">${esc(p.kind)}</div>
              <h4 class="ptitle">${esc(p.title)}</h4>
              <div class="tags">${p.tech.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
              <p class="psum">${esc(p.summary)}</p>
              <div class="pactions">
                <button class="btn btn-primary" type="button" data-project="${i}">Details</button>
                <a class="btn btn-ghost" href="${p.github}" target="_blank" rel="noopener">${icon('github')}GitHub</a>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </div>`);
  const track = $('.carousel', card);
  card.querySelectorAll('.nav button').forEach(b => b.addEventListener('click', () => {
    const w = track.querySelector('.pcard').getBoundingClientRect().width + 14;
    track.scrollBy({ left: w * Number(b.dataset.dir), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }));
  card.querySelectorAll('[data-project]').forEach(b => b.addEventListener('click', () => openProject(PROJECTS[Number(b.dataset.project)])));
  return card;
}

function contactCard(note) {
  return el(`
    <div class="card">
      <div class="pres-top">
        ${imgTag('pres-photo', 'Illustrated portrait of Mohd Aman')}
        <div>
          <h3 class="pres-name">Let's connect</h3>
          <p class="pres-role">${note || 'Email or LinkedIn is the fastest way to reach me.'}</p>
          <div class="pres-meta"><span>${icon('pin')}${PROFILE.location}</span></div>
        </div>
      </div>
      <div class="contact-grid">
        <a class="ctile" href="mailto:${PROFILE.email}"><div class="ic" style="background:#0171e3">${icon('mail')}</div><div><b>Email</b><span>${PROFILE.email}</span></div></a>
        <a class="ctile" href="${PROFILE.linkedin}" target="_blank" rel="noopener"><div class="ic" style="background:#0a66c2">${icon('linkedin')}</div><div><b>LinkedIn</b><span>linkedin.com/in/mrzero0</span></div></a>
        <a class="ctile" href="${PROFILE.github}" target="_blank" rel="noopener"><div class="ic" style="background:#24292f">${icon('github')}</div><div><b>GitHub</b><span>github.com/mr-zero0</span></div></a>
        <a class="ctile" href="tel:${PROFILE.phone.replace(/[^+\d]/g, '')}"><div class="ic" style="background:#3E9858">${icon('phone')}</div><div><b>Phone</b><span>${PROFILE.phone}</span></div></a>
        <a class="ctile" href="${PROFILE.resume}" download><div class="ic" style="background:#856ED9">${icon('download')}</div><div><b>Résumé</b><span>Download as PDF</span></div></a>
      </div>
    </div>`);
}

function funCard() {
  return el(`
    <div class="card">
      <p class="card-title">${icon('party')}Outside of work</p>
      <div class="fun-grid">
        ${FUN.map(f => `<div class="ftile"><div class="em">${f.em}</div><b>${esc(f.title)}</b><p>${esc(f.text)}</p></div>`).join('')}
      </div>
      <p class="fun-note">The chess obsession leaks into my side projects too — both <strong>ArChess</strong> and <strong>Hidden Queen Chess</strong> are my own takes on the game.</p>
    </div>`);
}

if (typeof window !== 'undefined') {
  window.presentationCard = presentationCard;
  window.skillsCard = skillsCard;
  window.educationBlock = educationBlock;
  window.educationCard = educationCard;
  window.experienceCard = experienceCard;
  window.projectVisual = projectVisual;
  window.projectsCard = projectsCard;
  window.contactCard = contactCard;
  window.funCard = funCard;
}
