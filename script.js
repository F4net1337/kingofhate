/* ══════════════════════════════════════════════════════════
   KINGOFGHATE — DARK GREEN EDITION (BENTO PORTFOLIO)
   Interactive Scripts: Cat, Time, Heatmap, Live Music & Pets
   ══════════════════════════════════════════════════════════ */

// ── 1. CONFIGURATION (НАСТРОЙКИ САЙТА) ─────────────────
const CONFIG = {
  name: 'kingofhate',
  tz: 'Asia/Yekaterinburg',
  telegram: 'kingofhatte',
  steam: 'rapenotcriminal',
  instagram: 'kiingofhate',
  instagramUrl: 'https://www.instagram.com/kiingofhate?xtok=MWNrcDU1c2J2bXZwNA==',
  discordTag: 'fanet666',
  twitch: 'fanetxd',
  about: 'dont want to do anything',

  /* ────────────────────────────────────────────────────────
     ПОДКЛЮЧЕНИЕ ЖИВОГО ПЛЕЕРА К DOTIFY (dotify.fun):
     • Dotify поддерживает трансляцию в Discord RPC из коробки!
     • Как включить:
       1. В приложении Dotify (ПК) включите трансляцию в Discord
       2. Вступите 1 раз на сервер: https://discord.gg/lanyard
       3. Впишите ваш числовой Discord ID ниже:
  ──────────────────────────────────────────────────────── */
  discordId: '964037992127799350', // например: '324892749283749283'

  /* ────────────────────────────────────────────────────────
     СПОСОБ ЧЕРЕЗ LAST.FM (для Яндекс Музыки/Spotify):
  ──────────────────────────────────────────────────────── */
  lastfmUser: '', // например: 'kingofhatte'

  soundEffects: true
};
// ───────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── DEFENSIVE APPSEC SANITIZATION UTILITIES ─────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/<[^>]*>/g, '').trim();
}

function sanitizeText(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Safe HTTPS URL: no quotes, whitespace, or CSS breakout characters
  if (/^https:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'*+,;=%]+$/i.test(trimmed)) {
    if (!/["'()\\]/.test(trimmed)) {
      return trimmed;
    }
  }
  // Safe Base64 Image Data URI
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  return '';
}

// ── 2. WEB AUDIO SYNTH (SFX) ───────────────────────────
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playPurrSound() {
  if (!CONFIG.soundEffects) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    const now = ctx.currentTime;
    const startFreq = 340 + Math.random() * 60;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.85, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

// ── 3. VISITS COUNTER ──────────────────────────────────
(function initVisits() {
  let count = 1;
  try {
    count = +(localStorage.getItem('rin_green_visits') || 0);
    if (!sessionStorage.getItem('rin_green_seen')) {
      count++;
      localStorage.setItem('rin_green_visits', count);
      sessionStorage.setItem('rin_green_seen', '1');
    }
    count = Math.max(1, count);
  } catch (e) {}

  const text =
    count === 1 ? 'welcome :3'
    : count < 5 ? `welcome back · visit #${count}`
    : count < 20 ? `you again :3 · visit #${count}`
    : `visit #${count}. you basically live here`;

  const helloEl = $('hello');
  if (helloEl) helloEl.textContent = text;
})();

// ── 4. MY TIME & DAY PROGRESS ──────────────────────────
function tzOffset(tz, d = new Date()) {
  try {
    const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
    const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
    return Math.round((local - utc) / 60000);
  } catch (e) {
    return 300; // default UTC+5 (Yekaterinburg, MSK+2)
  }
}

function updateTime() {
  const now = new Date();
  let timeStr = '00:00';
  let hour = 0, min = 0, sec = 0;

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: CONFIG.tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);

    for (const p of parts) {
      if (p.type === 'hour') hour = +p.value;
      if (p.type === 'minute') min = +p.value;
      if (p.type === 'second') sec = +p.value;
    }
    timeStr = String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  } catch (e) {
    hour = now.getHours();
    min = now.getMinutes();
    sec = now.getSeconds();
    timeStr = String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }

  const timeEl = $('time');
  if (timeEl && timeEl.textContent !== timeStr) {
    timeEl.textContent = timeStr;
  }

  // Timezone difference with visitor
  const diffMinutes = tzOffset(CONFIG.tz, now) + now.getTimezoneOffset();
  const diffHours = diffMinutes / 60;
  const absH = Math.abs(diffHours);
  const hs = (Number.isInteger(absH) ? absH : absH.toFixed(1)) + 'h';
  const off = tzOffset(CONFIG.tz, now);
  const offH = Math.floor(Math.abs(off) / 60);
  const offM = Math.abs(off) % 60;
  const sign = off >= 0 ? '+' : '-';
  const utcStr = `utc${sign}${offH}${offM ? ':' + String(offM).padStart(2, '0') : ''}`;
  const mskDiff = Math.round((off - 180) / 60);
  const mskStr = mskDiff === 0 ? 'msk' : `msk${mskDiff > 0 ? '+' : ''}${mskDiff}`;
  const tzCity = (CONFIG.tz || '').toLowerCase().includes('yekaterinburg') ? 'ekb' : ((CONFIG.tz || '').split('/')[1] || '').toLowerCase().replace(/_/g, ' ');
  const baseTzStr = `${utcStr}${tzCity ? ' · ' + tzCity : ''} (${mskStr})`;

  const tzDiffEl = $('tzdiff');
  if (tzDiffEl) {
    const diffStr = diffHours === 0 ? ' · your time' : diffHours > 0 ? ` · ${hs} ahead` : ` · ${hs} behind`;
    tzDiffEl.textContent = `${baseTzStr}${diffStr}`;
  }

  // Day percentage bar and period of day
  const dayProgress = (hour * 3600 + min * 60 + sec) / 864;
  const dayFill = $('dayfill');
  const dayPct = $('daypct');
  const dayLabel = $('daylabel');

  if (dayFill) dayFill.style.width = dayProgress.toFixed(2) + '%';
  if (dayPct) dayPct.textContent = Math.round(dayProgress) + '%';

  const dayBar = dayFill ? dayFill.closest('.bar') : null;
  if (dayBar) {
    dayBar.title = `Day progress: ${Math.round(dayProgress)}% passed (${Math.round(100 - dayProgress)}% remaining)`;
  }

  if (dayLabel) {
    let period = 'evening';
    if (hour >= 5 && hour < 12) period = 'morning';
    else if (hour >= 12 && hour < 18) period = 'day';
    else if (hour >= 18 && hour < 23) period = 'evening';
    else period = 'night';
    dayLabel.textContent = period;
  }
}
updateTime();
setInterval(updateTime, 1000);

