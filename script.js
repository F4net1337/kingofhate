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

  // Timezone difference with visitor (Yekaterinburg UTC+5)
  const diffMinutes = tzOffset(CONFIG.tz, now) + now.getTimezoneOffset();
  const diffHours = diffMinutes / 60;
  const absH = Math.abs(diffHours);
  const hs = (Number.isInteger(absH) ? absH : absH.toFixed(1)) + 'h';
  const off = tzOffset(CONFIG.tz, now);
  const tzLabel = 'gmt' + (off < 0 ? '-' : '+') + Math.floor(Math.abs(off) / 60);

  const tzDiffEl = $('tzdiff');
  if (tzDiffEl) {
    const diffStr = diffHours === 0 ? ' · your time' : diffHours > 0 ? ` · ${hs} ahead` : ` · ${hs} behind`;
    tzDiffEl.textContent = `utc+5 · ekb (msk+2)${diffStr}`;
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

const PETS_API_READ = 'https://counterapi.com/api/kingofhate/pets/cat?readOnly=true';
const PETS_API_UP = 'https://counterapi.com/api/kingofhate/pets/cat';

let myPets = 0;
let totalPets = 0;

try {
  myPets = parseInt(localStorage.getItem('rin_green_mypets'), 10) || 0;
  const cachedTotal = parseInt(localStorage.getItem('rin_green_totalpets'), 10) || 0;
  totalPets = Math.max(cachedTotal, myPets);
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
  const displayTotal = Math.max(totalPets, myPets);
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

// Загрузка глобального счетчика со всего мира
async function fetchGlobalPets() {
  try {
    const res = await fetch(PETS_API_READ);
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.value === 'number') {
      totalPets = Math.max(totalPets, myPets, data.value);
      try { localStorage.setItem('rin_green_totalpets', totalPets); } catch (e) {}
      renderPets(false);
    }
  } catch (e) {}
}
fetchGlobalPets();
// Фоновая синхронизация каждые 12 секунд
setInterval(fetchGlobalPets, 12000);

let pendingPetSync = 0;
let petDebounceTimer = null;

function syncPetIncrement() {
  pendingPetSync++;
  if (!petDebounceTimer) {
    petDebounceTimer = setTimeout(async () => {
      petDebounceTimer = null;
      const count = pendingPetSync;
      pendingPetSync = 0;
      for (let i = 0; i < count; i++) {
        try {
          const res = await fetch(PETS_API_UP);
          if (res.ok) {
            const data = await res.json();
            if (typeof data.value === 'number') {
              totalPets = Math.max(totalPets, myPets, data.value);
              try { localStorage.setItem('rin_green_totalpets', totalPets); } catch (e) {}
              renderPets(false);
            }
          }
        } catch (e) {}
      }
    }, 150);
  }
}

const PET_FACES = ['happy', 'squint', 'hearts', 'stars', 'content', 'shiny'];
let lastFace = '';
let petTimestamps = [];
let blushTimer;

function handlePet(x, y) {
  myPets++;
  totalPets = Math.max(totalPets + 1, myPets);
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
    if (!e.isTrusted || e.detail === 0) return;
    const r = cat.getBoundingClientRect();
    handlePet(e.clientX - r.left, e.clientY - r.top);
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
  isLivePlaying = true;
  liveTrackData = track;

  const now = Date.now();
  if (track.startMs) {
    liveTrackStart = track.startMs;
  } else if (track.progress !== undefined) {
    liveTrackStart = now - (track.progress * 1000);
  } else {
    liveTrackStart = now;
  }

  liveTrackDuration = Math.max(1000, (track.duration || 180) * 1000);

  if (npName) npName.textContent = track.title;
  if (npArtists) {
    npArtists.style.display = '';
    npArtists.innerHTML = `${track.artist} <small style="color:var(--accent);margin-left:4px;">• live</small>`;
  }

  const statusPill = document.querySelector('.np-status-pill');
  const dot = document.querySelector('.np-dot');
  if (statusPill) statusPill.classList.remove('idle');
  if (dot) dot.classList.remove('idle');
  if (npStatusText) npStatusText.textContent = `now playing · ${track.source || 'Dotify'}`;

  if (track.coverUrl) {
    if (npCover) {
      npCover.style.backgroundImage = `url("${track.coverUrl}")`;
      npCover.style.backgroundSize = 'cover';
      npCover.style.backgroundPosition = 'center';
    }
    if (npBg) {
      npBg.style.backgroundImage = `url("${track.coverUrl}")`;
      npBg.style.backgroundSize = 'cover';
      npBg.style.backgroundPosition = 'center';
    }
  }

  // Запуск плавного хода прогресс-бара
  startProgressBar();
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

// ── 7.1. ИНТЕГРАЦИЯ С LANYARD (DISCORD GATEWAY & RPC) ──
let lanyardWs = null;
let lanyardHeartbeat = null;
let lanyardPollTimer = null;
let isLanyardPolling = false;

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
    const st = p.discord_status || 'offline';
    statusDot.className = `ds-status-dot ${st}`;
    statusDot.title = `status: ${st}`;
  }

  const activities = p.activities || [];

  // 2. ИГРОВАЯ АКТИВНОСТЬ (например: Fortnite, CS2, Dota 2, Roblox, Xbox)
  const gameAct = activities.find(isGameActivity);

  const dsGameBadge = $('ds-game-badge');
  const dsValDefault = $('ds-val-default');
  const dsGameView = $('ds-game-view');
  const dsGameName = $('ds-game-name');
  const dsGameDesc = $('ds-game-desc');

  if (gameAct) {
    if (dsGameBadge) dsGameBadge.style.display = 'inline-flex';
    if (dsValDefault) dsValDefault.style.display = 'none';
    if (dsGameView) dsGameView.style.display = 'flex';
    if (dsGameName) dsGameName.textContent = gameAct.name;

    let desc = gameAct.details || gameAct.state || '';
    if (gameAct.timestamps && gameAct.timestamps.start) {
      const elapsedMs = Math.max(0, Date.now() - gameAct.timestamps.start);
      const h = Math.floor(elapsedMs / 3600000);
      const m = Math.floor((elapsedMs % 3600000) / 60000);
      const timeStr = h > 0 ? `${h}h ${m}m in game` : `${m}m in game`;
      desc = desc ? `${desc} · ${timeStr}` : timeStr;
    }
    if (dsGameDesc) dsGameDesc.textContent = desc || 'playing now';
  } else {
    if (dsGameBadge) dsGameBadge.style.display = 'none';
    if (dsValDefault) dsValDefault.style.display = 'flex';
    if (dsGameView) dsGameView.style.display = 'none';
  }

  // 3. МУЗЫКАЛЬНАЯ АКТИВНОСТЬ (Dotify / Spotify / Яндекс Музыка)
  // А) Проверка Spotify через прямой модуль Lanyard
  if (p.listening_to_spotify && p.spotify) {
    const sp = p.spotify;
    const start = sp.timestamps.start;
    const end = sp.timestamps.end;
    const progress = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const duration = Math.max(1, Math.floor((end - start) / 1000));

    applyLiveMusic({
      title: sp.song,
      artist: sp.artist,
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
      cover = musicAct.assets.large_image.startsWith('mp:external')
        ? musicAct.assets.large_image.replace(/^mp:external\/[^\/]+\/(https?)\//, '$1://')
        : (musicAct.assets.large_image.startsWith('http')
            ? musicAct.assets.large_image
            : `https://cdn.discordapp.com/app-assets/${musicAct.application_id}/${musicAct.assets.large_image}.png`);
    }

    const start = musicAct.timestamps && musicAct.timestamps.start ? musicAct.timestamps.start : Date.now();
    const end = musicAct.timestamps && musicAct.timestamps.end ? musicAct.timestamps.end : null;
    const progress = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const duration = end ? Math.max(1, Math.floor((end - start) / 1000)) : 210;

    applyLiveMusic({
      title: musicAct.details || musicAct.name,
      artist: musicAct.state || 'Playing',
      coverUrl: cover,
      startMs: start,
      duration,
      progress,
      source: musicAct.name || 'Dotify'
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
    const srcName = musicMatch[1] ? musicMatch[1].trim() : 'Dotify';
    const pMatches = [...svg.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(m => m[1]);
    const title = pMatches[1] || 'Music Track';
    const artistRaw = pMatches[2] || '';
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
  } else if (isLivePlaying && !liveTrackData) {
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
    const pMatches = [...svg.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(m => m[1]);
    if (pMatches.length >= 1) {
      const gName = pMatches[0];
      const gDesc = pMatches[1] || 'in game';
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

// Резервный HTTP-опрос через прямые и CORS-проксированные эндпоинты
async function fetchLanyardUser() {
  if (!CONFIG.discordId) return;

  const rawUrl = `https://api.lanyard.rest/v1/users/${CONFIG.discordId}`;
  const endpoints = [
    rawUrl,
    `https://lanyard.rest/v1/users/${CONFIG.discordId}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`
  ];

  for (const ep of endpoints) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch(ep, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
      clearTimeout(timer);
      if (!res.ok) continue;
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}
      if (json && json.data) {
        handlePresence(json.data);
        return;
      }
    } catch (e) {}
  }

  // Резервный опрос через SVG-карточку cnrad.dev (100% стабильный Cloudflare)
  try {
    const svgUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://lanyard.cnrad.dev/api/${CONFIG.discordId}`)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(svgUrl, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const svg = await res.text();
      if (svg && svg.includes('<svg')) {
        parseSvgPresence(svg);
      }
    }
  } catch (e) {}
}

function startLanyardPolling() {
  if (isLanyardPolling) return;
  isLanyardPolling = true;
  fetchLanyardUser();
  if (!lanyardPollTimer) {
    lanyardPollTimer = setInterval(fetchLanyardUser, 4000);
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

  // Всегда запускаем первоначальный опрос сразу для быстрого ответа
  startLanyardPolling();

  try {
    if (lanyardWs) {
      try { lanyardWs.close(); } catch (e) {}
    }
    lanyardWs = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardWs.onopen = () => {
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
      startLanyardPolling();
    };

    lanyardWs.onclose = () => {
      clearInterval(lanyardHeartbeat);
      startLanyardPolling();
      setTimeout(initLanyard, 12000);
    };
  } catch (e) {
    startLanyardPolling();
  }
}

// ── 7.2. ИНТЕГРАЦИЯ С LAST.FM (ДЛЯ ЯНДЕКС МУЗЫКИ & SPOTIFY) ──────
async function pollLastFm() {
  if (!CONFIG.lastfmUser || isLivePlaying) return;

  try {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${CONFIG.lastfmUser}&api_key=4cb074e4b8ec4ee9ad356c3c666a01fe&format=json&limit=1`);
    if (!res.ok) return;
    const data = await res.json();
    const track = data.recenttracks && data.recenttracks.track && data.recenttracks.track[0];

    if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
      const coverUrl = (track.image && track.image[3] && track.image[3]['#text']) || (track.image && track.image[2] && track.image[2]['#text']) || '';
      applyLiveMusic({
        title: track.name,
        artist: track.artist['#text'] || track.artist.name,
        coverUrl,
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

initLanyard();
setPlayerIdle();

// ── 8. DISCORD CLICK-TO-COPY ───────────────────────────
const cardDiscord = $('card-discord');
if (cardDiscord) {
  cardDiscord.addEventListener('click', (e) => {
    e.preventDefault();
    const tag = CONFIG.discordTag || 'fanet666';
    navigator.clipboard.writeText(tag).then(() => {
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
    }).catch(() => {});
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
if ($('hero-name')) $('hero-name').textContent = CONFIG.name;
if ($('tg-handle')) $('tg-handle').textContent = '@' + CONFIG.telegram;
if ($('tg-card')) $('tg-card').href = 'https://t.me/' + CONFIG.telegram;
if ($('link-tg-pill')) $('link-tg-pill').href = 'https://t.me/' + CONFIG.telegram;
if ($('link-insta')) $('link-insta').href = CONFIG.instagramUrl || ('https://www.instagram.com/' + CONFIG.instagram);
if ($('link-steam')) $('link-steam').href = 'https://steamcommunity.com/id/' + CONFIG.steam + '/';
if ($('about-content')) $('about-content').innerHTML = `<p>${CONFIG.about}</p>`;
if ($('ds-text')) $('ds-text').textContent = CONFIG.discordTag || 'fanet666';

// ── 11. EASTER EGG (JULIA) ─────────────────────────────
const secretBtn = $('secret-btn');
const secretModal = $('secret-modal');
const secretBackdrop = $('secret-backdrop');
const secretClose = $('secret-close');

function openSecretModal() {
  if (!secretModal) return;
  secretModal.classList.add('is-active');
  secretModal.setAttribute('aria-hidden', 'false');

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
}

if (secretBtn) secretBtn.addEventListener('click', openSecretModal);
if (secretClose) secretClose.addEventListener('click', closeSecretModal);
if (secretBackdrop) secretBackdrop.addEventListener('click', closeSecretModal);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && secretModal && secretModal.classList.contains('is-active')) {
    closeSecretModal();
  }
});
