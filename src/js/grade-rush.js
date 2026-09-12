// v2.1 · GRADE RUSH — the secret game.
//
// Sixty seconds on a chalkboard: slide a mortarboard left and right, catch
// the good grades (A+ 10, ★ 25, ☕ 15), dodge the bad ones (F papers and
// ⏰ deadlines, one of three 🍎 each). Best score persists; ranks run from
// "See Me After Class" up to "Tenure Material".
//
// Reached three ways: five taps on the hero polaroid, the Ctrl+K palette, or
// `rush` / `grade rush` in the terminal.

const BEST_KEY = 'nlanding-graderush-best';

const W = 480;
const H = 300;
const ROUND_MS = 60000;
const MAX_APPLES = 3;

const RANKS = [
  { min: 900, title: 'Tenure Material', note: 'The dean is quoting you at dinner.' },
  { min: 650, title: "Chair's Shortlist", note: 'Somebody is already drafting your offer.' },
  { min: 450, title: 'Summa Cum Laude', note: 'Framed, and slightly smug about it.' },
  { min: 300, title: "Dean's List", note: 'Solid semester. Keep the coffee coming.' },
  { min: 180, title: 'Passable. Barely.', note: 'The rubric was generous today.' },
  { min: 90, title: 'Audit Candidate', note: 'Come to office hours. Bring snacks.' },
  { min: 0, title: 'See Me After Class', note: 'We need to talk about your syllabus.' },
];

// kind, points, spawn weight, size, fall-speed factor
const KINDS = [
  { kind: 'aplus', pts: 10, weight: 34, size: 22, speed: 1 },
  { kind: 'star', pts: 25, weight: 12, size: 20, speed: 1.25 },
  { kind: 'coffee', pts: 15, weight: 16, size: 21, speed: 0.95 },
  { kind: 'fgrade', pts: -1, weight: 26, size: 22, speed: 1.05 },
  { kind: 'clock', pts: -1, weight: 12, size: 21, speed: 1.35 },
];
const WEIGHT_TOTAL = KINDS.reduce((s, k) => s + k.weight, 0);

let modal, canvas, ctx, dpr = 1;
let startBtn, againBtn, overTitle, overStats, overRank, overNote;
let readyScreen, overScreen;
let boardTexture = null;

let state = 'ready'; // ready | playing | over
let rafId = null;
let lastT = 0;
let score = 0;
let apples = MAX_APPLES;
let startedAt = 0;
let elapsed = 0;
let items = [];
let pops = [];
let specks = [];
let spawnAcc = 0;
let best = null;
let shake = 0;

const player = { x: W / 2, y: H - 26, w: 68, h: 24, targetX: W / 2 };
const keys = { left: false, right: false };
const pointer = { active: false, x: W / 2 };

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function readBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    best = raw === null ? null : Number(raw);
    if (!Number.isFinite(best)) best = null;
  } catch {
    best = null;
  }
}

function writeBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* private mode */
  }
}

function rankFor(s) {
  return RANKS.find((r) => s >= r.min) || RANKS[RANKS.length - 1];
}

function pickKind() {
  let roll = Math.random() * WEIGHT_TOTAL;
  for (const k of KINDS) {
    roll -= k.weight;
    if (roll <= 0) return k;
  }
  return KINDS[0];
}

function toast(msg) {
  window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: msg } }));
}

/* ------------------------------------------------------------------ */
/* static chalkboard texture (built once)                              */
/* ------------------------------------------------------------------ */

function buildBoardTexture() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  // Wiped-chalk smudges.
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const rx = 26 + Math.random() * 90;
    const ry = 8 + Math.random() * 26;
    g.save();
    g.translate(x, y);
    g.rotate((Math.random() - 0.5) * 0.7);
    g.globalAlpha = 0.018 + Math.random() * 0.03;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  // Faint ruled margin line, like a board with a worked example on it.
  g.globalAlpha = 0.07;
  g.strokeStyle = '#f2d16b';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(14, 34);
  g.lineTo(14, H - 14);
  g.stroke();

  // Ghosted chalk scribbles in the corners.
  g.globalAlpha = 0.075;
  g.fillStyle = '#eaf2e6';
  g.font = '11px "JetBrains Mono", monospace';
  g.fillText('∫ f(x) dx', 26, 262);
  g.fillText('P(A+) = ?', 392, 264);
  g.fillText('E = mc²', 300, 40);
  g.globalAlpha = 1;

  boardTexture = c;
}