// ── 5. INTERACTIVE CAT ─────────────────────────────────
const cat = $('cat');
const eyes = $('eyes');
let sleeping = false;
let faceTimer;

function setFace(f) {
  if (!cat || cat.dataset.face === f) return;
  cat.dataset.face = f;
  const el = cat.querySelector('.f-' + f);
  if (el && !reduceMotion) {
    el.classList.remove('pop');
    void el.getBoundingClientRect();
    el.classList.add('pop');
  }
}

function flashFace(f, ms) {
  setFace(f);
  clearTimeout(faceTimer);
  faceTimer = setTimeout(() => setFace(sleeping ? 'closed' : !CONFIG.soundEffects ? 'squint' : 'normal'), ms);
}

function blinkOnce() {
  if (!cat) return;
  cat.classList.remove('blink');
  void cat.offsetWidth;
  cat.classList.add('blink');
}

function lookTo(x, y) {
  if (!eyes) return;
  eyes.classList.add('rest');
  eyes.style.transform = (x || y) ? `translate(${x}px, ${y}px)` : '';
}

let lastActivity = Date.now();
let idleTimers = [];
const later = (fn, ms) => idleTimers.push(setTimeout(fn, ms));

function stopIdle() {
  idleTimers.forEach(clearTimeout);
  idleTimers = [];
  if (cat) cat.classList.remove('tilt', 'mlem');
  if (!sleeping && (cat.dataset.face === 'wink' || cat.dataset.face === 'half')) {
    setFace(!CONFIG.soundEffects ? 'squint' : 'normal');
  }
}

const IDLE_ACTIONS = [
  [3, () => {
    const s = Math.random() < 0.5 ? -1 : 1;
    lookTo(3 * s, 0.4);
    later(() => lookTo(-3 * s, 0.4), 900);
    later(() => lookTo(0, 0), 1900);
  }],
  [2, () => {
    lookTo(0.8, -2.4);
    later(() => lookTo(0, 0), 1500);
  }],
  [2, () => {
    if (cat) cat.classList.add('tilt');
    later(() => cat && cat.classList.remove('tilt'), 1500);
  }],
  [2, () => {
    setFace('wink');
    later(() => setFace('normal'), 450);
  }],
  [2, () => {
    blinkOnce();
    later(blinkOnce, 260);
  }],
  [2, () => {
    if (cat) cat.classList.add('mlem');
    later(() => cat && cat.classList.remove('mlem'), 900);
  }],
  [1, () => {
    setFace('half');
    later(() => setFace('normal'), 1800);
  }]
];

function randomIdle() {
  let r = Math.random() * IDLE_ACTIONS.reduce((a, [w]) => a + w, 0);
  for (const [w, fn] of IDLE_ACTIONS) if ((r -= w) < 0) return fn;
  return IDLE_ACTIONS[0][1];
}

let zzzTimer;
function spawnZzz() {
  if (!cat) return;
  const s = cat.querySelector('svg').getBoundingClientRect();
  const c = cat.getBoundingClientRect();
  const z = document.createElement('span');
  z.className = 'zzz';
  z.textContent = 'z';
  z.style.left = s.left - c.left + s.width * 0.74 + 'px';
  z.style.top = s.top - c.top + s.height * 0.2 + 'px';
  z.style.fontSize = 11 + Math.random() * 6 + 'px';
  cat.append(z);
  setTimeout(() => z.remove(), 2500);
}

function fallAsleep() {
  sleeping = true;
  stopIdle();
  lookTo(0, 0);
  if (cat) {
    cat.classList.add('sleep');
    setFace('closed');
  }
  spawnZzz();
  zzzTimer = setInterval(spawnZzz, 1400);
}

function wakeUp() {
  sleeping = false;
  clearInterval(zzzTimer);
  if (cat) cat.classList.remove('sleep');
  flashFace('shiny', 650);
}

function markActivity() {
  lastActivity = Date.now();
  if (sleeping) wakeUp();
  else if (idleTimers.length) stopIdle();
}

if (!reduceMotion && cat) {
  addEventListener('pointermove', (e) => {
    markActivity();
    if (!eyes) return;
    eyes.classList.remove('rest');
    const r = cat.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.56);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 300);
    eyes.style.transform = `translate(${(dx / d) * 3 * k}px, ${(dy / d) * 2.2 * k}px)`;
  });

  addEventListener('pointerdown', markActivity);
  addEventListener('scroll', markActivity, { passive: true });

  const lookAhead = () => lookTo(0, 0);
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) lookAhead(); });
  document.documentElement.addEventListener('mouseleave', lookAhead);
  addEventListener('blur', lookAhead);

  (function blinkLoop() {
    if (!sleeping && CONFIG.soundEffects && cat.dataset.face === 'normal') blinkOnce();
    setTimeout(blinkLoop, 2600 + Math.random() * 4000);
  })();

  (function idleLoop() {
    const quiet = Date.now() - lastActivity;
    if (!sleeping && CONFIG.soundEffects && quiet > 28000) fallAsleep();
    else if (!sleeping && CONFIG.soundEffects && quiet > 4000 && !document.hidden && cat.dataset.face === 'normal') randomIdle()();
    setTimeout(idleLoop, 3200 + Math.random() * 3500);
  })();
}

