// ─── CONFIG ───────────────────────────────────────────────────────────────
// Replace these with your actual values after setup
const CONFIG = {
  // Your GitHub username and repo name
  GITHUB_USER: 'YOUR_GITHUB_USERNAME',
  GITHUB_REPO: 'jvo-adventures',
  // Tally form base URL — replace SIGNUP_FORM_ID with your Tally form ID
  TALLY_SIGNUP_BASE: 'https://tally.so/r/SIGNUP_FORM_ID',
  // Cloudinary cloud name for photo uploads
  CLOUDINARY_CLOUD: 'YOUR_CLOUDINARY_CLOUD',
};

// ─── LOAD EVENTS ──────────────────────────────────────────────────────────
async function loadEvents() {
  try {
    // Cache bust so edits show up promptly (GitHub Pages caches aggressively)
    const url = `events.json?v=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('not found');
    return await res.json();
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

// ─── RENDER EVENT CARD ────────────────────────────────────────────────────
function renderEventCard(e, compact = false, isPast = false) {
  const signupUrl = `${CONFIG.TALLY_SIGNUP_BASE}?event_id=${e.id}&event_name=${encodeURIComponent(e.title)}&event_date=${encodeURIComponent(formatDate(e.date))}`;
  const imgHtml = e.photo
    ? `<div class="event-img" style="background-image:url('${e.photo}')"></div>`
    : `<div class="event-img event-img-placeholder"><span>${typeLabel(e.type).split(' ')[0]}</span></div>`;

  const pastClass = isPast ? ' event-card--past' : '';

  if (compact) {
    return `
    <div class="event-card event-card--compact${pastClass}" onclick="openEventModal('${e.id}')">
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
      ${!isPast ? `<a href="${signupUrl}" target="_blank" class="btn btn-primary event-signup-btn">Sign Up for This Trip</a>` : '<span class="past-tag">Past trip</span>'}
    </div>
  </div>`;
}

// ─── EVENT MODAL (for compact cards) ─────────────────────────────────────
async function openEventModal(id) {
  const events = await loadEvents();
  const e = events.find(ev => ev.id === id);
  if (!e) return;
  
  const signupUrl = `${CONFIG.TALLY_SIGNUP_BASE}?event_id=${e.id}&event_name=${encodeURIComponent(e.title)}&event_date=${encodeURIComponent(formatDate(e.date))}`;
  const imgHtml = e.photo
    ? `<img src="${e.photo}" alt="${e.title}" style="width:100%;height:220px;object-fit:cover;border-radius:12px 12px 0 0;">`
    : `<div class="event-img-placeholder" style="height:140px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f0ede6;border-radius:12px 12px 0 0;">${typeLabel(e.type).split(' ')[0]}</div>`;
  
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
