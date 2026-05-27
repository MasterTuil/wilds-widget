import { CREATURES } from '../web/src/data/creatures.js';
import { FOODS }     from '../web/src/data/foods.js';
import { GameState } from '../web/src/GameState.js';
import { sfx }       from './sfx.js';

// ── Constants ─────────────────────────────────────────────────────
const FPS      = 8;
const FRAME_MS = 1000 / FPS;
const SCALE    = 2;
const BLEND_MS = 70;   // crossfade between sprite frames — softens hard frame swaps

// Per-animation frame rates (overrides FPS). Hand-tuned for personality:
// happy = snappy, sad = droopy slow, walk = brisker than idle.
const ANIM_FPS = {
  idle: 8,            idle_east: 8,      idle_west: 8,
  walk_east: 10,      walk_northeast: 10, walk_northwest: 10,
  walk_southeast: 10, walk_southwest: 10,
  happy: 6,           eating: 7,         sad: 4,
  training: 10,       shower: 4,         wave: 6,
};

// ── State ─────────────────────────────────────────────────────────
let gs, creature, save;
let frames       = {};
let currentAnim  = 'idle';
let currentFrame = 0;
let prevFrameIdx = 0;
let frameSwapAt  = 0;
let frameTimer   = 0;
let lastTime     = 0;

let posX        = 0.5;
let posY        = 1.05;
let targetX     = 0.5;
let targetY     = 1.05;
let isMoving    = false;
let facingLeft  = false;
let wanderTimer = 0;
let wanderDelay = 3000 + Math.random() * 4000;
const SPEED     = 0.00012;

// ── Behavior state ────────────────────────────────────────────────
const BEH = {
  attention:     100,   // 0-100, drains when ignored
  subMood:       'content',
  primaryState:  'idle', // idle | seeking | sleeping | distressed
  seekTriggered: false,
  zzzTimer:      0,
  bobTimer:      0,
  mischievTimer: 0,
  mischievDelay: 0,    // set on first tick
};

function behaviorTick(deltaMs) {
  const profile = creature.behaviorProfile ?? { patience: 7, curiosity: 5 };
  const needs   = gs.state?.needs ?? {};
  const hour    = new Date().getHours();

  // Drain attention
  const drainMs  = profile.patience * 60 * 1000;
  BEH.attention  = Math.max(0, BEH.attention - (100 / drainMs) * deltaMs);

  // Sub-mood
  const avg = ((needs.hunger ?? 80) + (needs.mood ?? 80) + (needs.energy ?? 80) + (needs.hygiene ?? 80)) / 4;
  if      ((needs.hunger ?? 80) < 25)     BEH.subMood = 'hungry';
  else if ((needs.energy ?? 80) < 20)     BEH.subMood = 'tired';
  else if (hour >= 23 || hour < 6)        BEH.subMood = 'tired';
  else if (BEH.attention < 25)            BEH.subMood = 'bored';
  else if (avg > 70)                      BEH.subMood = 'playful';
  else                                    BEH.subMood = 'content';

  // Primary state
  if (avg < 20) {
    BEH.primaryState = 'distressed';
  } else if (BEH.attention <= 0) {
    BEH.primaryState = 'seeking';
    if (!BEH.seekTriggered) {
      BEH.seekTriggered = true;
      triggerAttentionSeek();
    }
  } else if ((hour >= 23 || hour < 6) && (needs.energy ?? 100) < 40) {
    BEH.primaryState = 'sleeping';
  } else {
    BEH.primaryState = 'idle';
  }

  // Zzz particles while sleeping
  if (BEH.primaryState === 'sleeping') {
    BEH.zzzTimer++;
    if (BEH.zzzTimer % 3 === 0) spawnZzz();
  } else {
    BEH.zzzTimer = 0;
  }

}

function onInteraction() {
  BEH.attention     = 100;
  BEH.seekTriggered = false;
  if (BEH.primaryState !== 'idle') BEH.primaryState = 'idle';
}

// ── Procedural animation FX (squash/stretch, hop, tilt) ──────────
const animFX = { type: null, start: 0, duration: 0 };

function triggerFX(type) {
  animFX.type     = type;
  animFX.start    = performance.now();
  animFX.duration = type === 'levelup' ? 750 : type === 'feed' ? 520 : 420;
}

function getFX() {
  if (!animFX.type) return { sx: 1, sy: 1, dy: 0, rot: 0 };
  const p = (performance.now() - animFX.start) / animFX.duration;
  if (p >= 1) { animFX.type = null; return { sx: 1, sy: 1, dy: 0, rot: 0 }; }

  switch (animFX.type) {
    case 'pet': {
      const e = Math.sin(p * Math.PI);
      return { sx: 1 + e * 0.10, sy: 1 - e * 0.08, dy: -e * 3, rot: 0 };
    }
    case 'feed': {
      const e = Math.abs(Math.sin(p * Math.PI * 2));
      return { sx: 1 + e * 0.07, sy: 1 - e * 0.06, dy: 0, rot: 0 };
    }
    case 'bathe': {
      const e = Math.sin(p * Math.PI);
      return { sx: 1 - e * 0.05, sy: 1 + e * 0.08, dy: -e * 2, rot: Math.sin(p * Math.PI * 3) * 0.04 };
    }
    case 'levelup': {
      if (p < 0.22) {
        const k = p / 0.22;
        return { sx: 1 + 0.18 * k, sy: 1 - 0.22 * k, dy: 0, rot: 0 };
      } else {
        const k = (p - 0.22) / 0.78;
        const spring = Math.sin(k * Math.PI);
        return { sx: 1 - 0.10 * spring, sy: 1 + 0.20 * spring, dy: -spring * 14, rot: 0 };
      }
    }
  }
  return { sx: 1, sy: 1, dy: 0, rot: 0 };
}

// ── Canvas ────────────────────────────────────────────────────────
const canvas = document.getElementById('widget-canvas');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  const strip   = document.getElementById('ground-strip');
  canvas.width  = strip.clientWidth;
  canvas.height = strip.clientHeight;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Image loader ──────────────────────────────────────────────────
function loadImage(path) {
  if (frames[path]) return Promise.resolve();
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => { frames[path] = img; resolve(); };
    img.onerror = () => { console.warn('Missing:', path); resolve(); };
    img.src = '../web/' + path;
  });
}

// ── Animation helpers ─────────────────────────────────────────────
function idleAnim() {
  const dir = facingLeft ? 'idle_west' : 'idle_east';
  return creature.animations[dir] ? dir : 'idle';
}

function isIdleAnim(name) {
  return name === 'idle' || name === 'idle_east' || name === 'idle_west';
}

function isWalkAnim(name) {
  return name?.startsWith('walk_');
}

function setAnim(name) {
  if (currentAnim === name) return;
  currentAnim  = name;
  currentFrame = 0;
  prevFrameIdx = 0;
  frameSwapAt  = 0;
  frameTimer   = 0;
}