// ── 6. PETS COUNTER (ГЛОБАЛЬНЫЙ ОБЛАЧНЫЙ СЧЁТЧИК ДЛЯ ВСЕХ ПОСЕТИТЕЛЕЙ) ───
const MOODS = [
  [1, 'mrrp'],
  [3, 'purring'],
  [10, 'very happy cat'],
  [25, "that's a lot of pets"],
  [50, 'the cat is attached to you now'],
  [100, 'you live here now']
];

// Надежный постоянный Key-Value счетчик с атомарным инкрементом и полной поддержкой CORS
const PETS_KEY = 'vsmak6mh';
const PETS_API_READ = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${PETS_KEY}/pets`;
const PETS_API_INC = `https://keyvalue.immanuel.co/api/KeyVal/ActOnValue/${PETS_KEY}/pets/increment`;

const PETS_BASELINE = 715;

let myPets = 0;
let totalPets = PETS_BASELINE;

try {
  myPets = parseInt(localStorage.getItem('rin_green_mypets'), 10) || 0;
  const cachedTotal = parseInt(localStorage.getItem('rin_green_totalpets'), 10) || 0;
  totalPets = Math.max(cachedTotal, myPets, PETS_BASELINE);
} catch (e) {}

function renderCatCaption() {
  const cap = $('cat-cap');
  if (!cap) return;

  if (!CONFIG.soundEffects) {
    cap.className = 'cap';
    cap.innerHTML = '<svg class="lc" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:-2px;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>sfx off :<';
    return;
  }

  if (!myPets) {
    cap.className = 'cap hint';
    cap.innerHTML = '<svg class="lc" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg> pat me';
  } else {
    cap.className = 'cap';
    cap.textContent = 'me, roughly';
  }
}
const updateCatCap = renderCatCaption;

function renderPets(bump = false) {
  const petsEl = $('pets');
  const moodEl = $('mood');
  const displayTotal = Math.max(totalPets, myPets, PETS_BASELINE);
  if (petsEl) petsEl.textContent = displayTotal.toLocaleString('en-US');

  let moodStr = '';
  for (const [n, m] of MOODS) if (myPets >= n) moodStr = m;
  if (moodEl) {
    moodEl.textContent = myPets ? `${myPets.toLocaleString('en-US')} from you · ${moodStr}` : 'click the cat to add yours';
  }

  if (bump && petsEl) {
    petsEl.classList.remove('bump');
    void petsEl.offsetWidth;
    petsEl.classList.add('bump');
  }
}
renderPets(false);
renderCatCaption();

// Синхронизация общего счётчика всех пользователей в мире
async function fetchGlobalPets() {
  try {
    const res = await fetch(PETS_API_READ, { cache: 'no-store' });
    if (!res.ok) return;
    const raw = await res.text();
    const clean = raw.replace(/["\s]/g, '');
    const val = parseInt(clean, 10);
    if (!isNaN(val) && val > 0 && Number.isFinite(val) && val < 1000000000) {
      totalPets = Math.max(totalPets, val, myPets, PETS_BASELINE);
      try { localStorage.setItem('rin_green_totalpets', totalPets); } catch (e) {}
      renderPets(false);
    }
  } catch (e) {}
}
fetchGlobalPets();
// Фоновый опрос каждые 7 секунд для мгновенного отображения кликов с других устройств
setInterval(fetchGlobalPets, 7000);

let pendingPetSync = 0;
let petDebounceTimer = null;

function syncPetIncrement() {
  pendingPetSync++;
  if (petDebounceTimer) clearTimeout(petDebounceTimer);
  petDebounceTimer = setTimeout(flushPetSync, 250);
}

async function flushPetSync() {
  if (pendingPetSync <= 0) return;
  const count = pendingPetSync;
  pendingPetSync = 0;

  try {
    const batchSize = 4;
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      const end = Math.min(count, i + batchSize);
      for (let j = i; j < end; j++) {
        batch.push(
          fetch(PETS_API_INC, {
            method: 'POST',
            body: '',
            keepalive: true
          })
        );
      }
      await Promise.allSettled(batch);
    }
  } catch (e) {}

  // Сразу запрашиваем актуальное значение с сервера
  fetchGlobalPets();
}

window.addEventListener('beforeunload', () => {
  if (pendingPetSync > 0) {
    const count = pendingPetSync;
    pendingPetSync = 0;
    for (let i = 0; i < count; i++) {
      try {
        fetch(PETS_API_INC, {
          method: 'POST',
          body: '',
          keepalive: true
        });
      } catch (e) {}
    }
  }
});

const PET_FACES = ['happy', 'squint', 'hearts', 'stars', 'content', 'shiny'];
let lastFace = '';
let petTimestamps = [];
let blushTimer;

function handlePet(x, y) {
  myPets++;
  totalPets = Math.max(totalPets + 1, myPets, PETS_BASELINE);
  try {
    localStorage.setItem('rin_green_mypets', myPets);
    localStorage.setItem('rin_green_totalpets', totalPets);
  } catch (e) {}
  updateCatCap();
  renderPets(true);
  syncPetIncrement();

  // Play audio chirrup
  playPurrSound();

  // Floating +1
  const plus = $('pets-plus');
  if (plus) {
    plus.classList.remove('show');
    void plus.offsetWidth;
    plus.classList.add('show');
  }

  markActivity();

  // Pick face
  const now = Date.now();
  petTimestamps = petTimestamps.filter((t) => now - t < 2500);
  petTimestamps.push(now);

  let f = 'dizzy';
  if (petTimestamps.length < 8) {
    if (!CONFIG.soundEffects) {
      f = Math.random() < 0.5 ? 'squint' : 'dizzy';
    } else {
      do f = PET_FACES[Math.floor(Math.random() * PET_FACES.length)]; while (f === lastFace);
    }
  }
  lastFace = f;
  flashFace(f, f === 'dizzy' ? 1400 : 850);

  if (cat) {
    cat.classList.add('blushing');
    clearTimeout(blushTimer);
    blushTimer = setTimeout(() => cat.classList.remove('blushing'), 1100);
  }

  // Floating heart SVG
  if (!reduceMotion && cat) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.innerHTML = '<svg class="lc" viewBox="0 0 24 24" fill="currentColor"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.setProperty('--dx', (Math.random() * 18 - 9).toFixed(1) + 'px');
    heart.style.setProperty('--rot', (Math.random() * 40 - 20).toFixed(0) + 'deg');
    cat.append(heart);
    setTimeout(() => heart.remove(), 950);
  }
}

