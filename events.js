// ─── CONFIG ───────────────────────────────────────────────────────────────
const CONFIG = {
  GITHUB_USER: 'YOUR_GITHUB_USERNAME',
  GITHUB_REPO: 'jvo-adventures',
  TALLY_SIGNUP_BASE: 'https://tally.so/r/SIGNUP_FORM_ID',
};

// ─── LOAD EVENTS ──────────────────────────────────────────────────────────
async function loadEvents() {
  try {
    const res = await fetch(`events.json?v=${Date.now()}`);
    if (!res.ok) throw new Error('not found');
    const all = await res.json();
    return all;
  } catch {
    return [];
  }
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function typeLabel(type) {
  const labels = { hike: '🥾 Hiking', kayak: '🛶 Kayaking', fish: '🎣 Fishing', snow: '🏔️ Snowshoeing', other: '🌲 Outdoor' };
  return labels[type] || labels.other;
}

function difficultyBadge(d) {
  const map = { easy: ['#e8f5e9','#2e7d32'], moderate: ['#fff8e1','#f57f17'], challenging: ['#fce4ec','#c62828'] };
  const [bg, fg] = map[d] || map.easy;
  return `<span class="badge" style="background:${bg};color:${fg}">${d || 'easy'}</span>`;
}

function tripPageName(id) {
  return `trip-${id}.html`;
}

// ─── RENDER EVENT CARD ────────────────────────────────────────────────────
function renderEventCard(e, compact = false, isPast = false) {
  if (!e.enabled) return '';
  const signupUrl = `${CONFIG.TALLY_SIGNUP_BASE}?event_id=${e.id}&event_name=${encodeURIComponent(e.title)}&event_date=${encodeURIComponent(formatDate(e.date))}`;
  const detailPage = e.tripPage ? tripPageName(e.id) : null;
  const imgHtml = e.photo
    ? `<div class="event-img" style="background-image:url('${e.photo}')"></div>`
    : `<div class="event-img event-img-placeholder"><span>${typeLabel(e.type).split(' ')[0]}</span></div>`;
  const pastClass = isPast ? ' event-card--past' : '';

  if (compact) {
    const clickAction = detailPage ? `window.location='${detailPage}'` : `openEventModal('${e.id}')`;
    return `
    <div class="event-card event-card--compact${pastClass}" onclick="${clickAction}" style="cursor:pointer">
      ${imgHtml}
      <div class="event-card-body">
        <div class="event-meta">
          <span class="event-date-chip">${formatShortDate(e.date)}</span>
          ${difficultyBadge(e.difficulty)}
        </div>
        <h3>${e.title}</h3>
        <p class="event-location">📍 ${e.location}</p>
      </div>
    </div>`;
  }

  return `
  <div class="event-card${pastClass}">
    ${imgHtml}
    <div class="event-card-body">
      <div class="event-meta">
        <span class="event-date-chip">${formatShortDate(e.date)}</span>
        <span class="event-type-chip">${typeLabel(e.type)}</span>
        ${difficultyBadge(e.difficulty)}
      </div>
      <h3>${e.title}</h3>
      <p class="event-date-full">${formatDate(e.date)} · ${e.time || 'Time TBD'}</p>
      <p class="event-location">📍 ${e.location}</p>
      <p class="event-desc">${e.description || ''}</p>
      ${e.spots ? `<p class="event-spots">👥 ${e.spots} spots available</p>` : ''}
      ${!isPast ? `
        ${detailPage ? `<a href="${detailPage}" class="btn btn-outline event-signup-btn" style="display:block;text-align:center;margin-bottom:0.5rem">See Photos &amp; Details</a>` : ''}
        <a href="${signupUrl}" target="_blank" class="btn btn-primary event-signup-btn">Sign Up for This Trip</a>
      ` : '<span class="past-tag">Past trip</span>'}
    </div>
  </div>`;
}

// ─── EVENT MODAL (for events without trip pages) ──────────────────────────
async function openEventModal(id) {
  const events = await loadEvents();
  const e = events.find(ev => ev.id === id);
  if (!e) return;
  const signupUrl = `${CONFIG.TALLY_SIGNUP_BASE}?event_id=${e.id}&event_name=${encodeURIComponent(e.title)}&event_date=${encodeURIComponent(formatDate(e.date))}`;
  const imgHtml = e.photo
    ? `<img src="${e.photo}" alt="${e.title}" style="width:100%;height:220px;object-fit:cover;border-radius:12px 12px 0 0;">`
    : `<div style="height:140px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f0ede6;border-radius:12px 12px 0 0;">${typeLabel(e.type).split(' ')[0]}</div>`;

  document.getElementById('modal-content').innerHTML = `
    ${imgHtml}
    <div style="padding:1.5rem">
      <div class="event-meta" style="margin-bottom:0.75rem">
        ${difficultyBadge(e.difficulty)}
        <span class="event-type-chip">${typeLabel(e.type)}</span>
      </div>
      <h2 style="font-family:'Playfair Display',serif;margin:0 0 0.5rem">${e.title}</h2>
      <p style="color:#666;margin:0 0 0.25rem"><strong>${formatDate(e.date)}</strong> · ${e.time || 'Time TBD'}</p>
      <p style="color:#666;margin:0 0 1rem">📍 ${e.location}</p>
      <p style="margin:0 0 1.25rem;line-height:1.7">${e.description || ''}</p>
      ${e.spots ? `<p style="margin:0 0 1rem;color:#555">👥 ${e.spots} spots available</p>` : ''}
      <a href="${signupUrl}" target="_blank" class="btn btn-primary" style="display:block;text-align:center">Sign Up for This Trip</a>
    </div>
  `;
  const modal = document.getElementById('event-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// ─── GENERATE TRIP PAGE HTML ───────────────────────────────────────────────
function generateTripPage(e) {
  const signupUrl = `${CONFIG.TALLY_SIGNUP_BASE}?event_id=${e.id}&event_name=${encodeURIComponent(e.title)}&event_date=${encodeURIComponent(formatDate(e.date))}`;
  const photos = e.photos || [];
  const slideData = JSON.stringify(photos);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e.title} — JVO Adventures</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<style>
.page-hero{min-height:52vh;background:linear-gradient(160deg,#1e3a2f 0%,#2d5a42 60%,#1a4a35 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:16rem 2rem 3rem;position:relative;overflow:hidden;}
.page-hero-texture{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
.page-hero-content{position:relative;z-index:1;max-width:700px;}
.breadcrumb{font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;color:#6aab84;margin-bottom:0.75rem;display:block;}
.page-hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);color:#fff;line-height:1.15;margin-bottom:1rem;}
.hero-meta{display:flex;flex-wrap:wrap;gap:1.25rem;}
.hero-meta-item{display:flex;align-items:center;gap:0.4rem;font-size:0.9rem;color:rgba(255,255,255,0.7);}
.hero-meta-item strong{color:#fff;}
.slideshow-wrap{position:relative;background:#111;}
.slide{display:none;position:relative;width:100%;}
.slide.active{display:block;}
.slide img{width:100%;height:clamp(320px,60vw,680px);object-fit:cover;display:block;opacity:0;transition:opacity 0.5s ease;}
.slide img.loaded{opacity:1;}
.slide-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.72));padding:3rem 2rem 1.5rem;color:#fff;}
.slide-caption h3{font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:0.25rem;}
.slide-caption p{font-size:0.88rem;color:rgba(255,255,255,0.72);}
.slide-prev,.slide-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25);color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;z-index:10;transition:background 0.2s;}
.slide-prev{left:1rem;}.slide-next{right:1rem;}
.slide-counter{position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);color:#fff;font-size:0.8rem;padding:0.3rem 0.75rem;border-radius:50px;z-index:10;}
.slide-dots{display:flex;justify-content:center;gap:0.5rem;padding:1.25rem 0 0.5rem;background:#111;}
.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.25);cursor:pointer;border:none;transition:all 0.2s;}
.dot.active{background:#6aab84;transform:scale(1.3);}
.thumb-strip{display:flex;gap:4px;overflow-x:auto;background:#111;padding:4px 4px 1rem;scrollbar-width:none;}
.thumb-strip::-webkit-scrollbar{display:none;}
.thumb{flex-shrink:0;width:80px;height:56px;object-fit:cover;cursor:pointer;opacity:0.45;transition:opacity 0.2s;border-radius:4px;}
.thumb.active{opacity:1;outline:2px solid #6aab84;}
.trip-info{padding:4rem 0;}.trip-info-inner{max-width:900px;margin:0 auto;padding:0 1.5rem;}
.trip-meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin-bottom:2rem;}
.trip-meta-card{background:#ede9df;border-radius:12px;padding:1rem 1.25rem;}
.trip-meta-card .label{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b6b;margin-bottom:0.3rem;}
.trip-meta-card .value{font-size:1.1rem;font-weight:600;color:#1e3a2f;font-family:'Playfair Display',serif;}
.trip-desc{font-size:1.05rem;color:#6b6b6b;line-height:1.8;max-width:680px;margin-bottom:2.5rem;}
.signup-strip{background:#1e3a2f;padding:4rem 0;text-align:center;}
.signup-strip h2{font-family:'Playfair Display',serif;color:#fff;font-size:2rem;margin-bottom:0.75rem;}
.signup-strip p{color:rgba(255,255,255,0.65);margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;}
.signup-btn{background:#6aab84;color:#1e3a2f;font-weight:600;display:inline-block;padding:0.9rem 2rem;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:1rem;text-decoration:none;transition:all 0.2s;}
.signup-btn:hover{background:#7fc498;transform:translateY(-1px);}
@media(max-width:640px){.trip-meta-grid{grid-template-columns:1fr 1fr;}.nav-links{display:none;}}
</style>
</head>
<body>
<nav class="nav">
  <a href="index.html" class="nav-logo"><img src="logo.jpg" alt="JVO Adventures" style="height:200px;width:auto;display:block;"></a>
  <div class="nav-links">
    <a href="index.html#about">About</a>
    <a href="events.html">Events</a>
    <a href="index.html#contact">Contact</a>
  </div>
  <a href="${signupUrl}" target="_blank" class="nav-cta">Sign Up</a>
</nav>
<div class="page-hero">
  <div class="page-hero-texture"></div>
  <div class="page-hero-content">
    <span class="breadcrumb"><a href="events.html" style="color:#6aab84;">← Back to Events</a></span>
    <h1>${e.title}</h1>
    <div class="hero-meta">
      <div class="hero-meta-item">📅 <strong>${formatDate(e.date)}</strong></div>
      <div class="hero-meta-item">🕘 <strong>${e.time || 'Time TBD'}</strong></div>
      <div class="hero-meta-item">📍 <strong>${e.location}</strong></div>
      ${e.spots ? `<div class="hero-meta-item">👥 <strong>${e.spots} spots</strong></div>` : ''}
    </div>
  </div>
</div>
${photos.length > 0 ? `
<div id="slideshow-section">
  <div class="slideshow-wrap">
    <div class="slide-counter"><span id="cur">1</span> / <span id="tot">${photos.length}</span></div>
    ${photos.map((p, i) => `
    <div class="slide${i === 0 ? ' active' : ''}" data-caption="${p.caption || ''}" data-desc="${p.desc || ''}">
      <img src="${p.url}" alt="${p.caption || ''}">
    </div>`).join('')}
    <button class="slide-prev" onclick="moveSlide(-1)">&#8592;</button>
    <button class="slide-next" onclick="moveSlide(1)">&#8594;</button>
    <div class="slide-caption">
      <h3 id="cap-title">${photos[0].caption || ''}</h3>
      <p id="cap-desc">${photos[0].desc || ''}</p>
    </div>
  </div>
  <div class="slide-dots" id="dots"></div>
  <div class="thumb-strip" id="thumbs"></div>
</div>` : ''}
<section class="trip-info">
  <div class="trip-info-inner">
    <div class="trip-meta-grid">
      <div class="trip-meta-card"><div class="label">Date</div><div class="value">${formatDate(e.date)}</div></div>
      <div class="trip-meta-card"><div class="label">Time</div><div class="value">${e.time || 'TBD'}</div></div>
      <div class="trip-meta-card"><div class="label">Difficulty</div><div class="value">${e.difficulty || 'Easy'}</div></div>
      <div class="trip-meta-card"><div class="label">Spots</div><div class="value">${e.spots || 'Open'}</div></div>
    </div>
    <p class="trip-desc">${e.description || ''}</p>
  </div>
</section>
<div class="signup-strip">
  <div>
    <h2>Ready to come along?</h2>
    <p>Sign up takes 30 seconds — Johnny will be in touch with final details closer to the date.</p>
    <a href="${signupUrl}" target="_blank" class="signup-btn">Sign Up for This Trip</a>
  </div>
</div>
<footer class="footer">
  <div class="container">
    <img src="logo.jpg" alt="JVO Adventures" style="height:60px;width:auto;margin:0 auto 0.75rem;display:block;opacity:0.9;">
    <p>jvoadventures.com &nbsp;·&nbsp; Marblehead, MA</p>
    <p class="footer-tagline">"You don't need to see the summit. Just take the next step."</p>
  </div>
</footer>
${photos.length > 0 ? `
<script>
const slides = document.querySelectorAll('.slide');
const dots = document.getElementById('dots');
const thumbs = document.getElementById('thumbs');
const photos = ${slideData};
let cur = 0, timer;
document.getElementById('tot').textContent = slides.length;
photos.forEach((p, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i===0?' active':'');
  dot.onclick = () => goTo(i);
  dots.appendChild(dot);
  const th = document.createElement('img');
  th.src = p.url; th.className = 'thumb'+(i===0?' active':''); th.alt='';
  th.onclick = () => goTo(i);
  thumbs.appendChild(th);
});
function goTo(n) {
  slides[cur].classList.remove('active');
  document.querySelectorAll('.dot')[cur].classList.remove('active');
  document.querySelectorAll('.thumb')[cur].classList.remove('active');
  cur = (n+slides.length)%slides.length;
  slides[cur].classList.add('active');
  document.querySelectorAll('.dot')[cur].classList.add('active');
  const t = document.querySelectorAll('.thumb')[cur];
  t.classList.add('active');
  t.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  document.getElementById('cap-title').textContent = photos[cur].caption||'';
  document.getElementById('cap-desc').textContent = photos[cur].desc||'';
  document.getElementById('cur').textContent = cur+1;
  const img = slides[cur].querySelector('img');
  if(img.complete) img.classList.add('loaded'); else img.onload=()=>img.classList.add('loaded');
  clearInterval(timer); timer=setInterval(()=>goTo(cur+1),5000);
}
function moveSlide(d){goTo(cur+d);}
document.querySelector('.slideshow-wrap').addEventListener('touchstart',e=>window._tx=e.touches[0].clientX);
document.querySelector('.slideshow-wrap').addEventListener('touchend',e=>{const d=window._tx-e.changedTouches[0].clientX;if(Math.abs(d)>40)moveSlide(d>0?1:-1);});
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')moveSlide(-1);if(e.key==='ArrowRight')moveSlide(1);});
slides[0].querySelector('img').onload=function(){this.classList.add('loaded');};
if(slides[0].querySelector('img').complete) slides[0].querySelector('img').classList.add('loaded');
timer=setInterval(()=>goTo(cur+1),5000);
</script>` : ''}
</body>
</html>`;
}