/* ------------------------------------------------------------------ */
/* drawing                                                             */
/* ------------------------------------------------------------------ */

function drawStar(x, y, r, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 9;
  ctx.fill();
  ctx.restore();
}

function drawSlip(x, y, label, color, rot) {
  // A grade slip: small paper rectangle with the mark chalked on it.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#f4f0e4';
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-13, -11, 26, 22, 3) : ctx.rect(-13, -11, 26, 22);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

function drawEmoji(x, y, size, emoji, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * 0.4);
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

function drawMortarboard(x, y) {
  // Board (flattened diamond), cap, and a tassel that swings with movement.
  const swing = Math.max(-1, Math.min(1, (player.targetX - player.x) / 26));
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(255,255,255,0.35)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(242, 245, 240, 0.94)';
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(0, -11);
  ctx.lineTo(34, 0);
  ctx.lineTo(0, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // cap under the board
  ctx.fillStyle = 'rgba(214, 222, 214, 0.9)';
  ctx.beginPath();
  ctx.moveTo(-13, 8);
  ctx.lineTo(13, 8);
  ctx.lineTo(10, 19);
  ctx.lineTo(-10, 19);
  ctx.closePath();
  ctx.fill();

  // tassel
  ctx.strokeStyle = '#f2d16b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 1);
  ctx.quadraticCurveTo(34 + swing * 6, 10, 31 + swing * 9, 18);
  ctx.stroke();
  ctx.fillStyle = '#f2d16b';
  ctx.beginPath();
  ctx.arc(31 + swing * 9, 20, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHud() {
  ctx.save();
  ctx.textBaseline = 'middle';

  // score
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f2d16b';
  ctx.shadowColor = 'rgba(242,209,107,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(`SCORE ${score}`, 22, 22);
  ctx.shadowBlur = 0;

  // clock
  ctx.textAlign = 'center';
  const left = Math.max(0, ROUND_MS - elapsed) / 1000;
  ctx.fillStyle = left <= 10 ? '#f87171' : '#86b8d8';
  ctx.fillText(`⏱ ${left.toFixed(left < 10 ? 1 : 0)}s`, W / 2, 22);

  // apples
  ctx.textAlign = 'right';
  ctx.font = '14px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif';
  let row = '';
  for (let i = 0; i < MAX_APPLES; i++) row += i < apples ? '🍎' : '·';
  ctx.fillText(row, W - 22, 22);

  // best
  ctx.textAlign = 'left';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(207,224,212,0.6)';
  ctx.fillText(best === null ? 'BEST —' : `BEST ${best}`, 22, 40);

  ctx.restore();
}

function frame(now) {
  if (state !== 'playing') return;
  const dt = Math.min(48, now - lastT || 16);
  lastT = now;
  elapsed = now - startedAt;

  const progress = Math.min(1, elapsed / ROUND_MS);
  const speedMul = 1 + progress * 0.95; // board gets busier as the term ends
  const spawnEvery = 780 - progress * 400; // ms

  /* ---- spawn ---- */
  spawnAcc += dt;
  if (spawnAcc >= spawnEvery) {
    spawnAcc = 0;
    const spec = pickKind();
    items.push({
      ...spec,
      x: 24 + Math.random() * (W - 48),
      y: -18,
      vy: (0.085 + Math.random() * 0.045) * spec.speed,
      vx: (Math.random() - 0.5) * 0.035,
      rot: (Math.random() - 0.5) * 0.5,
      vr: (Math.random() - 0.5) * 0.0022,
      dead: false,
    });
  }

  /* ---- player ---- */
  if (pointer.active) player.targetX = pointer.x;
  if (keys.left) player.targetX -= 0.62 * dt;
  if (keys.right) player.targetX += 0.62 * dt;
  player.targetX = Math.max(36, Math.min(W - 36, player.targetX));
  player.x += (player.targetX - player.x) * Math.min(1, dt * 0.022);

  /* ---- items ---- */
  for (const it of items) {
    it.y += it.vy * dt * speedMul;
    it.x += it.vx * dt;
    it.rot += it.vr * dt;
    if (it.x < 14 || it.x > W - 14) it.vx *= -1;

    // catch window: the flat top of the mortarboard
    if (
      !it.dead &&
      it.y > player.y - 15 &&
      it.y < player.y + 12 &&
      Math.abs(it.x - player.x) < player.w / 2 + 4
    ) {
      it.dead = true;
      if (it.pts > 0) {
        score += it.pts;
        pops.push({ x: it.x, y: it.y, text: `+${it.pts}`, life: 1, good: true });
        burst(it.x, it.y, it.kind === 'star' ? '#f2d16b' : '#eaf2e6', 8);
      } else {
        apples -= 1;
        shake = 1;
        pops.push({
          x: it.x,
          y: it.y,
          text: it.kind === 'clock' ? 'DEADLINE!' : 'F!',
          life: 1,
          good: false,
        });
        burst(it.x, it.y, '#f87171', 12);
      }
    }
  }
  items = items.filter((it) => !it.dead && it.y < H + 26);

  /* ---- effects ---- */
  for (const p of pops) {
    p.y -= 0.045 * dt;
    p.life -= 0.0022 * dt;
  }
  pops = pops.filter((p) => p.life > 0);
  for (const s of specks) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 0.0006 * dt;
    s.life -= 0.0026 * dt;
  }
  specks = specks.filter((s) => s.life > 0);
  shake = Math.max(0, shake - dt * 0.006);

  /* ---- render ---- */
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * 7 * shake, (Math.random() - 0.5) * 7 * shake);
  }
  ctx.clearRect(-10, -10, W + 20, H + 20);
  if (boardTexture) ctx.drawImage(boardTexture, 0, 0);

  for (const it of items) {
    if (it.kind === 'aplus') drawSlip(it.x, it.y, 'A+', '#166534', it.rot);
    else if (it.kind === 'fgrade') drawSlip(it.x, it.y, 'F', '#b91c1c', it.rot);
    else if (it.kind === 'star') drawStar(it.x, it.y, it.size / 2 + 2, it.rot, '#f2d16b');
    else if (it.kind === 'coffee') drawEmoji(it.x, it.y, it.size, '☕', it.rot);
    else if (it.kind === 'clock') drawEmoji(it.x, it.y, it.size, '⏰', it.rot);
  }

  for (const s of specks) {
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawMortarboard(player.x, player.y);

  for (const p of pops) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.good ? '#6ee7a8' : '#f87171';
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  drawHud();
  ctx.restore();

  /* ---- end conditions ---- */
  if (apples <= 0) return endRound('out of apples');
  if (elapsed >= ROUND_MS) return endRound('term complete');

  rafId = requestAnimationFrame(frame);
}

function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.04 + Math.random() * 0.11;
    specks.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.03,
      r: 0.8 + Math.random() * 1.8,
      life: 1,
      color,
    });
  }
  if (specks.length > 240) specks.splice(0, specks.length - 240);
}