if (cat) {
  cat.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const r = cat.getBoundingClientRect();
    const hasValidCoords = typeof e.clientX === 'number' && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const x = hasValidCoords ? (e.clientX - r.left) : (r.width / 2);
    const y = hasValidCoords ? (e.clientY - r.top) : (r.height / 2);
    handlePet(x, y);
  });

  cat.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const r = cat.getBoundingClientRect();
      handlePet(r.width / 2, r.height / 2);
    }
  });
}

// ── 7. NOW PLAYING: LIVE СИНХРОНИЗАЦИЯ & ЧИСТЫЙ ПЛЕЕР ──
const npCover = $('np-cover');
const npBg = $('np-bg');
const npName = $('np-name');
const npArtists = $('np-artists');
const npFill = $('np-fill');
const npStatusText = $('np-status-text');

let isLivePlaying = false;
let liveTrackData = null;
let liveTrackStart = 0;
let liveTrackDuration = 0;
let animFrameId = null;

// Плавная 60/120fps анимация индикатора прогресса трека
function stepProgressBar() {
  if (!isLivePlaying || !liveTrackDuration) {
    if (npFill) npFill.style.transform = 'scaleX(0)';
    animFrameId = null;
    return;
  }

  const now = Date.now();
  const elapsedMs = Math.max(0, now - liveTrackStart);
  const pct = Math.min(1, Math.max(0, elapsedMs / liveTrackDuration));

  if (npFill) {
    npFill.style.transform = `scaleX(${pct.toFixed(5)})`;
  }

  if (pct < 1 && isLivePlaying) {
    animFrameId = requestAnimationFrame(stepProgressBar);
  } else if (pct >= 1) {
    if (npFill) npFill.style.transform = 'scaleX(1)';
    animFrameId = null;
  }
}

function startProgressBar() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(stepProgressBar);
}

function stopProgressBar() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (npFill) npFill.style.transform = 'scaleX(0)';
}

// Применение живого трека из Dotify / Яндекс Музыки / Spotify
function applyLiveMusic(track) {
  const isSameTrack = isLivePlaying && liveTrackData &&
    liveTrackData.title === track.title &&
    liveTrackData.artist === track.artist;

  isLivePlaying = true;
  liveTrackData = track;

  const now = Date.now();
  if (isSameTrack && liveTrackStart) {
    // Если трек тот же самый, плавно продолжаем ход без сброса на 0
    if (track.duration) {
      liveTrackDuration = Math.max(1000, track.duration * 1000);
    }
    // Синхронизируем старт только при сильном расхождении (> 3 сек)
    if (track.startMs && Math.abs(liveTrackStart - track.startMs) > 3000) {
      liveTrackStart = track.startMs;
    }
  } else {
    // Включился новый трек — запускаем прогресс-бар
    if (track.startMs) {
      liveTrackStart = track.startMs;
    } else if (track.progress !== undefined) {
      liveTrackStart = now - (track.progress * 1000);
    } else {
      liveTrackStart = now;
    }
    liveTrackDuration = Math.max(1000, (track.duration || 180) * 1000);
    startProgressBar();
  }

  const safeTitle = sanitizeText(track.title) || 'offline';
  if (npName && npName.textContent !== safeTitle) {
    npName.textContent = safeTitle;
  }
  if (npArtists) {
    npArtists.style.display = '';
    const safeArtist = sanitizeText(track.artist);
    if (npArtists.dataset.renderedArtist !== safeArtist) {
      npArtists.dataset.renderedArtist = safeArtist;
      npArtists.textContent = '';
      if (safeArtist) {
        npArtists.appendChild(document.createTextNode(safeArtist + ' '));
        const liveBadge = document.createElement('small');
        liveBadge.style.color = 'var(--accent)';
        liveBadge.style.marginLeft = '4px';
        liveBadge.textContent = '• live';
        npArtists.appendChild(liveBadge);
      }
    }
  }

  const statusPill = document.querySelector('.np-status-pill');
  const dot = document.querySelector('.np-dot');
  if (statusPill && statusPill.classList.contains('idle')) statusPill.classList.remove('idle');
  if (dot && dot.classList.contains('idle')) dot.classList.remove('idle');
  if (npStatusText && npStatusText.textContent !== 'now playing') npStatusText.textContent = 'now playing';

  const safeCoverUrl = sanitizeUrl(track.coverUrl);
  if (safeCoverUrl) {
    const coverBg = `url("${safeCoverUrl}")`;
    if (npCover && npCover.style.backgroundImage !== coverBg) {
      npCover.style.backgroundImage = coverBg;
      npCover.style.backgroundSize = 'cover';
      npCover.style.backgroundPosition = 'center';
    }
    if (npBg && npBg.style.backgroundImage !== coverBg) {
      npBg.style.backgroundImage = coverBg;
      npBg.style.backgroundSize = 'cover';
      npBg.style.backgroundPosition = 'center';
    }
  }
}

