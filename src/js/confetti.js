// Minimal dependency-free confetti engine on #fx-canvas.
// Import `confettiBurst(...)` or dispatch `nlanding:confetti` with
// `{ n, x, y, spread, colors }`.

import { getCurrentTheme } from './theme.js';

let canvas, ctx, particles = [], rafId = null, W = 0, H = 0;

const reducedMotion =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function tick() {
  ctx.clearRect(0, 0, W, H);
  particles = particles.filter((p) => p.life > 0 && p.y < H + 30);
  for (const p of particles) {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.rot += p.vr;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    ctx.restore();
  }
  if (particles.length > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
    ctx.clearRect(0, 0, W, H);
  }
}

function palette() {
  const t = getCurrentTheme();
  // Pure white vanishes on laid paper, so the light moods get ink and darker
  // accents; the dark moods keep the bright v2.0 mix.
  return t.light
    ? [t.primary, t.secondary, t.ink, '#c9a227', '#15803d']
    : [t.primary, t.secondary, '#ffffff', '#facc15', '#4ade80'];
}

export function confettiBurst({ n = 80, x = W / 2, y = H * 0.35, spread = false, colors = null } = {}) {
  if (reducedMotion || !canvas) return;
  const cols = colors || palette();
  for (let i = 0; i < n; i++) {
    const px = spread ? Math.random() * W : x + (Math.random() - 0.5) * 60;
    const py = spread ? -20 - Math.random() * H * 0.25 : y + (Math.random() - 0.5) * 30;
    particles.push({
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * (spread ? 3 : 9),
      vy: spread ? 1 + Math.random() * 2.5 : -4 - Math.random() * 6,
      gravity: 0.16 + Math.random() * 0.1,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: cols[Math.floor(Math.random() * cols.length)],
      shape: Math.random() < 0.3 ? 'circle' : 'rect',
      life: 90 + Math.random() * 60,
    });
  }
  if (particles.length > 600) particles = particles.slice(-600);
  if (!rafId) rafId = requestAnimationFrame(tick);
}

export function initConfetti() {
  canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('nlanding:confetti', (e) => {
    confettiBurst(e.detail || {});
  });
}
