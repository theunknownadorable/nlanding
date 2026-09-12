// NEURAL JUMP 2.0 — the secret platformer. Tap the hero photo 5× (or run
// `game` in the terminal, or Ctrl+K) to jack in. Two levels, lava, portals.

import { getCurrentTheme } from './theme.js';

const LW = 480;
const LH = 300;
const COLS = 20;
const ROWS = 9;
const TW = LW / COLS;
const TH = LH / ROWS;

const GRAVITY = 0.5;
const MOVE_SPEED = 2.7;
const JUMP_POWER = -8.8;
const COYOTE_FRAMES = 7;
const BUFFER_FRAMES = 7;

const levels = {
  1: [
    '11111111111111111111',
    '10000000000000000001',
    '10000000000000000901',
    '10000000000011111111',
    '10020000011000000001',
    '11111000000000000001',
    '11111000000001110001',
    '11111000111000000001',
    '11111333111333333331',
  ],
  2: [
    '11111111111111111111',
    '10000000000000000001',
    '10000000000000000901',
    '10000000000011111111',
    '10020000011100000001',
    '11111111000000000001',
    '11111111111110000001',
    '11111111111111111111',
    '11111111111111111111',
  ],
};
const MAX_LEVEL = 2;

let canvas, ctx;
let modal, levelEl, timeEl, deathsEl, overScreen, winScreen, winStats;
let state = 'idle'; // idle | playing | dead | clear
let currentLevel = 1;
let platforms = [];
let goal = { x: 0, y: 0, w: TW, h: TH };
let player = { x: 0, y: 0, w: 18, h: 18, dx: 0, dy: 0, grounded: false, face: 1 };
let coyote = 0;
let buffer = 0;
let jumpHeld = false;
let keys = { left: false, right: false };
let rafId = null;
let lastTs = 0;
let acc = 0;
let elapsed = 0; // frames while playing (60fps units)
let deaths = 0;
let trail = [];
let flashes = [];
let t = 0;

function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function show(el) {
  el?.classList.remove('hidden');
  el?.classList.add('flex');
}

function hide(el) {
  el?.classList.add('hidden');
  el?.classList.remove('flex');
}