// Состояние покоя (когда музыка НЕ играет — offline, индикатор СТОИТ на 0)
function setPlayerIdle() {
  isLivePlaying = false;
  liveTrackData = null;
  liveTrackStart = 0;
  liveTrackDuration = 0;
  stopProgressBar();

  if (npName) npName.textContent = 'offline';
  if (npArtists) {
    delete npArtists.dataset.renderedArtist;
    npArtists.textContent = '';
    npArtists.style.display = 'none';
  }

  const statusPill = document.querySelector('.np-status-pill');
  const dot = document.querySelector('.np-dot');
  if (statusPill) statusPill.classList.add('idle');
  if (dot) dot.classList.add('idle');
  if (npStatusText) npStatusText.textContent = 'offline';

  if (npCover) {
    npCover.style.backgroundImage = 'none';
    npCover.style.background = 'linear-gradient(135deg, #062b19 0%, #0a3d24 100%)';
  }
  if (npBg) {
    npBg.style.backgroundImage = 'none';
    npBg.style.background = 'linear-gradient(180deg, #05140b 0%, #030a06 100%)';
  }
}

// ── 7.1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АКТИВНОСТЕЙ ──

function isMusicActivity(a) {
  if (!a) return false;
  if (a.type === 2) return true;
  const name = (a.name || '').toLowerCase();
  const details = (a.details || '').toLowerCase();
  const state = (a.state || '').toLowerCase();
  return /dotify|spotify|яндекс|yandex|soundcloud|apple music|vk music/i.test(name) ||
         /dotify|spotify|soundcloud/i.test(details) ||
         /dotify|spotify|soundcloud/i.test(state);
}

function isGameActivity(a) {
  if (!a) return false;
  if (isMusicActivity(a)) return false;
  // Type 0 is Playing/Game, 1 is Streaming, 5 is Competing
  return a.type === 0 || a.type === 1 || a.type === 5;
}