// Returns { anim, flip } based on movement vector
function getWalkDir(dx, dy) {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle > -22.5  && angle <=  22.5) return { anim: 'walk_east',      flip: false };
  if (angle >  22.5  && angle <=  67.5) return { anim: 'walk_southeast', flip: false };
  if (angle >  67.5  && angle <= 112.5) return { anim: 'walk_southeast', flip: false };
  if (angle > 112.5  && angle <= 157.5) return { anim: 'walk_southwest', flip: false };
  if (angle >  157.5 || angle <= -157.5)return { anim: 'walk_east',      flip: true  };
  if (angle > -157.5 && angle <= -112.5)return { anim: 'walk_northwest', flip: false };
  if (angle > -112.5 && angle <=  -67.5)return { anim: 'walk_northwest', flip: false };
  if (angle >  -67.5 && angle <=  -22.5)return { anim: 'walk_northeast', flip: false };
  return { anim: 'walk_east', flip: false };
}

// ── Toast ─────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('widget-toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── Needs dots ────────────────────────────────────────────────────
const DOT_IDS  = ['need-hunger', 'need-energy', 'need-mood', 'need-hygiene'];
const NEED_KEYS = ['hunger', 'energy', 'mood', 'hygiene'];

function updateNeedDots(state) {
  NEED_KEYS.forEach((key, i) => {
    const el  = document.getElementById(DOT_IDS[i]);
    if (!el) return;
    const val = (state.needs ?? state)[key] ?? 100;
    el.className = 'need-chip' + (val < 25 ? ' crit' : val < 50 ? ' warn' : '');
    const fill = el.querySelector('.need-bar-fill');
    if (fill) fill.style.width = Math.max(0, Math.min(100, val)) + '%';
  });
}

// ── Mood bubble ───────────────────────────────────────────────────
const MOOD_GLYPHS = {
  sad:      { text: 'z',  cls: 'mood-sleep'    },
  critical: { text: '!!', cls: 'mood-critical' },
  seeking:  { text: '!',  cls: 'mood-seeking'  },
};

function updateMoodBubble(mood) {
  const el = document.getElementById('mood-bubble');
  const m  = MOOD_GLYPHS[mood];
  el.className = 'mood-bubble' + (m ? ' ' + m.cls : ' hidden');
  el.textContent = m ? m.text : '';
}

// ── Stats panel ───────────────────────────────────────────────────
function buildEvoPaths() {
  const container = document.getElementById('evo-paths');
  container.innerHTML = '';
  (creature.evolutionPaths || []).forEach(path => {
    if (!path.prob) return;
    const row = document.createElement('div');
    row.className = 'evo-path';
    row.innerHTML = `
      <span class="evo-path-name">${path.name}</span>
      <div class="evo-path-bar">
        <div class="evo-path-fill" style="width:${Math.round(path.prob * 100)}%"></div>
      </div>
      <span class="evo-path-pct">${Math.round(path.prob * 100)}%</span>
    `;
    container.appendChild(row);
  });
}

function updateStatsPanel() {
  if (!gs.state) return;
  const needs = gs.state.needs;
  ['hunger','energy','mood','hygiene'].forEach(key => {
    const val  = Math.round(needs[key] ?? 0);
    const fill = document.getElementById(`bar-${key}`);
    const num  = document.getElementById(`val-${key}`);
    if (!fill || !num) return;
    fill.style.width = val + '%';
    fill.className   = 'stat-fill' + (val < 25 ? ' crit' : val < 50 ? ' warn' : '');
    num.textContent  = val;
  });
}

// ── Day label ─────────────────────────────────────────────────────
function updateDayLabel() {
  const days = gs.state?.daysAlive ?? 0;
  document.getElementById('day-label').textContent =
    `DAY ${Math.max(1, days + 1)}`;
}

// ── Habitat theme ─────────────────────────────────────────────────
// Habitat backdrop + cloud layer image paths (relative to widget.css)
const HABITAT_LAYERS = {
  meadow: {
    backdrop: '../web/assets/_v2/habitats/meadow_v2.png',
    clouds:   '../web/assets/_v2/habitats/meadow_clouds.png',
  },
  // cave: future Pixellab cave scene
};

function applyTheme(habitat) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(habitat.theme)) {
    root.style.setProperty(k, v);
  }
  root.style.setProperty('--ground-top', habitat.theme['--bg-mid']   || '#1a1232');
  root.style.setProperty('--ground-bot', habitat.theme['--bg-panel'] || '#0d0a1e');

  // Backdrop + clouds for this habitat (if defined)
  const bd  = document.getElementById('habitat-backdrop');
  const cld = document.getElementById('habitat-clouds');
  const layers = HABITAT_LAYERS[habitat.id];
  if (bd && cld) {
    if (layers) {
      bd.style.backgroundImage  = `url('${layers.backdrop}')`;
      cld.style.backgroundImage = `url('${layers.clouds}')`;
      bd.classList.add('loaded');
      cld.classList.add('loaded');
    } else {
      bd.classList.remove('loaded');
      cld.classList.remove('loaded');
    }
  }
}

// ── Day / Night cycle ─────────────────────────────────────────────
// Each habitat has colors per phase: day | sunset | evening | night
const TIME_PHASES = {
  cave: {
    day:     { overlay: null,                       border: null,      shadow: null },
    sunset:  { overlay: 'rgba(160, 60, 15, 1)',     border: '#b06840', shadow: 'rgba(176,104,64,0.45)' },
    evening: { overlay: 'rgba(20, 10, 60, 1)',      border: '#5a48a0', shadow: 'rgba(90,72,160,0.45)'  },
    night:   { overlay: 'rgba(4, 6, 30, 1)',        border: '#2e3d7a', shadow: 'rgba(46,61,122,0.45)'  },
  },
  meadow: {
    day:     { overlay: null,                       border: null,      shadow: null },
    sunset:  { overlay: 'rgba(200, 90, 20, 1)',     border: '#c87840', shadow: 'rgba(200,120,64,0.45)' },
    evening: { overlay: 'rgba(15, 20, 55, 1)',      border: '#4a58a0', shadow: 'rgba(74,88,160,0.45)'  },
    night:   { overlay: 'rgba(3, 8, 28, 1)',        border: '#283668', shadow: 'rgba(40,54,104,0.45)'  },
  },
};

// Opacity per phase
const PHASE_OPACITY = { day: 0, sunset: 0.10, evening: 0.18, night: 0.30 };

let currentPhase = null;

// Generate static star positions once
const STARS = Array.from({ length: 18 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.55,       // upper portion of strip only
  r: 0.6 + Math.random() * 1.0,
  twinkle: Math.random() * Math.PI * 2,
}));