function fmtTime(frames) {
  const s = frames / 60;
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}`;
}

function buildLevel(lvl) {
  platforms = [];
  trail = [];
  const map = levels[lvl];
  map.forEach((row, r) => {
    [...row].forEach((tile, c) => {
      const x = c * TW;
      const y = r * TH;
      if (tile === '1') platforms.push({ x, y, w: TW, h: TH, type: 'ground' });
      if (tile === '3') platforms.push({ x, y, w: TW, h: TH, type: 'lava' });
      if (tile === '2') {
        player.x = x + (TW - player.w) / 2;
        player.y = y;
        player.dx = 0;
        player.dy = 0;
      }
      if (tile === '9') goal = { x, y, w: TW, h: TH };
    });
  });
  if (levelEl) levelEl.textContent = `${lvl}/${MAX_LEVEL}`;
}

function startLevel(lvl) {
  currentLevel = lvl;
  buildLevel(lvl);
  hide(overScreen);
  hide(winScreen);
  state = 'playing';
  if (lvl === 2) {
    emit('nlanding:toast', { message: 'LEVEL 2 // zero pits. pure sprint. 🏃' });
  }
}

function die() {
  if (state !== 'playing') return;
  state = 'dead';
  deaths++;
  if (deathsEl) deathsEl.textContent = deaths;
  // poof particles
  for (let i = 0; i < 26; i++) {
    flashes.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 40,
    });
  }
  setTimeout(() => {
    if (state === 'dead') show(overScreen);
  }, 350);
}

function clearLevel() {
  if (state !== 'playing') return;
  if (currentLevel < MAX_LEVEL) {
    emit('nlanding:confetti', { n: 60 });
    startLevel(currentLevel + 1);
    return;
  }
  state = 'clear';
  if (winStats) {
    const rank =
      deaths === 0 ? 'FLAWLESS. Hire this human immediately. 🏆' : deaths <= 3 ? 'Certified neural navigator 🧠' : 'Persistent bug-squisher 💪';
    winStats.innerHTML =
      `TIME <b>${fmtTime(elapsed)}</b> · DEATHS <b>${deaths}</b><br>` +
      `<span class="text-yellow-300">${rank}</span>`;
  }
  setTimeout(() => {
    show(winScreen);
    emit('nlanding:confetti', { n: 160 });
  }, 300);
}

function physics() {
  // horizontal
  const target = (keys.right ? MOVE_SPEED : 0) + (keys.left ? -MOVE_SPEED : 0);
  player.dx += (target - player.dx) * 0.35;
  if (target !== 0) player.face = target > 0 ? 1 : -1;

  // jumping (coyote + buffer + variable height)
  if (player.grounded) coyote = COYOTE_FRAMES;
  else if (coyote > 0) coyote--;
  if (buffer > 0) buffer--;
  if (buffer > 0 && coyote > 0) {
    player.dy = JUMP_POWER;
    player.grounded = false;
    coyote = 0;
    buffer = 0;
  }
  if (!jumpHeld && player.dy < -3) player.dy = -3; // jump cut

  player.dy = Math.min(player.dy + GRAVITY, 12);
  player.x += player.dx;
  player.y += player.dy;
  player.grounded = false;

  for (const p of platforms) {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y < p.y + p.h &&
      player.y + player.h > p.y
    ) {
      if (p.type === 'lava') {
        die();
        return;
      }
      const ox = player.w / 2 + p.w / 2 - Math.abs(player.x + player.w / 2 - (p.x + p.w / 2));
      const oy = player.h / 2 + p.h / 2 - Math.abs(player.y + player.h / 2 - (p.y + p.h / 2));
      if (ox < oy) {
        player.x = player.x < p.x ? p.x - player.w : p.x + p.w;
        player.dx = 0;
      } else {
        if (player.y < p.y) {
          player.y = p.y - player.h;
          player.dy = 0;
          player.grounded = true;
        } else {
          player.y = p.y + p.h;
          player.dy = 0;
        }
      }
    }
  }
  if (player.y > LH + 20) {
    die();
    return;
  }
  if (
    player.x < goal.x + goal.w &&
    player.x + player.w > goal.x &&
    player.y < goal.y + goal.h &&
    player.y + player.h > goal.y
  ) {
    clearLevel();
  }

  trail.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, life: 18 });
  if (trail.length > 40) trail.shift();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function draw() {
  const theme = getCurrentTheme();
  t++;

  // backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, LH);
  bgGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
  bgGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = '#05050c';
  ctx.fillRect(0, 0, LW, LH);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, LW, LH);
  // faint grid
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= LW; x += TW) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, LH);
  }
  for (let y = 0; y <= LH; y += TH) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(LW, y + 0.5);
  }
  ctx.stroke();

  // platforms
  for (const p of platforms) {
    if (p.type === 'lava') {
      const pulse = 0.65 + 0.35 * Math.sin(t / 8 + p.x);
      const g = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      g.addColorStop(0, '#f97316');
      g.addColorStop(1, '#dc2626');
      ctx.fillStyle = g;
      ctx.globalAlpha = pulse;
      ctx.fillRect(p.x, p.y + p.h * 0.35, p.w, p.h * 0.65);
      ctx.globalAlpha = 1;
      // spikes
      ctx.fillStyle = '#ef4444';
      const spikes = 3;
      for (let i = 0; i < spikes; i++) {
        const sx = p.x + (p.w / spikes) * i;
        ctx.beginPath();
        ctx.moveTo(sx, p.y + p.h * 0.4);
        ctx.lineTo(sx + p.w / spikes / 2, p.y + p.h * 0.05 + Math.sin(t / 6 + i) * 2);
        ctx.lineTo(sx + p.w / spikes, p.y + p.h * 0.4);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#15151f';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = theme.primary;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(p.x, p.y, p.w, 2);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(p.x, p.y + p.h - 1, p.w, 1);
      ctx.globalAlpha = 1;
    }
  }

  // goal portal
  const gx = goal.x, gy = goal.y, gw = goal.w, gh = goal.h;
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 16;
  const pg = ctx.createLinearGradient(gx, gy, gx, gy + gh);
  pg.addColorStop(0, '#fde047');
  pg.addColorStop(1, '#f59e0b');
  ctx.fillStyle = pg;
  roundRect(gx + 2, gy + 2, gw - 4, gh - 4, 5);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const swirl = Math.sin(t / 10) * 3;
  ctx.fillRect(gx + 5, gy + gh / 2 - 2 + swirl, gw - 10, 4);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', gx + gw / 2, gy + 13);

  // trail
  for (const s of trail) {
    s.life--;
    ctx.globalAlpha = Math.max(0, s.life / 18) * 0.5;
    ctx.fillStyle = theme.primary;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  trail = trail.filter((s) => s.life > 0);

  // poof particles
  for (const f of flashes) {
    f.x += f.vx;
    f.y += f.vy;
    f.life--;
    ctx.globalAlpha = Math.max(0, f.life / 40);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
  flashes = flashes.filter((f) => f.life > 0);

  // player bot
  if (state !== 'dead') {
    const px = player.x, py = player.y, pw = player.w, ph = player.h;
    ctx.save();
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 14;
    const bodyG = ctx.createLinearGradient(px, py, px, py + ph);
    bodyG.addColorStop(0, theme.primary);
    bodyG.addColorStop(1, theme.secondary);
    ctx.fillStyle = bodyG;
    roundRect(px, py, pw, ph, 5);
    ctx.fill();
    ctx.restore();
    // visor
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    roundRect(px + 3, py + 5, pw - 6, 7, 3);
    ctx.fill();
    ctx.fillStyle = '#fff';
    const look = player.face * 1.6;
    ctx.beginPath();
    ctx.arc(px + 7 + look, py + 8.5, 1.8, 0, Math.PI * 2);
    ctx.arc(px + 12 + look, py + 8.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // antenna
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py);
    ctx.lineTo(px + pw / 2, py - 4);
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(px + pw / 2, py - 5, 1.8 + Math.sin(t / 5), 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  acc += Math.min(ts - lastTs, 100);
  lastTs = ts;
  const STEP = 1000 / 60;
  let stepped = false;
  while (acc >= STEP) {
    acc -= STEP;
    if (state === 'playing') {
      physics();
      elapsed++;
      stepped = true;
    }
  }
  if (stepped && timeEl) timeEl.textContent = fmtTime(elapsed);
  draw();
}

function onKeyDown(e) {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
  }
  if (e.repeat) return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
    buffer = BUFFER_FRAMES;
    jumpHeld = true;
  }
  if (e.key === 'Escape') closeGame();
}

function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
    jumpHeld = false;
  }
}

function bindHold(el, on, off) {
  if (!el) return;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    on();
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
    el.addEventListener(ev, (e) => {
      e.preventDefault();
      off();
    })
  );
}

export function openGame() {
  if (!modal || state === 'playing') {
    if (state !== 'playing' && modal) {
      // reopen from a finished state
    } else return;
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  elapsed = 0;
  deaths = 0;
  if (deathsEl) deathsEl.textContent = '0';
  if (timeEl) timeEl.textContent = '0:00.0';
  startLevel(1);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  if (!rafId) {
    lastTs = 0;
    acc = 0;
    rafId = requestAnimationFrame(loop);
  }
  emit('nlanding:toast', { message: '🎮 JACKED IN — reach the EXIT portal' });
}

export function closeGame() {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
  state = 'idle';
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function initGame() {
  modal = document.getElementById('game-modal');
  canvas = document.getElementById('game-canvas');
  if (!modal || !canvas) return;
  canvas.width = LW;
  canvas.height = LH;
  ctx = canvas.getContext('2d');

  levelEl = document.getElementById('level-indicator');
  timeEl = document.getElementById('hud-time');
  deathsEl = document.getElementById('hud-deaths');
  overScreen = document.getElementById('game-over');
  winScreen = document.getElementById('win-screen');
  winStats = document.getElementById('win-stats');

  document.querySelectorAll('[data-game-open]').forEach((b) =>
    b.addEventListener('click', openGame)
  );
  document.querySelectorAll('[data-game-close]').forEach((b) =>
    b.addEventListener('click', closeGame)
  );
  document.getElementById('retry-btn')?.addEventListener('click', () => startLevel(currentLevel));
  document.getElementById('win-again-btn')?.addEventListener('click', () => {
    elapsed = 0;
    deaths = 0;
    if (deathsEl) deathsEl.textContent = '0';
    startLevel(1);
  });

  bindHold(
    document.getElementById('btn-left'),
    () => (keys.left = true),
    () => (keys.left = false)
  );
  bindHold(
    document.getElementById('btn-right'),
    () => (keys.right = true),
    () => (keys.right = false)
  );
  bindHold(
    document.getElementById('btn-jump'),
    () => {
      buffer = BUFFER_FRAMES;
      jumpHeld = true;
    },
    () => (jumpHeld = false)
  );

  window.addEventListener('nlanding:open-game', openGame);
}