function handlePresence(p) {
  if (!p) return;

  // 1. СТАТУС ДИСКОРДА (online / idle / dnd / offline)
  const statusDot = $('ds-status-dot');
  if (statusDot) {
    const rawSt = String(p.discord_status || 'offline').toLowerCase();
    const st = ['online', 'idle', 'dnd', 'offline', 'streaming'].includes(rawSt) ? rawSt : 'offline';
    statusDot.className = `ds-status-dot ${st}`;
    statusDot.title = `status: ${st}`;
  }

  const activities = Array.isArray(p.activities) ? p.activities : [];

  // 2. ИГРОВАЯ АКТИВНОСТЬ (например: Fortnite, CS2, Dota 2, Roblox, Xbox)
  const gameAct = activities.find(isGameActivity);

  const dsGameBadge = $('ds-game-badge');
  const dsValDefault = $('ds-val-default');
  const dsGameView = $('ds-game-view');
  const dsGameName = $('ds-game-name');
  const dsGameDesc = $('ds-game-desc');

  if (gameAct) {
    if (dsGameBadge) dsGameBadge.style.display = 'inline-flex';
    const dsGameBadgeText = $('ds-game-badge-text');
    if (dsGameBadgeText && dsGameBadgeText.textContent !== 'copied tag!') {
      dsGameBadgeText.textContent = gameAct.type === 1 ? 'streaming' : 'playing';
    }
    if (dsValDefault) dsValDefault.style.display = 'none';
    if (dsGameView) dsGameView.style.display = 'flex';
    if (dsGameName) dsGameName.textContent = sanitizeText(gameAct.name) || 'Fortnite';

    const parts = [gameAct.details, gameAct.state].filter(Boolean).map(sanitizeText);
    let desc = parts.join(' · ');
    if (gameAct.timestamps && gameAct.timestamps.start && Number.isFinite(gameAct.timestamps.start)) {
      const elapsedMs = Math.max(0, Date.now() - gameAct.timestamps.start);
      const h = Math.floor(elapsedMs / 3600000);
      const m = Math.floor((elapsedMs % 3600000) / 60000);
      const timeStr = h > 0 ? `${h}h ${m}m in game` : `${m}m in game`;
      desc = desc ? `${desc} · ${timeStr}` : timeStr;
    }
    if (dsGameDesc) dsGameDesc.textContent = sanitizeText(desc) || 'playing now';
  } else {
    if (dsGameBadge) dsGameBadge.style.display = 'none';
    if (dsValDefault) dsValDefault.style.display = 'flex';
    if (dsGameView) dsGameView.style.display = 'none';
  }

  // 3. МУЗЫКАЛЬНАЯ АКТИВНОСТЬ (Dotify / Spotify / Яндекс Музыка)
  // А) Проверка Spotify через прямой модуль Lanyard
  if (p.listening_to_spotify && p.spotify) {
    const sp = p.spotify;
    const start = sp.timestamps && sp.timestamps.start ? sp.timestamps.start : Date.now();
    const end = sp.timestamps && sp.timestamps.end ? sp.timestamps.end : start + 180000;
    const progress = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const duration = Math.max(1, Math.floor((end - start) / 1000));

    applyLiveMusic({
      title: sanitizeText(sp.song),
      artist: sanitizeText(sp.artist),
      coverUrl: sp.album_art_url,
      startMs: start,
      duration,
      progress,
      source: 'Spotify'
    });
    return;
  }

  // Б) Проверка Dotify / Яндекс Музыки через Discord RPC
  const musicAct = activities.find(isMusicActivity);

  if (musicAct) {
    let cover = '';
    if (musicAct.assets && musicAct.assets.large_image) {
      const img = String(musicAct.assets.large_image);
      if (img.startsWith('spotify:')) {
        cover = `https://i.scdn.co/image/${encodeURIComponent(img.slice(8))}`;
      } else if (img.startsWith('mp:external')) {
        cover = img.replace(/^mp:external\/[^\/]+\/(https?)\//, '$1://');
      } else if (/^https?:\/\//i.test(img)) {
        cover = img;
      } else if (musicAct.application_id) {
        cover = `https://cdn.discordapp.com/app-assets/${encodeURIComponent(musicAct.application_id)}/${encodeURIComponent(img)}.png`;
      }
    }

    const start = musicAct.timestamps && musicAct.timestamps.start 
      ? musicAct.timestamps.start 
      : (musicAct.created_at || Date.now());
    const end = musicAct.timestamps && musicAct.timestamps.end ? musicAct.timestamps.end : null;
    const progress = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const duration = end ? Math.max(1, Math.floor((end - start) / 1000)) : 210;

    applyLiveMusic({
      title: sanitizeText(musicAct.details || musicAct.name),
      artist: sanitizeText(musicAct.state || 'Playing'),
      coverUrl: cover,
      startMs: start,
      duration,
      progress,
      source: sanitizeText(musicAct.name || 'Dotify')
    });
    return;
  }

  // Если музыка сейчас не играет
  if (isLivePlaying) {
    setPlayerIdle();
  }
}

// Парсинг резервного SVG-виджета присутствия от cnrad.dev
function parseSvgPresence(svg) {
  if (!svg) return;

  // 1. Статус пользователя
  let st = 'offline';
  if (svg.includes('#43B581')) st = 'online';
  else if (svg.includes('#FAA61A')) st = 'idle';
  else if (svg.includes('#F04747')) st = 'dnd';
  else if (svg.includes('#593695')) st = 'streaming';

  const statusDot = $('ds-status-dot');
  if (statusDot) {
    statusDot.className = `ds-status-dot ${st}`;
    statusDot.title = `status: ${st}`;
  }

  // 2. Музыка в SVG (Listening to Spotify... / Listening to Dotify...)
  const musicMatch = svg.match(/Listening to\s+([A-Za-z0-9_\-\s]+)\.\.\./i);
  if (musicMatch) {
    const srcName = sanitizeText(musicMatch[1] ? musicMatch[1].trim() : 'Dotify');
    const pMatches = [...svg.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(m => stripHtml(m[1]));
    const title = sanitizeText(pMatches[1]) || 'Music Track';
    const artistRaw = sanitizeText(pMatches[2]) || '';
    const artist = artistRaw.replace(/^By\s+/i, '');

    let cover = '';
    const imgMatch = svg.match(/<img[^>]*src="(data:image\/[^"]+)"[^>]*alt="Album Cover"/i);
    if (imgMatch) cover = imgMatch[1];

    applyLiveMusic({
      title,
      artist,
      coverUrl: cover,
      source: srcName,
      duration: 180,
      progress: 30
    });
  } else if (isLivePlaying) {
    setPlayerIdle();
  }

  // 3. Игра в SVG (например Fortnite)
  const isDoingNothing = svg.includes("I&#x27;m not currently doing anything!") || svg.includes("not currently doing anything");
  const dsGameBadge = $('ds-game-badge');
  const dsValDefault = $('ds-val-default');
  const dsGameView = $('ds-game-view');
  const dsGameName = $('ds-game-name');
  const dsGameDesc = $('ds-game-desc');

  if (!isDoingNothing && !musicMatch) {
    const pMatches = [...svg.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(m => stripHtml(m[1]));
    if (pMatches.length >= 1) {
      const gName = sanitizeText(pMatches[0]);
      const gDesc = sanitizeText(pMatches[1]) || 'in game';
      if (dsGameBadge) dsGameBadge.style.display = 'inline-flex';
      if (dsValDefault) dsValDefault.style.display = 'none';
      if (dsGameView) dsGameView.style.display = 'flex';
      if (dsGameName) dsGameName.textContent = gName;
      if (dsGameDesc) dsGameDesc.textContent = gDesc;
      return;
    }
  }

  if (isDoingNothing || musicMatch) {
    if (dsGameBadge) dsGameBadge.style.display = 'none';
    if (dsValDefault) dsValDefault.style.display = 'flex';
    if (dsGameView) dsGameView.style.display = 'none';
  }
}

// ── 7.1. ИНТЕГРАЦИЯ С LANYARD (DISCORD GATEWAY & HIGH-SPEED EDGE PROXIES) ──
let lanyardWs = null;
let lanyardHeartbeat = null;
let lanyardPollTimer = null;
let isLanyardPolling = false;
let isFetchingLanyard = false;
let activeLanyardIndex = 0;

// Высокоскоростные отказоустойчивые эндпоинты (без блокировки ТСПУ РКН, 100% CORS):
const LANYARD_ENDPOINTS = [
  // 1. Быстрый Cloudflare Worker (<0.35s ответ из РФ, полный CORS)
  (id) => `https://cors-get-proxy.sirjosh.workers.dev/?url=https://api.lanyard.rest/v1/users/${id}`,
  // 2. Fly.io Edge Relay (<0.7s ответ из РФ, надежный резервный канал)
  (id) => `https://cors-anywhere.fly.dev/https://api.lanyard.rest/v1/users/${id}`,
  // 3. Прямой Lanyard API (для пользователей с VPN или за пределами РФ)
  (id) => `https://api.lanyard.rest/v1/users/${id}`
];

// HTTP-опрос Lanyard API через отказоустойчивый пул
async function fetchLanyardUser() {
  if (!CONFIG.discordId || isFetchingLanyard) return;
  isFetchingLanyard = true;

  try {
    const total = LANYARD_ENDPOINTS.length;

    for (let attempt = 0; attempt < total; attempt++) {
      const idx = (activeLanyardIndex + attempt) % total;
      const url = LANYARD_ENDPOINTS[idx](CONFIG.discordId);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2200);

      try {
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            activeLanyardIndex = idx; // Запоминаем быстрый рабочий шлюз
            handlePresence(json.data);
            return;
          }
        }
      } catch (e) {
        // При ошибке переключаемся на следующий в списке
      } finally {
        clearTimeout(timer);
      }
    }

    // Резервный опрос через cnrad SVG если все JSON-шлюзы недоступны
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    try {
      const svgRes = await fetch(`https://cors-anywhere.fly.dev/https://lanyard.cnrad.dev/api/${CONFIG.discordId}`, {
        signal: ctrl.signal,
        cache: 'no-store'
      });
      if (svgRes.ok) {
        const svgText = await svgRes.text();
        if (svgText) parseSvgPresence(svgText);
      }
    } catch (e) {
    } finally {
      clearTimeout(timer);
    }
  } finally {
    isFetchingLanyard = false;
  }
}

