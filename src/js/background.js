// v2.1 · Fluid background.
//
// Replaces the v2.0 neural net with slow ink-in-water: four-to-five large
// radial-gradient blobs drifting in the theme's colours, pushed aside by the
// cursor, a fading particle wake trailing the pointer, expanding rings on
// click, and a thin layer of floating dust.
//
// Blobs are drawn from cached offscreen sprites (one per colour) rather than
// building gradients every frame — the theme changes rarely, the frame loop
// does not.

import { getCurrentTheme } from './theme.js';

const reducedMotion =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

const BLOB_COUNT = 5;
const SPRITE_SIZE = 256;
const spriteCache = new Map();
let cachedThemeKey = null;

/** Soft radial falloff sprite for a given [r,g,b]. */
function spriteFor(rgb) {
  const key = rgb.join(',');
  let canvas = spriteCache.get(key);
  if (canvas) return canvas;

  canvas = document.createElement('canvas');
  canvas.width = canvas.height = SPRITE_SIZE;
  const c = canvas.getContext('2d');
  const half = SPRITE_SIZE / 2;
  const g = c.createRadialGradient(half, half, 0, half, half, half);
  const [r, gr, b] = rgb;
  g.addColorStop(0, `rgba(${r},${gr},${b},1)`);
  g.addColorStop(0.35, `rgba(${r},${gr},${b},0.62)`);
  g.addColorStop(0.68, `rgba(${r},${gr},${b},0.2)`);
  g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Sprites are keyed by colour, so a theme switch simply adds new entries.
  if (spriteCache.size > 24) spriteCache.clear();
  spriteCache.set(key, canvas);
  return canvas;
}

export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0;
  let H = 0;
  let dpr = 1;
  let blobs = [];
  let dust = [];
  let wake = [];
  let ripples = [];

  const mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const base = Math.max(W, H);
    blobs = Array.from({ length: BLOB_COUNT }, (_, i) => ({
      // Spread the anchors so the page never pools in one corner.
      bx: W * (0.16 + 0.17 * i) + (i % 2 ? W * 0.05 : 0),
      by: H * (i % 2 === 0 ? 0.24 : 0.7),
      x: 0,
      y: 0,
      r: base * (0.26 + 0.05 * (i % 3)),
      phase: (i / BLOB_COUNT) * Math.PI * 2,
      driftX: 26 + i * 9,
      driftY: 20 + i * 7,
      periodX: 15000 + i * 2600,
      periodY: 19000 + i * 2200,
      alpha: 0.72 + 0.07 * (i % 3),
    }));
    blobs.forEach((b) => {
      b.x = b.bx;
      b.y = b.by;
    });

    const dustCount = Math.min(90, Math.floor((W * H) / 16000));
    dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.35,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -(0.05 + Math.random() * 0.22),
      phase: Math.random() * Math.PI * 2,
    }));
  }

  /* ---------------- pointer plumbing ---------------- */

  window.addEventListener(
    'mousemove',
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (reducedMotion) return;
      spawnWake(e.clientX, e.clientY);
    },
    { passive: true }
  );

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.active = false;
  });

  // Ripples everywhere *except* on interactive elements — clicking a link
  // should feel like clicking a link, not like poking the wallpaper.
  const IGNORE =
    'a, button, input, textarea, select, label, summary, [role="button"], [role="link"], .brain-trigger, #reflex-box';
  window.addEventListener(
    'pointerdown',
    (e) => {
      if (reducedMotion) return;
      if (e.target instanceof Element && e.target.closest(IGNORE)) return;
      ripples.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 });
      if (ripples.length > 14) ripples.shift();
    },
    { passive: true }
  );

  let lastWake = 0;
  function spawnWake(x, y) {
    const now = performance.now();
    if (now - lastWake < 22) return; // ~45 particles/sec at most
    lastWake = now;
    wake.push({
      x: x + (Math.random() - 0.5) * 7,
      y: y + (Math.random() - 0.5) * 7,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55 - 0.12,
      r: 1 + Math.random() * 2.3,
      life: 1,
      decay: 0.018 + Math.random() * 0.022,
      tone: Math.random() < 0.5 ? 'primary' : 'secondary',
    });
    if (wake.length > 190) wake.splice(0, wake.length - 190);
  }

  /* ---------------- drawing ---------------- */

  function drawBlobs(t, theme) {
    if (theme.key !== cachedThemeKey) {
      cachedThemeKey = theme.key;
    }
    ctx.globalCompositeOperation = theme.blobComposite;

    blobs.forEach((b, i) => {
      // Idle drift.
      const tx =
        b.bx + Math.sin(t / b.periodX + b.phase) * b.driftX + Math.cos(t / (b.periodY * 1.7)) * 12;
      const ty =
        b.by + Math.cos(t / b.periodY + b.phase) * b.driftY + Math.sin(t / (b.periodX * 1.3)) * 10;
      b.x += (tx - b.x) * 0.045;
      b.y += (ty - b.y) * 0.045;

      // Cursor repulsion — the fluid parts around the pointer.
      if (mouse.active) {
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const reach = b.r * 0.85;
        if (dist < reach && dist > 0.01) {
          const force = ((reach - dist) / reach) ** 1.6;
          b.x += (dx / dist) * force * 34;
          b.y += (dy / dist) * force * 34;
        }
      }

      const rgb = theme.blobRgb[i % theme.blobRgb.length];
      const sprite = spriteFor(rgb);
      ctx.globalAlpha = theme.blobAlpha * b.alpha;
      const size = b.r * 2;
      ctx.drawImage(sprite, b.x - b.r, b.y - b.r, size, size);
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawDust(t, theme) {
    const [r, g, b] = theme.light ? theme.inkRgb : theme.inkRgb;
    for (const d of dust) {
      if (!reducedMotion) {
        d.x += d.vx + Math.sin(t / 2600 + d.phase) * 0.12;
        d.y += d.vy;
        if (d.y < -6) {
          d.y = H + 6;
          d.x = Math.random() * W;
        }
        if (d.x < -6) d.x = W + 6;
        if (d.x > W + 6) d.x = -6;
      }
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t / 1400 + d.phase));
      ctx.globalAlpha = (theme.light ? 0.3 : 0.42) * tw;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWake(theme) {
    for (let i = wake.length - 1; i >= 0; i--) {
      const p = wake[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.004; // faint rise, like ink in water
      p.life -= p.decay;
      if (p.life <= 0) {
        wake.splice(i, 1);
        continue;
      }
      const rgb = p.tone === 'primary' ? theme.primaryRgb : theme.secondaryRgb;
      ctx.globalAlpha = p.life * (theme.light ? 0.42 : 0.6);
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRipples(theme) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 5.2;
      rp.life -= 0.022;
      if (rp.life <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = rp.life * (theme.light ? 0.4 : 0.5);
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.6 * rp.life + 0.4;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();

      // Second, lagging ring for a proper droplet feel.
      ctx.globalAlpha = rp.life * 0.35;
      ctx.strokeStyle = theme.secondary;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r * 0.62, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function render(t, theme) {
    ctx.clearRect(0, 0, W, H);
    drawBlobs(t, theme);
    drawDust(t, theme);
    drawWake(theme);
    drawRipples(theme);
  }

  function frame(t) {
    render(t, getCurrentTheme());
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion) render(0, getCurrentTheme());
  });

  resize();

  if (reducedMotion) {
    // One static frame and no animation loop at all.
    render(0, getCurrentTheme());
    return;
  }

  requestAnimationFrame(frame);
}