/* ------------------------------------------------------------------ */
/* round lifecycle                                                     */
/* ------------------------------------------------------------------ */

function startRound() {
  score = 0;
  apples = MAX_APPLES;
  items = [];
  pops = [];
  specks = [];
  spawnAcc = 0;
  elapsed = 0;
  shake = 0;
  player.x = player.targetX = W / 2;
  readyScreen?.classList.add('hidden');
  overScreen?.classList.add('hidden');
  state = 'playing';
  startedAt = performance.now();
  lastT = startedAt;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
}

function endRound(reason) {
  state = 'over';
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  const isBest = best === null || score > best;
  if (isBest) {
    best = score;
    writeBest(best);
  }

  const r = rankFor(score);
  if (overTitle) {
    overTitle.textContent =
      reason === 'out of apples' ? 'SABBATICAL DENIED' : 'TERM COMPLETE';
  }
  if (overRank) overRank.textContent = r.title;
  if (overNote) overNote.textContent = r.note;
  if (overStats) {
    overStats.textContent = `${score} pts · ${apples}/${MAX_APPLES} apples left · best ${best}${
      isBest ? ' · NEW BEST' : ''
    }`;
  }
  overScreen?.classList.remove('hidden');
  overScreen?.classList.add('flex');

  if (isBest && score > 0) {
    window.dispatchEvent(
      new CustomEvent('nlanding:confetti', { detail: { n: 110 } })
    );
    toast(`🎓 New Grade Rush best: ${score} — ${r.title}`);
  } else {
    toast(`🎓 ${score} pts — ${r.title}`);
  }
}