function startLanyardPolling() {
  if (document.hidden) return;
  if (isLanyardPolling) return;
  isLanyardPolling = true;
  fetchLanyardUser();
  if (!lanyardPollTimer) {
    lanyardPollTimer = setInterval(fetchLanyardUser, 2500);
  }
}

function stopLanyardPolling() {
  isLanyardPolling = false;
  if (lanyardPollTimer) {
    clearInterval(lanyardPollTimer);
    lanyardPollTimer = null;
  }
}

function initLanyard() {
  if (!CONFIG.discordId) return;

  // Всегда запускаем HTTP-опрос сразу для мгновенного ответа за 300мс без VPN
  startLanyardPolling();

  // Пытаемся также открыть прямой WebSocket (для пользователей с VPN/за границей)
  try {
    if (lanyardWs) {
      try { lanyardWs.close(); } catch (e) {}
    }
    lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

    const wsConnectTimeout = setTimeout(() => {
      // Если сокет не открылся за 2.5 сек (блокировка ТСПУ в РФ), мягко закрываем
      if (lanyardWs && lanyardWs.readyState !== WebSocket.OPEN) {
        try { lanyardWs.close(); } catch (e) {}
      }
    }, 2500);

    lanyardWs.onopen = () => {
      clearTimeout(wsConnectTimeout);
      stopLanyardPolling();
      lanyardWs.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: CONFIG.discordId }
      }));
    };

    lanyardWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.op === 1) { // Hello packet
          clearInterval(lanyardHeartbeat);
          lanyardHeartbeat = setInterval(() => {
            if (lanyardWs && lanyardWs.readyState === WebSocket.OPEN) {
              lanyardWs.send(JSON.stringify({ op: 3 }));
            }
          }, data.d.heartbeat_interval);
        } else if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
          handlePresence(data.d);
        }
      } catch (e) {}
    };

    lanyardWs.onerror = () => {
      clearTimeout(wsConnectTimeout);
      startLanyardPolling();
    };

    lanyardWs.onclose = () => {
      clearTimeout(wsConnectTimeout);
      clearInterval(lanyardHeartbeat);
      startLanyardPolling();
    };
  } catch (e) {
    startLanyardPolling();
  }
}