function getTimePhase() {
  const h = new Date().getHours();
  if (h >= 6  && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'sunset';
  if (h >= 20 && h < 23) return 'evening';
  return 'night';
}

function updateTimeOfDay() {
  const phase = getTimePhase();
  if (phase === currentPhase) return;
  currentPhase = phase;

  const habitatId = creature?.habitat?.id ?? 'cave';
  const colors    = TIME_PHASES[habitatId]?.[phase] ?? TIME_PHASES.cave[phase];
  const overlay   = document.getElementById('time-overlay');
  const strip     = document.getElementById('ground-strip');

  // Overlay tint
  if (colors.overlay) {
    overlay.style.background = colors.overlay;
    overlay.style.opacity    = PHASE_OPACITY[phase];
  } else {
    overlay.style.opacity = 0;
  }

  // Border glow shift
  if (colors.border) {
    strip.style.borderTopColor = colors.border;
    strip.style.boxShadow      = `0 -12px 48px ${colors.shadow}, 0 -2px 8px ${colors.shadow}`;
  } else {
    // Reset to habitat default
    strip.style.borderTopColor = '';
    strip.style.boxShadow      = '';
  }
}

// Star opacity driven by phase (drawn on canvas in drawEnv)
function starOpacity() {
  if (currentPhase === 'night')   return 0.75;
  if (currentPhase === 'evening') return 0.25;
  return 0;
}

function drawStars() {
  const alpha = starOpacity();
  if (alpha <= 0) return;
  const W = canvas.width;
  const H = canvas.height;
  const t = performance.now() / 1200;
  for (const s of STARS) {
    const twinkle = 0.6 + 0.4 * Math.sin(t + s.twinkle);
    ctx.save();
    ctx.globalAlpha = alpha * twinkle;
    ctx.fillStyle   = '#c8d8ff';
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Achievements ──────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_meal',  icon: '🍖', name: 'First Meal',    desc: 'Feed your Wild for the first time'     },
  { id: 'first_pet',   icon: '💜', name: 'Bonded',        desc: 'Pet your Wild for the first time'      },
  { id: 'first_train', icon: '💪', name: 'First Workout', desc: 'Complete a training session'           },
  { id: 'first_bathe', icon: '🛁', name: 'Squeaky Clean', desc: 'Bathe your Wild for the first time'    },
  { id: 'level_5',     icon: '⭐', name: 'Rising',        desc: 'Reach level 5'                         },
  { id: 'level_10',    icon: '🏆', name: 'Champion',      desc: 'Reach level 10'                        },
  { id: 'day_7',       icon: '📅', name: 'One Week',      desc: 'Survive 7 days together'               },
  { id: 'day_30',      icon: '🌙', name: 'A Month',       desc: 'Survive 30 days together'              },
  { id: 'peak_form',   icon: '✨', name: 'Peak Form',     desc: 'All needs above 90 at the same time'   },
];

function checkAchievements() {
  if (!gs.state) return;
  const s = gs.state;
  const checks = [
    { id: 'first_meal',  cond: (s.totalFeedings         ?? 0) >= 1  },
    { id: 'first_pet',   cond: (s.totalPets             ?? 0) >= 1  },
    { id: 'first_train', cond: (s.totalTrainingSessions ?? 0) >= 1  },
    { id: 'first_bathe', cond: (s.totalBaths            ?? 0) >= 1  },
    { id: 'level_5',     cond: (s.level                 ?? 1) >= 5  },
    { id: 'level_10',    cond: (s.level                 ?? 1) >= 10 },
    { id: 'day_7',       cond: (s.daysAlive             ?? 0) >= 7  },
    { id: 'day_30',      cond: (s.daysAlive             ?? 0) >= 30 },
    { id: 'peak_form',   cond: Object.values(s.needs ?? {}).every(v => v >= 90) },
  ];
  for (const { id, cond } of checks) {
    if (!cond) continue;
    const result = gs.unlockAchievement(id);
    if (result.isNew) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) showToast(`${ach.icon} ACHIEVEMENT: ${ach.name.toUpperCase()}!`);
    }
  }
}

function syncSettingsPanel() {
  const btn = document.getElementById('setting-desktop-toggle');
  if (btn) {
    btn.textContent = desktopMode ? 'ON' : 'OFF';
    btn.classList.toggle('on', desktopMode);
  }
  const sBtn = document.getElementById('setting-sound-toggle');
  if (sBtn) {
    const on = !sfx.isMuted();
    sBtn.textContent = on ? 'ON' : 'OFF';
    sBtn.classList.toggle('on', on);
  }
  const cBtn = document.getElementById('setting-creature-cycle');
  if (cBtn && creature) {
    cBtn.textContent = creature.name.toUpperCase();
    cBtn.classList.add('on');
  }
}

async function switchCreature(newId) {
  const next = CREATURES[newId];
  if (!next || next.id === creature.id) return;
  creature = next;
  gs.startNewGame(newId);
  // Preload new sprites + apply theme
  await Promise.all(Object.values(creature.animations).flat().map(loadImage));
  applyTheme(creature.habitat);
  document.getElementById('creature-label').textContent = creature.name.toUpperCase();
  buildFoodGrid();
  buildEvoPaths();
  buildHabitatPanel();
  updateLevelDisplay();
  setAnim('idle');
  posX = 0.5; posY = 0.88;
  isMoving = false;
  saveState();
  showToast(`SWITCHED TO ${creature.name.toUpperCase()}`);
}