export function openRush() {
  if (!modal) return;
  readBest();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (state === 'over') {
    overScreen?.classList.remove('hidden');
    overScreen?.classList.add('flex');
  } else if (state === 'ready') {
    readyScreen?.classList.remove('hidden');
    readyScreen?.classList.add('flex');
  }
  window.dispatchEvent(
    new CustomEvent('nlanding:toast', {
      detail: { message: '🎓 GRADE RUSH — catch the A+, dodge the F' },
    })
  );
}

export function closeRush() {
  if (!modal) return;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (state === 'playing') state = 'ready';
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  overScreen?.classList.add('hidden');
  overScreen?.classList.remove('flex');
  readyScreen?.classList.remove('hidden');
  readyScreen?.classList.add('flex');
  state = 'ready';
  // The palette closes itself before opening the game, so it is never the
  // thing still holding the scroll lock at this point.
  document.body.style.overflow = '';
}

export function isRushOpen() {
  return !!modal && !modal.classList.contains('hidden');
}

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

export function initGradeRush() {
  modal = document.getElementById('rush-modal');
  canvas = document.getElementById('rush-canvas');
  readyScreen = document.getElementById('rush-ready');
  overScreen = document.getElementById('rush-over');
  startBtn = document.getElementById('rush-start');
  againBtn = document.getElementById('rush-again');
  overTitle = document.getElementById('rush-over-title');
  overStats = document.getElementById('rush-over-stats');
  overRank = document.getElementById('rush-over-rank');
  overNote = document.getElementById('rush-over-note');
  const bestEl = document.getElementById('rush-best');
  if (!modal || !canvas) return;

  ctx = canvas.getContext('2d');
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  readBest();
  if (bestEl) bestEl.textContent = best === null ? '—' : String(best);
  buildBoardTexture();

  // Idle board behind the start card so the modal never shows a blank slab.
  ctx.drawImage(boardTexture, 0, 0);
  drawMortarboard(W / 2, H - 26);
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(207,224,212,0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('— the board is clean. for now. —', W / 2, 40);

  /* ---- pointer: mouse + drag ---- */
  function toLogical(clientX) {
    const r = canvas.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  }
  canvas.addEventListener('mousemove', (e) => {
    pointer.active = true;
    pointer.x = toLogical(e.clientX);
  });
  canvas.addEventListener('mouseleave', () => (pointer.active = false));
  // Guard the touch list: a touchstart/touchmove can arrive with no touches
  // (synthetic events, cancelled gestures), and e.touches[0] would throw and
  // take the round down with it.
  canvas.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      pointer.active = true;
      pointer.x = toLogical(t.clientX);
    },
    { passive: true }
  );
  canvas.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      pointer.active = true;
      pointer.x = toLogical(t.clientX);
      e.preventDefault();
    },
    { passive: false }
  );

  /* ---- keyboard ---- */
  const isMove = (k) =>
    k === 'ArrowLeft' || k === 'ArrowRight' || k === 'a' || k === 'd' || k === 'A' || k === 'D';

  window.addEventListener('keydown', (e) => {
    if (!isRushOpen()) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeRush();
      return;
    }
    if (isMove(e.key)) {
      e.preventDefault();
      pointer.active = false; // keyboard takes the wheel
      keys.left = e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a';
      keys.right = e.key === 'ArrowRight' || e.key.toLowerCase() === 'd';
      if (state === 'ready') startRound();
      return;
    }
    if ((e.key === ' ' || e.key === 'Enter') && state !== 'playing') {
      e.preventDefault();
      startRound();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
  });

  /* ---- on-screen touch buttons ---- */
  function hold(el, dir) {
    if (!el) return;
    const on = (e) => {
      e.preventDefault();
      pointer.active = false;
      keys[dir] = true;
      if (state === 'ready') startRound();
    };
    const off = () => (keys[dir] = false);
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }
  hold(document.getElementById('rush-left'), 'left');
  hold(document.getElementById('rush-right'), 'right');

  /* ---- buttons ---- */
  startBtn?.addEventListener('click', startRound);
  againBtn?.addEventListener('click', startRound);
  document.querySelectorAll('[data-rush-open]').forEach((b) =>
    b.addEventListener('click', openRush)
  );
  document.querySelectorAll('[data-rush-close]').forEach((b) =>
    b.addEventListener('click', closeRush)
  );

  // Pause if the tab goes away mid-round.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      state = 'ready';
      readyScreen?.classList.remove('hidden');
      readyScreen?.classList.add('flex');
    }
  });

  window.addEventListener('nlanding:open-rush', openRush);
}