// ── 7.2. ИНТЕГРАЦИЯ С LAST.FM (ДЛЯ ЯНДЕКС МУЗЫКИ & SPOTIFY) ──────
async function pollLastFm() {
  if (!CONFIG.lastfmUser || isLivePlaying) return;

  try {
    const safeUser = encodeURIComponent(CONFIG.lastfmUser);
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${safeUser}&api_key=4cb074e4b8ec4ee9ad356c3c666a01fe&format=json&limit=1`);
    if (!res.ok) return;
    const data = await res.json();
    const track = data.recenttracks && data.recenttracks.track && data.recenttracks.track[0];

    if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
      const coverUrl = (track.image && track.image[3] && track.image[3]['#text']) || (track.image && track.image[2] && track.image[2]['#text']) || '';
      const artistName = track.artist && (track.artist['#text'] || track.artist.name) ? (track.artist['#text'] || track.artist.name) : 'Unknown Artist';
      applyLiveMusic({
        title: sanitizeText(track.name || 'Music Track'),
        artist: sanitizeText(artistName),
        coverUrl: sanitizeUrl(coverUrl),
        duration: 200,
        progress: 15,
        source: 'Яндекс Музыка'
      });
    } else if (isLivePlaying) {
      setPlayerIdle();
    }
  } catch (e) {}
}

if (CONFIG.lastfmUser) {
  pollLastFm();
  setInterval(pollLastFm, 8000);
}

setPlayerIdle();
initLanyard();

// Пауза Lanyard-опроса в неактивной вкладке и обновление при возврате (BUG-09)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopLanyardPolling();
  } else {
    if (!lanyardWs || lanyardWs.readyState !== WebSocket.OPEN) {
      startLanyardPolling();
    }
    fetchGlobalPets();
  }
});

// ── 8. DISCORD CLICK-TO-COPY ───────────────────────────
const cardDiscord = $('card-discord');
if (cardDiscord) {
  function showDiscordCopiedFeedback() {
    const badge = $('ds-badge');
    const gameBadgeText = $('ds-game-badge-text');
    if (gameBadgeText && $('ds-game-badge') && $('ds-game-badge').style.display !== 'none') {
      const oldText = gameBadgeText.textContent;
      gameBadgeText.textContent = 'copied tag!';
      setTimeout(() => { gameBadgeText.textContent = oldText; }, 1800);
    }
    if (badge) {
      badge.textContent = 'copied!';
      badge.style.color = 'var(--accent)';
      badge.style.borderColor = 'var(--accent)';
      setTimeout(() => {
        badge.textContent = 'copy';
        badge.style.color = '';
        badge.style.borderColor = '';
      }, 1800);
    }
  }

  function fallbackCopyText(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(ta);
      if (successful) {
        showDiscordCopiedFeedback();
      }
    } catch (err) {}
  }

  cardDiscord.addEventListener('click', (e) => {
    e.preventDefault();
    const tag = CONFIG.discordTag || 'fanet666';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tag).then(() => {
        showDiscordCopiedFeedback();
      }).catch(() => {
        fallbackCopyText(tag);
      });
    } else {
      fallbackCopyText(tag);
    }
  });
}

// ── 9. SOUND EFFECTS TOGGLE ────────────────────────────
const soundBtn = $('sound-btn');
const soundLabel = $('sound-label');
const soundWaves = $('sound-waves');

function updateSfxState() {
  if (soundLabel) soundLabel.textContent = CONFIG.soundEffects ? 'sfx on' : 'sfx off';
  if (soundWaves) soundWaves.style.display = CONFIG.soundEffects ? 'inline' : 'none';

  if (cat) {
    if (!CONFIG.soundEffects) {
      // При выключении звука: крестик вместо носика, анимация волнения и прищуренный вид
      cat.classList.add('sfx-muted');
      setFace('squint');
      renderCatCaption();
    } else {
      // При включении звука: возвращаем нормальный носик, убираем волнение
      cat.classList.remove('sfx-muted');
      setFace('normal');
      renderCatCaption();
      playPurrSound();
    }
  }
}

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    CONFIG.soundEffects = !CONFIG.soundEffects;
    updateSfxState();
  });
}

// ── 10. DYNAMIC CONFIG POPULATION ──────────────────────
if ($('hero-name')) $('hero-name').textContent = sanitizeText(CONFIG.name);
if ($('tg-handle')) $('tg-handle').textContent = '@' + sanitizeText(CONFIG.telegram);
if ($('tg-card')) $('tg-card').href = sanitizeUrl('https://t.me/' + CONFIG.telegram);
if ($('link-tg-pill')) $('link-tg-pill').href = sanitizeUrl('https://t.me/' + CONFIG.telegram);
if ($('link-insta')) $('link-insta').href = sanitizeUrl(CONFIG.instagramUrl || ('https://www.instagram.com/' + CONFIG.instagram));
if ($('link-steam')) $('link-steam').href = sanitizeUrl('https://steamcommunity.com/id/' + CONFIG.steam + '/');

if ($('link-twitch')) {
  $('link-twitch').href = sanitizeUrl('https://www.twitch.tv/' + CONFIG.twitch);
  $('link-twitch').title = 'Twitch: ' + sanitizeText(CONFIG.twitch);
}
if ($('tw-handle')) $('tw-handle').textContent = sanitizeText(CONFIG.twitch);

const aboutContainer = $('about-content');
if (aboutContainer) {
  aboutContainer.textContent = '';
  const aboutP = document.createElement('p');
  aboutP.textContent = sanitizeText(CONFIG.about);
  aboutContainer.appendChild(aboutP);
}

if ($('ds-text')) $('ds-text').textContent = sanitizeText(CONFIG.discordTag || 'fanet666');
if ($('card-discord')) {
  $('card-discord').title = `Discord: ${sanitizeText(CONFIG.discordTag || 'fanet666')} (кликните, чтобы скопировать)`;
}

// Defensively enforce rel="noopener noreferrer" across all external links
document.querySelectorAll('a[target="_blank"]').forEach((a) => {
  a.setAttribute('rel', 'noopener noreferrer');
});

// ── 11. EASTER EGG (JULIA) ─────────────────────────────
const secretBtn = $('secret-btn');
const secretModal = $('secret-modal');
const secretBackdrop = $('secret-backdrop');
const secretClose = $('secret-close');

function openSecretModal() {
  if (!secretModal) return;
  secretModal.classList.add('is-active');
  secretModal.setAttribute('aria-hidden', 'false');
  if (secretClose) secretClose.focus();

  // Play gentle chime if audio is enabled
  if (CONFIG.soundEffects) {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.001, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.45);
        });
      }
    } catch (e) {}
  }
}

function closeSecretModal() {
  if (!secretModal) return;
  secretModal.classList.remove('is-active');
  secretModal.setAttribute('aria-hidden', 'true');
  if (secretBtn) secretBtn.focus();
}

if (secretBtn) secretBtn.addEventListener('click', openSecretModal);
if (secretClose) secretClose.addEventListener('click', closeSecretModal);
if (secretBackdrop) secretBackdrop.addEventListener('click', closeSecretModal);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && secretModal && secretModal.classList.contains('is-active')) {
    closeSecretModal();
  }
});