function buildAchievementsPanel() {
  const list    = document.getElementById('achievement-list');
  const unlocked = gs.state?.achievements ?? [];
  list.innerHTML = '';
  for (const ach of ACHIEVEMENTS) {
    const isUnlocked = unlocked.includes(ach.id);
    const item = document.createElement('div');
    item.className = 'achievement-item' + (isUnlocked ? ' unlocked' : '');
    item.innerHTML = `
      <span class="achievement-icon">${ach.icon}</span>
      <div class="achievement-info">
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    list.appendChild(item);
  }
}

// ── Habitat zones & smart movement ───────────────────────────────
// posY > 1.0 means feet below canvas bottom (grounded look).
// yNorth = closest to camera top; yMax = furthest south (deepest ground).
const HABITAT_ZONES = {
  cave: {
    xMin: 0.15, xMax: 0.85,
    yGround: 1.05, yNorth: 0.75, yMax: 1.08,
    poi: [
      { x: 0.18, y: 1.05 },  // left wall ground
      { x: 0.82, y: 1.05 },  // right wall ground
      { x: 0.42, y: 1.04 },  // center rock
      { x: 0.22, y: 0.92 },  // under left stalactite (mid)
      { x: 0.72, y: 0.92 },  // under right stalactite (mid)
      { x: 0.55, y: 0.90 },  // center stalactite (mid)
      { x: 0.20, y: 0.78 },  // left crystal (far north)
      { x: 0.78, y: 0.78 },  // right crystal (far north)
      { x: 0.50, y: 0.80 },  // center north (deep scene)
    ],
  },
  meadow: {
    xMin: 0.15, xMax: 0.85,
    yGround: 1.05, yNorth: 0.75, yMax: 1.08,
    poi: [
      { x: 0.18, y: 1.05 },  // left grass tuft
      { x: 0.82, y: 1.05 },  // right grass tuft
      { x: 0.30, y: 1.03 },  // left flower patch
      { x: 0.70, y: 1.03 },  // right flower patch
      { x: 0.50, y: 1.02 },  // center bloom
      { x: 0.25, y: 0.88 },  // left mid-depth
      { x: 0.75, y: 0.88 },  // right mid-depth
      { x: 0.50, y: 0.78 },  // hilltop (far north)
      { x: 0.40, y: 0.82 },  // off-center north
    ],
  },
};

let lastXHalf = null; // 'left' | 'right' — bias away from where we just were

function getZone() {
  const id = creature?.habitat?.id ?? 'cave';
  return HABITAT_ZONES[id] ?? HABITAT_ZONES.cave;
}

function pickWanderTarget() {
  const zone = getZone();
  const r    = Math.random();

  // Prefer the half we haven't just visited
  const preferRight = lastXHalf === 'left'  ? true
                    : lastXHalf === 'right' ? false : null;

  let tx, ty;

  if (r < 0.30) {
    // Visit a point of interest
    let pool = zone.poi;
    if (preferRight !== null) {
      const filtered = zone.poi.filter(p => preferRight ? p.x >= 0.5 : p.x < 0.5);
      if (filtered.length >= 2) pool = filtered;
    }
    const poi = pool[Math.floor(Math.random() * pool.length)];
    tx = poi.x; ty = poi.y;

  } else if (r < 0.55) {
    // North / depth exploration
    const span = zone.xMax - zone.xMin;
    tx = preferRight === true  ? 0.5  + Math.random() * (zone.xMax - 0.5)
       : preferRight === false ? zone.xMin + Math.random() * (0.5 - zone.xMin)
       : zone.xMin + Math.random() * span;
    ty = zone.yNorth + Math.random() * (zone.yGround - zone.yNorth) * 1.0;

  } else {
    // Ground-level wander
    const span = zone.xMax - zone.xMin;
    tx = preferRight === true  ? 0.5  + Math.random() * (zone.xMax - 0.5)
       : preferRight === false ? zone.xMin + Math.random() * (0.5 - zone.xMin)
       : zone.xMin + Math.random() * span;
    ty = zone.yGround + Math.random() * (zone.yMax - zone.yGround);
  }

  lastXHalf = tx < 0.5 ? 'left' : 'right';

  // Hard clamp — no creature ever escapes its habitat
  tx = Math.max(zone.xMin, Math.min(zone.xMax, tx));
  ty = Math.max(zone.yNorth, Math.min(zone.yMax, ty));

  return { x: tx, y: ty };
}

// ── Desktop mode ──────────────────────────────────────────────────
let desktopMode = localStorage.getItem('wilds-desktop-mode') === 'true';

function applyDesktopMode() {
  window.wilds?.setDesktopMode(desktopMode);
  const btn = document.getElementById('btn-pin');
  if (btn) {
    btn.textContent = desktopMode ? '🖥' : '📌';
    btn.title       = desktopMode ? 'Click to float on top' : 'Click for desktop mode';
    btn.style.opacity = desktopMode ? '0.5' : '1';
  }
}

function toggleDesktopMode() {
  desktopMode = !desktopMode;
  localStorage.setItem('wilds-desktop-mode', desktopMode);
  applyDesktopMode();
  showToast(desktopMode ? 'DESKTOP MODE — APPS COVER VEX' : 'FLOAT MODE — VEX STAYS ON TOP');
}

// After interaction ends in desktop mode, sink back to desktop
function maybeSink() {
  if (desktopMode && !activePanel) {
    setTimeout(() => {
      if (!activePanel) window.wilds?.sinkToDesktop();
    }, 1200);
  }
}

// ── Panel system ──────────────────────────────────────────────────
let activePanel = null;

function openPanel(id) {
  const panel = document.getElementById('action-panel');

  // Toggle off if same panel tapped again
  if (activePanel === id) {
    closePanel();
    return;
  }

  // Switch page
  document.querySelectorAll('.panel-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.act-pill').forEach(p => p.classList.remove('active'));

  const page = document.getElementById(`panel-${id}`);
  if (page) page.classList.add('active');

  const pill = document.querySelector(`[data-panel="${id}"]`);
  if (pill) pill.classList.add('active');

  panel.classList.add('open');
  activePanel = id;

  // Settle the creature: opening a panel is engagement.
  // Reset attention drain + stop mid-walk so she's not running in place.
  onInteraction();
  if (isMoving || isWalkAnim(currentAnim)) {
    isMoving = false;
    targetX = posX;
    targetY = posY;
    setAnim(idleAnim());
  }
}

function closePanel() {
  document.getElementById('action-panel').classList.remove('open');
  document.querySelectorAll('.panel-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.act-pill').forEach(p => p.classList.remove('active'));
  activePanel = null;
  maybeSink();
}

// ── Feed panel ────────────────────────────────────────────────────
function buildHabitatPanel() {
  const h = creature.habitat;

  document.getElementById('habitat-name').textContent = h.name || '—';

  const HABITAT_DESCS = {
    cave:   'A deep, crystal-lit cavern where shadow creatures thrive. Favors INT and DEF growth. Rare arcane formations pulse with dim light.',
    meadow: 'A sunlit expanse of wildflowers and rolling hills. Favors CHA and END growth. The air hums with natural energy.',
  };
  document.getElementById('habitat-desc').textContent =
    HABITAT_DESCS[h.id] || 'A mysterious habitat full of unknowns.';

  // List which evolutions this habitat supports
  const supported = (creature.evolutionPaths || []).filter(p => p.hint?.toLowerCase().includes(h.name?.toLowerCase() || h.id));
  const lines = supported.length
    ? supported.map(p => `▸ ${p.name} — ${p.hint}`).join('\n')
    : creature.evolutionPaths.filter(p => p.prob).map(p => `▸ ${p.name} — ${p.hint}`).join('\n');
  document.getElementById('habitat-creatures').textContent = lines;
}

function buildFoodGrid() {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = '';
  document.getElementById('feed-name').textContent = creature.name;

  FOODS.forEach(food => {
    const card = document.createElement('button');
    card.className  = 'food-card';
    card.dataset.id = food.id;
    card.innerHTML  = `
      <span class="food-icon">${food.icon}</span>
      <span class="food-name">${food.name.split(' ')[0]}</span>
    `;
    card.addEventListener('click', () => onFeed(food, card));
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    grid.appendChild(card);
  });
}

function onFeed(food, cardEl) {
  const result = gs.feed(food);
  if (!result.ok) {
    showToast(result.msg.toUpperCase());
    return;
  }
  onInteraction();

  // Visual feedback on card
  cardEl.classList.add('fed');
  setTimeout(() => cardEl.classList.remove('fed'), 800);

  // Eating animation + food particle
  spawnFood(food.icon);
  awardXP(10);
  triggerFX('feed');
  sfx.play('feed');
  setAnim('eating');
  setTimeout(() => {
    setAnim(idleAnim());
    closePanel();
  }, 2000);

  showToast(`${creature.name.toUpperCase()} ATE ${food.name.toUpperCase()}!`);
  saveState();
}

// ── Train panel ───────────────────────────────────────────────────
let trainPhase    = 'wait'; // wait | ready | done
let trainFlashId  = null;
let trainFlashAt  = 0;
let trainScore    = 0;
const TRAIN_ROUNDS = 3;

function startTraining() {
  trainScore = 0;
  trainPhase = 'wait';
  document.getElementById('train-result').textContent = '';
  document.getElementById('train-prompt').textContent = 'GET READY...';
  document.getElementById('train-tap').classList.remove('flash');
  scheduleFlash();
}

function scheduleFlash() {
  clearTimeout(trainFlashId);
  const delay = 1000 + Math.random() * 1500;
  trainFlashId = setTimeout(() => {
    if (activePanel !== 'train') return;
    trainPhase   = 'ready';
    trainFlashAt = performance.now();
    document.getElementById('train-tap').classList.add('flash');
    document.getElementById('train-prompt').textContent = 'TAP!';
    // Miss window — 900ms
    trainFlashId = setTimeout(() => {
      if (trainPhase === 'ready') {
        trainPhase = 'wait';
        document.getElementById('train-tap').classList.remove('flash');
        document.getElementById('train-prompt').textContent = 'TOO SLOW!';
        setTimeout(scheduleFlash, 800);
      }
    }, 900);
  }, delay);
}

function onTrainTap() {
  if (trainPhase !== 'ready') return;
  clearTimeout(trainFlashId);

  const ms    = performance.now() - trainFlashAt;
  const grade = ms < 200 ? 'PERFECT' : ms < 450 ? 'GOOD' : 'OK';
  const xp    = ms < 200 ? 3 : ms < 450 ? 2 : 1;

  document.getElementById('train-tap').classList.remove('flash');
  document.getElementById('train-result').textContent = `${grade}  +${xp}`;
  sfx.play('train_hit');
  spawnXP(xp);
  trainScore += xp;
  trainPhase  = 'wait';

  const done = ++trainScore >= TRAIN_ROUNDS * 2;
  if (done) {
    onInteraction();
    document.getElementById('train-prompt').textContent = 'SESSION COMPLETE!';
    gs.applyTrainingResult?.('STR', 100, trainScore);
    awardXP(10 + trainScore); // ~16–34 XP depending on tap quality
    spawnSparkles();
    setAnim('happy');
    setTimeout(() => {
      setAnim(idleAnim());
      closePanel();
      showToast(`${creature.name.toUpperCase()} TRAINED HARD!`);
    }, 1800);
    saveState();
  } else {
    setTimeout(scheduleFlash, 600);
  }
}

// ── Instant actions ───────────────────────────────────────────────
function onPet() {
  onInteraction();
  gs.pet?.();
  awardXP(8);
  triggerFX('pet');
  sfx.play('pet');
  setAnim('happy');
  spawnSparkles();
  showToast(`${creature.name.toUpperCase()} LOVES THE ATTENTION`);
  setTimeout(() => setAnim(idleAnim()), 3500);
  saveState();
  closePanel();
}

function onBathe() {
  onInteraction();
  gs.bathe?.();
  awardXP(12);
  triggerFX('bathe');
  sfx.play('bathe');
  showToast(`${creature.name.toUpperCase()} IS SQUEAKY CLEAN!`);
  saveState();
  closePanel();
  if (creature.animations.shower) {
    isMoving = false;
    targetX = posX; targetY = posY;
    setAnim('shower');
    setTimeout(() => setAnim(idleAnim()), 3000);
  }
}

// ── Save ──────────────────────────────────────────────────────────
function saveState() {
  const data = gs.state;
  if (window.wilds) window.wilds.save(data);
  else localStorage.setItem('wilds-save', JSON.stringify(data));
}

// ── Particles ─────────────────────────────────────────────────────
let particles = [];

function spawnFood(icon) {
  const cx = posX * canvas.width;
  const cy = posY * canvas.height;
  particles.push({
    type: 'food', icon,
    x: cx, y: cy - 20,
    vy: -0.6 - Math.random() * 0.4,
    life: 1, decay: 0.012,
  });
}

function spawnSparkles() {
  const cx = posX * canvas.width;
  const cy = posY * canvas.height;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    particles.push({
      type: 'spark',
      x: cx, y: cy - 30,
      vx: Math.cos(angle) * (1 + Math.random()),
      vy: Math.sin(angle) * (1 + Math.random()) - 0.5,
      life: 1, decay: 0.02,
    });
  }
}

function spawnXP(xp) {
  const cx = posX * canvas.width;
  const cy = posY * canvas.height;
  particles.push({
    type: 'xp', label: `+${xp} XP`,
    x: cx, y: cy - 40,
    vy: -0.4,
    life: 1, decay: 0.01,
  });
}

function spawnZzz() {
  particles.push({
    type: 'zzz',
    x: posX * canvas.width + 18,
    y: posY * canvas.height - 28,
    vy: -0.22, vx: 0.06,
    life: 1, decay: 0.005,
    size: 7 + Math.random() * 3,
  });
}

function spawnLevelUp() {
  const cx = posX * canvas.width;
  const cy = posY * canvas.height;
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const speed = 1.8 + Math.random() * 2.2;
    particles.push({
      type: 'levelup',
      x: cx, y: cy - 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 1, decay: 0.010,
    });
  }
}

function updateLevelDisplay() {
  if (!gs.state) return;
  const level  = gs.state.level ?? 1;
  const xp     = gs.state.xp    ?? 0;
  const needed = level * 100;
  document.getElementById('lvl-label').textContent        = `LVL ${level}`;
  document.getElementById('xp-bar-fill').style.width      = Math.min(100, (xp / needed) * 100) + '%';
}

function awardXP(amount) {
  const result = gs.addXP(amount);
  spawnXP(amount);
  updateLevelDisplay();
  if (result.leveled) {
    triggerFX('levelup');
    sfx.play('levelup');
    spawnLevelUp();
    spawnSparkles();
    // Flash the level label gold
    const lvlEl = document.getElementById('lvl-label');
    const barEl = document.getElementById('xp-bar-fill');
    lvlEl.classList.remove('leveled-up');
    barEl.classList.remove('leveled-up');
    void lvlEl.offsetWidth; // force reflow to restart animation
    lvlEl.classList.add('leveled-up');
    barEl.classList.add('leveled-up');
    setTimeout(() => {
      lvlEl.classList.remove('leveled-up');
      barEl.classList.remove('leveled-up');
    }, 900);
    showToast(`LEVEL UP — ${creature.name.toUpperCase()} IS NOW LVL ${result.newLevel}`);
  }
  return result;
}

function spawnAttentionSeek() {
  const cx = posX * canvas.width;
  const cy = posY * canvas.height - 20;
  const icons = ['♡', '!', '?'];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    particles.push({
      type: 'seek', icon: icons[i % icons.length],
      x: cx, y: cy,
      vx: Math.cos(angle) * (0.9 + Math.random() * 0.5),
      vy: Math.sin(angle) * (0.9 + Math.random() * 0.5) - 0.9,
      life: 1, decay: 0.010,
    });
  }
}

function triggerAttentionSeek() {
  const inAction = ['eating', 'training'].includes(currentAnim);
  if (!inAction) setAnim('wave');
  spawnAttentionSeek();
  sfx.play('attention');
  showToast(`${creature.name.toUpperCase()} WANTS YOUR ATTENTION`);
  updateMoodBubble('seeking');
  if (!inAction) setTimeout(() => setAnim(idleAnim()), 2400);
}

function tickParticles(delta) {
  const dt = delta / 16;
  particles = particles.filter(p => {
    p.life -= p.decay * dt;
    p.y    += (p.vy || 0) * dt;
    p.x    += (p.vx || 0) * dt;
    return p.life > 0;
  });
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    if (p.type === 'food') {
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.icon, p.x, p.y);
    } else if (p.type === 'spark') {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--habitat-primary').trim() || '#9b7fd4';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'xp') {
      ctx.font = 'bold 10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(p.label, p.x, p.y);
    } else if (p.type === 'zzz') {
      const sz = Math.round(p.size * (0.5 + p.life * 0.5));
      ctx.font = `bold ${sz}px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(140,185,255,${p.life})`;
      ctx.fillText('z', p.x, p.y);
    } else if (p.type === 'seek') {
      ctx.font = 'bold 13px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffb3c6';
      ctx.fillText(p.icon, p.x, p.y);
    } else if (p.type === 'levelup') {
      ctx.fillStyle   = '#ffe080';
      ctx.shadowColor = '#ffe080';
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5 * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Habitat environment elements ──────────────────────────────────
const CAVE_PROP_SRCS = [
  'assets/habitat-props/cave/cave_mouth.png',
  'assets/habitat-props/cave/mushroom_large.png',
  'assets/habitat-props/cave/boulder.png',
  'assets/habitat-props/cave/stalagmite.png',
  'assets/habitat-props/cave/mushroom_small.png',
  'assets/habitat-props/cave/pond.png',
  'assets/habitat-props/cave/bat.gif',
];

// Bat ambient state
const BAT = { x: -0.1, y: 0.25, active: false, dir: 1, nextTrigger: 20000 };

const ENV_ELEMENTS = {
  cave: [
    // stalactites hanging from top
    { type: 'stalactite', x: 0.08, h: 0.28, w: 10 },
    { type: 'stalactite', x: 0.18, h: 0.18, w: 7  },
    { type: 'stalactite', x: 0.72, h: 0.22, w: 8  },
    { type: 'stalactite', x: 0.85, h: 0.32, w: 11 },
    { type: 'stalactite', x: 0.55, h: 0.14, w: 6  },
    // pixel prop sprites
    { type: 'sprite', src: 'assets/habitat-props/cave/cave_mouth.png', x: 0.04, y: 0.92, scale: 1.4, glow: null },
    { type: 'sprite', src: 'assets/habitat-props/cave/boulder.png',     x: 0.82, y: 0.93, scale: 0.9, glow: null },
  ],
  meadow: [
    // grass tufts
    { type: 'grass', x: 0.06, y: 0.88 },
    { type: 'grass', x: 0.20, y: 0.92 },
    { type: 'grass', x: 0.60, y: 0.90 },
    { type: 'grass', x: 0.80, y: 0.86 },
    { type: 'grass', x: 0.92, y: 0.93 },
    // flowers
    { type: 'flower', x: 0.12, y: 0.84, color: '#f9d56e' },
    { type: 'flower', x: 0.35, y: 0.88, color: '#ff9eb5' },
    { type: 'flower', x: 0.68, y: 0.83, color: '#f9d56e' },
    { type: 'flower', x: 0.87, y: 0.90, color: '#ff9eb5' },
    // distant hill silhouette
    { type: 'hill', x: 0.5, y: 0.55, r: 0.38 },
  ],
};

// ── Ambient motes (habitat atmosphere layer) ──────────────────────
const MOTE_CFG = {
  cave:   { count: 14, color: 'rgba(200, 180, 255, %A%)', rMin: 0.4, rMax: 1.4, drift: 0.012, sway: 0.6,  baseAlpha: 0.35 },
  meadow: { count: 18, color: 'rgba(255, 230, 160, %A%)', rMin: 0.5, rMax: 1.6, drift: 0.018, sway: 1.0,  baseAlpha: 0.45 },
};
let _motes = null;
let _moteHabitat = null;

function initMotes(habitatId) {
  const cfg = MOTE_CFG[habitatId] || MOTE_CFG.cave;
  _motes = Array.from({ length: cfg.count }, () => ({
    x:      Math.random(),
    y:      Math.random() * 0.85,
    r:      cfg.rMin + Math.random() * (cfg.rMax - cfg.rMin),
    phase:  Math.random() * Math.PI * 2,
    speedY: cfg.drift * (0.6 + Math.random() * 0.8),
    swayMag:cfg.sway  * (0.5 + Math.random() * 1.0),
    alpha:  cfg.baseAlpha * (0.5 + Math.random() * 0.7),
  }));
  _moteHabitat = habitatId;
}

function drawAmbientMotes() {
  const habitatId = creature.habitat.id;
  if (_moteHabitat !== habitatId) initMotes(habitatId);
  const cfg = MOTE_CFG[habitatId] || MOTE_CFG.cave;
  const W = canvas.width;
  const H = canvas.height;
  const t = performance.now() / 1000;

  for (const m of _motes) {
    // Slow upward drift with horizontal sway
    m.y -= m.speedY / 60;
    if (m.y < -0.05) {
      m.y = 1.0 + Math.random() * 0.1;
      m.x = Math.random();
    }
    const swayX = Math.sin(t * 0.6 + m.phase) * m.swayMag * 0.012;
    const px = (m.x + swayX) * W;
    const py = m.y * H;

    ctx.globalAlpha = m.alpha;
    ctx.fillStyle = cfg.color.replace('%A%', '1');
    ctx.beginPath();
    ctx.arc(px, py, m.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Parallax depth layers (procedural silhouettes) ────────────────
const PARALLAX_CFG = {
  cave: {
    far:  { color: 'rgba(20, 12, 44, 0.85)', yBase: 0.35, amp: 18, freq: 0.012, panPxPerSec: 3,  jitter: 4  },
    mid:  { color: 'rgba(10, 6, 28, 0.92)',  yBase: 0.55, amp: 14, freq: 0.020, panPxPerSec: 7,  jitter: 6  },
  },
  meadow: {
    far:  { color: 'rgba(40, 60, 78, 0.55)', yBase: 0.42, amp: 24, freq: 0.008, panPxPerSec: 2,  jitter: 3  },
    mid:  { color: 'rgba(28, 44, 58, 0.78)', yBase: 0.60, amp: 18, freq: 0.014, panPxPerSec: 5,  jitter: 4  },
  },
};

function drawParallaxLayer(cfg, t) {
  const W = canvas.width;
  const H = canvas.height;
  const yBase = cfg.yBase * H;
  const panX  = (t * cfg.panPxPerSec) % 200;

  ctx.fillStyle = cfg.color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  // Ridge silhouette via summed sines + deterministic jitter
  const step = 6;
  for (let x = 0; x <= W + step; x += step) {
    const wx = x + panX;
    const y =
      yBase +
      Math.sin(wx * cfg.freq) * cfg.amp +
      Math.sin(wx * cfg.freq * 2.3 + 1.7) * (cfg.amp * 0.4) +
      Math.sin(wx * 0.07) * cfg.jitter;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

function drawParallax() {
  // Skip procedural ridges when this habitat has a real Pixellab backdrop —
  // they were a placeholder for missing scene art and now just cover it.
  if (HABITAT_LAYERS[creature.habitat.id]) return;
  const cfg = PARALLAX_CFG[creature.habitat.id];
  if (!cfg) return;
  const t = performance.now() / 1000;
  drawParallaxLayer(cfg.far, t);
  drawParallaxLayer(cfg.mid, t);
}

function drawEnv() {
  drawStars();
  drawParallax();
  drawAmbientMotes();
  const els = ENV_ELEMENTS[creature.habitat.id];
  if (!els) return;
  const W = canvas.width;
  const H = canvas.height;
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--habitat-primary').trim() || '#9b7fd4';

  for (const el of els) {
    ctx.save();
    if (el.type === 'stalactite') {
      const x  = el.x * W;
      const tw = el.w;
      const th = el.h * H;
      ctx.fillStyle = 'rgba(10,6,28,0.85)';
      ctx.beginPath();
      ctx.moveTo(x - tw / 2, 0);
      ctx.lineTo(x + tw / 2, 0);
      ctx.lineTo(x, th);
      ctx.closePath();
      ctx.fill();
      // tip glow
      ctx.shadowColor  = primary;
      ctx.shadowBlur   = 6;
      ctx.fillStyle    = primary;
      ctx.globalAlpha  = 0.4;
      ctx.beginPath();
      ctx.arc(x, th - 2, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (el.type === 'rock') {
      ctx.fillStyle = 'rgba(30,20,55,0.9)';
      ctx.beginPath();
      ctx.ellipse(el.x * W, el.y * H, el.rx, el.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = primary;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth   = 1;
      ctx.stroke();

    } else if (el.type === 'crystal') {
      const cx = el.x * W;
      const cy = el.y * H;
      const s  = el.size;
      ctx.fillStyle   = primary;
      ctx.globalAlpha = 0.6;
      ctx.shadowColor = primary;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 2);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      ctx.fill();

    } else if (el.type === 'grass') {
      const gx = el.x * W;
      const gy = el.y * H;
      ctx.strokeStyle = '#4a8c5c';
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.85;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(gx + i * 5, gy);
        ctx.quadraticCurveTo(gx + i * 8, gy - 12, gx + i * 6 + (i === 0 ? 3 : i * 4), gy - 18);
        ctx.stroke();
      }

    } else if (el.type === 'flower') {
      const fx = el.x * W;
      const fy = el.y * H;
      // stem
      ctx.strokeStyle = '#4a8c5c';
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, fy - 14);
      ctx.stroke();
      // petals
      ctx.fillStyle   = el.color;
      ctx.globalAlpha = 0.85;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * 4, fy - 14 + Math.sin(a) * 4, 3, 3, a, 0, Math.PI * 2);
        ctx.fill();
      }
      // center
      ctx.fillStyle  = '#fff9c4';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(fx, fy - 14, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (el.type === 'hill') {
      ctx.fillStyle   = 'rgba(30,60,35,0.35)';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(el.x * W, el.y * H, el.r * W, el.r * H * 0.5, 0, Math.PI, 0);
      ctx.fill();

    } else if (el.type === 'sprite') {
      const img = frames[el.src];
      if (!img) { ctx.restore(); continue; }
      const pw = img.naturalWidth  * el.scale;
      const ph = img.naturalHeight * el.scale;
      const px = el.x * W;
      const py = el.y * H;
      if (el.glow) {
        const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 900 * Math.PI);
        ctx.shadowColor = el.glow;
        ctx.shadowBlur  = 10 * pulse;
      }
      ctx.drawImage(img, px - pw / 2, py - ph, pw, ph);
    }
    ctx.restore();
  }

}

// ── Render loop ───────────────────────────────────────────────────
let rafId = null;

function loop(now) {
  const delta = Math.min(now - lastTime, 150); // cap so a long gap doesn't teleport Vex
  lastTime    = now;

  // Frame advance
  frameTimer += delta;
  const fps    = ANIM_FPS[currentAnim] ?? FPS;
  const animMs = 1000 / fps;
  if (frameTimer >= animMs) {
    frameTimer -= animMs;
    const anim = creature.animations[currentAnim] || creature.animations.idle;
    prevFrameIdx = currentFrame;
    frameSwapAt  = performance.now();
    currentFrame = (currentFrame + 1) % anim.length;
  }

  // Wander (skip while panel is open, sleeping, or showering)
  const canWander = !activePanel && BEH.primaryState !== 'sleeping' && BEH.primaryState !== 'distressed' && currentAnim !== 'shower';
  if (canWander) {
    wanderTimer += delta;

    // Seeking: drift to habitat center
    if (BEH.primaryState === 'seeking' && !isMoving && Math.abs(posX - 0.5) > 0.08) {
      targetX = 0.5;
      targetY = getZone().yGround;
      const dx0 = targetX - posX;
      const dy0 = targetY - posY;
      const dir = getWalkDir(dx0, dy0);
      facingLeft = dir.flip;
      setAnim(dir.anim);
      isMoving = true;
    }

    const profile   = creature.behaviorProfile ?? { curiosity: 5 };
    const curiosity = profile.curiosity;
    const bored     = BEH.subMood === 'bored';
    const minD = (11 - curiosity) * (bored ? 700 : 1400);
    const maxD = (11 - curiosity) * (bored ? 1800 : 4200);

    if (!isMoving && wanderTimer >= wanderDelay) {
      wanderTimer = 0;
      // ~30% of the time, take a long linger before moving again — feels more natural
      const linger = Math.random() < 0.3 ? 4000 + Math.random() * 5000 : 0;
      wanderDelay = minD + Math.random() * (maxD - minD) + linger;
      const t   = pickWanderTarget();
      const dx0 = t.x - posX;
      const dy0 = t.y - posY;
      if (Math.sqrt(dx0 * dx0 + dy0 * dy0) > 0.06) {
        targetX = t.x; targetY = t.y;
        const dir  = getWalkDir(dx0, dy0);
        facingLeft = dir.flip;
        setAnim(dir.anim);
        isMoving = true;
      }
    }

    if (isMoving) {
      const dx   = targetX - posX;
      const dy   = targetY - posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.006) {
        posX = targetX; posY = targetY;
        isMoving = false;
        setAnim(idleAnim());
      } else {
        const step = SPEED * delta;
        posX += (dx / dist) * step;
        posY += (dy / dist) * step;
        // Hard clamp — never escape habitat bounds
        const zone = getZone();
        posX = Math.max(zone.xMin, Math.min(zone.xMax, posX));
        posY = Math.max(zone.yNorth, Math.min(zone.yMax, posY));
      }
    } else if (isWalkAnim(currentAnim)) {
      setAnim(idleAnim());
    }
  }

  tickParticles(delta);
  draw();
  rafId = requestAnimationFrame(loop);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEnv();

  const anim = creature.animations[currentAnim] || creature.animations.idle;
  const img  = frames[anim[currentFrame % anim.length]];
  if (!img) return;

  const animScale = currentAnim === 'shower' ? SCALE * 0.75 : SCALE;
  const w   = img.naturalWidth  * animScale;
  const h   = img.naturalHeight * animScale;
  const cx  = posX * canvas.width;

  // Breathing bob — subtle sine, halved when sleeping, none when showering
  const bobAmp  = currentAnim === 'shower' ? 0 : (BEH.primaryState === 'sleeping' ? 1 : 2.5);
  const bobHz   = BEH.primaryState === 'sleeping' ? 600 : 900;
  const bob     = Math.sin(performance.now() / bobHz * Math.PI) * bobAmp;
  const fx      = getFX();
  const cy      = posY * canvas.height + bob + fx.dy;

  ctx.save();
  ctx.translate(cx, cy);
  if (fx.rot) ctx.rotate(fx.rot);
  ctx.scale((facingLeft ? -1 : 1) * fx.sx, fx.sy);

  // Crossfade between previous and current frame to soften sprite swaps.
  // Blend duration scales with frame interval to prevent overlap on fast anims.
  // Walks skip blending — frame-by-frame position offsets cause ghosting.
  const isWalk  = currentAnim.startsWith('walk_');
  const prevImg = frames[anim[prevFrameIdx % anim.length]];
  const animMs  = 1000 / (ANIM_FPS[currentAnim] ?? FPS);
  const blendMs = Math.min(BLEND_MS, animMs * 0.45);
  const blend   = Math.min(1, (performance.now() - frameSwapAt) / blendMs);
  if (!isWalk && prevImg && prevImg !== img && blend < 1) {
    ctx.globalAlpha = 1 - blend;
    ctx.drawImage(prevImg, -w / 2, -h, w, h);
    ctx.globalAlpha = blend;
    ctx.drawImage(img,    -w / 2, -h, w, h);
    ctx.globalAlpha = 1;
  } else {
    ctx.drawImage(img, -w / 2, -h, w, h);
  }
  ctx.restore();

  drawParticles();
}

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  // Load save
  let savedData = null;
  try {
    savedData = window.wilds
      ? await window.wilds.load()
      : JSON.parse(localStorage.getItem('wilds-save') || 'null');
  } catch {}

  const creatureId = savedData?.creatureId || 'vex';
  creature = CREATURES[creatureId];
  gs = new GameState();
  if (savedData) gs.loadState(savedData);
  else           gs.startNewGame(creatureId);

  applyTheme(creature.habitat);
  document.getElementById('creature-label').textContent = creature.name.toUpperCase();
  buildFoodGrid();
  buildEvoPaths();
  buildHabitatPanel();
  updateLevelDisplay();
  updateTimeOfDay();

  // Preload frames + habitat props
  await Promise.all([
    ...Object.values(creature.animations).flat().map(loadImage),
    ...CAVE_PROP_SRCS.map(loadImage),
  ]);

  // ── Hover bar ──────────────────────────────────────────────────
  const actionBar = document.getElementById('action-bar');
  let hideTimer   = null;

  const showBar = () => { clearTimeout(hideTimer); actionBar.classList.add('visible'); };
  const hideBar = () => { hideTimer = setTimeout(() => actionBar.classList.remove('visible'), 800); };

  // Show on any mouse movement, hide only when leaving the widget entirely
  document.body.addEventListener('mousemove', showBar);
  document.body.addEventListener('mouseleave', hideBar);

  // Never hide while mouse is over the bar or panel
  actionBar.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  document.getElementById('action-panel').addEventListener('mouseenter', () => clearTimeout(hideTimer));

  // ── Panel triggers ──────────────────────────────────────────────
  document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.panel;
      openPanel(id);
      if (id === 'train') startTraining();
    });
  });

  document.getElementById('btn-pet').addEventListener('click', onPet);
  document.getElementById('btn-bathe').addEventListener('click', onBathe);
  document.getElementById('train-tap').addEventListener('click', onTrainTap);
  document.getElementById('btn-quit').addEventListener('click', () => {
    if (window.wilds) window.wilds.quit();
  });
  document.getElementById('btn-pin').addEventListener('click', toggleDesktopMode);

  // Achievements + Settings buttons inside stats panel
  document.getElementById('btn-achievements').addEventListener('click', () => {
    buildAchievementsPanel();
    openPanel('achievements');
  });
  document.getElementById('btn-settings').addEventListener('click', () => {
    syncSettingsPanel();
    openPanel('settings');
  });

  // Back buttons inside achievements + settings panels
  document.querySelectorAll('.panel-back-btn').forEach(btn => {
    btn.addEventListener('click', () => openPanel(btn.dataset.panel));
  });

  // Settings: creature cycle
  document.getElementById('setting-creature-cycle').addEventListener('click', async () => {
    const ids   = Object.keys(CREATURES);
    const idx   = ids.indexOf(creature.id);
    const nextId = ids[(idx + 1) % ids.length];
    await switchCreature(nextId);
    sfx.play('click');
    syncSettingsPanel();
  });

  // Settings: sound toggle
  document.getElementById('setting-sound-toggle').addEventListener('click', () => {
    sfx.setMuted(!sfx.isMuted());
    if (!sfx.isMuted()) sfx.play('click');
    syncSettingsPanel();
  });

  // Settings: desktop mode toggle
  document.getElementById('setting-desktop-toggle').addEventListener('click', () => {
    toggleDesktopMode();
    syncSettingsPanel();
  });

  // Apply saved desktop mode preference on startup
  applyDesktopMode();

  // Close panel when clicking ground strip
  document.getElementById('ground-strip').addEventListener('click', closePanel);

  // ── Game tick ───────────────────────────────────────────────────
  setInterval(() => {
    gs.tick(1000);
    const state = gs.state;
    saveState();
    updateNeedDots(state);
    updateDayLabel();
    updateStatsPanel();
    updateLevelDisplay();
    updateTimeOfDay();
    checkAchievements();

    // Behavior drives animation + mood bubble
    behaviorTick(1000);

    const mood     = gs.getOverallMood();
    const inAction = ['eating', 'training', 'happy', 'wave'].includes(currentAnim);

    if (!inAction) {
      if (BEH.primaryState === 'distressed' || mood === 'critical' || mood === 'sad') {
        setAnim('sad');
        updateMoodBubble('critical');
      } else if (BEH.primaryState === 'sleeping') {
        if (currentAnim !== 'sleep') setAnim(creature.animations.sleep ? 'sleep' : idleAnim());
        updateMoodBubble('sad'); // 💤 doubles as sleep icon
      } else if (BEH.primaryState === 'seeking') {
        updateMoodBubble('seeking');
      } else {
        if (currentAnim === 'sad') setAnim(idleAnim());
        updateMoodBubble(mood === 'ok' || mood === 'happy' ? '' : mood);
      }
    }
  }, 1000);

  // Restart render loop if rAF was throttled while window was hidden
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastTime = performance.now();
      if (!rafId) rafId = requestAnimationFrame(loop);
    }
  });

  // Start render
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

boot();
