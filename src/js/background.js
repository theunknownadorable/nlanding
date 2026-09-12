// Living neural-network background: layered nodes that flinch from the
// cursor, travelling pulses, drifting star dust, and the occasional comet.
// Evolved from portfolio v1's canvas.

import { getCurrentTheme, hexToRgb } from './theme.js';

const reducedMotion =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0,
    H = 0,
    layers = [],
    pulses = [],
    stars = [],
    comets = [];
  const layerConfig = [6, 9, 9, 4];
  const mouse = { x: -2000, y: -2000 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -2000;
    mouse.y = -2000;
  });

  class Node {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.bx = x;
      this.by = y;
      this.intensity = 0;
      this.phase = Math.random() * Math.PI * 2;
    }
    update(t) {
      // gentle idle drift
      const dx0 = Math.sin(t / 1600 + this.phase) * 6;
      const dy0 = Math.cos(t / 2000 + this.phase) * 6;
      this.x += (this.bx + dx0 - this.x) * 0.08;
      this.y += (this.by + dy0 - this.y) * 0.08;
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 170) {
        const angle = Math.atan2(dy, dx);
        const force = (170 - dist) / 170;
        this.x -= Math.cos(angle) * force * 12;
        this.y -= Math.sin(angle) * force * 12;
        this.intensity = Math.min(this.intensity + 0.12, 1);
      } else {
        this.intensity = Math.max(this.intensity - 0.02, 0);
      }
    }
    draw(theme) {
      let r, g, b;
      if (theme.primary.startsWith('#')) {
        [r, g, b] = hexToRgb(theme.primary);
      } else {
        // party mode hands us hsl() — canvas accepts it for fills, and we
        // fake the alpha by drawing twice.
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.2 + this.intensity * 3, 0, Math.PI * 2);
        ctx.fillStyle = theme.primary;
        ctx.globalAlpha = 0.35 + this.intensity * 0.65;
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3.2 + this.intensity * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + this.intensity * 0.7})`;
      ctx.fill();
      if (this.intensity > 0.4) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 9 + this.intensity * 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.08 * this.intensity})`;
        ctx.fill();
      }
    }
  }

  class Pulse {
    constructor(a, b) {
      this.a = a;
      this.b = b;
      this.p = 0;
      this.speed = 0.02 + Math.random() * 0.025;
      this.active = true;
    }
    update() {
      this.p += this.speed;
      if (this.p >= 1) {
        this.active = false;
        this.b.intensity = 1;
      }
    }
    draw(theme) {
      const x = this.a.x + (this.b.x - this.a.x) * this.p;
      const y = this.a.y + (this.b.y - this.a.y) * this.p;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = theme.pulse;
      ctx.shadowColor = theme.pulse;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    layers = [];
    pulses = [];
    stars = [];
    layerConfig.forEach((count, i) => {
      const col = [];
      for (let j = 0; j < count; j++) {
        col.push(
          new Node(
            (W / (layerConfig.length + 1)) * (i + 1),
            (H / (count + 1)) * (j + 1)
          )
        );
      }
      layers.push(col);
    });
    const starCount = Math.min(130, Math.floor((W * H) / 14000));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
      });
    }
  }

  function drawStars(t, theme) {
    ctx.fillStyle = theme.node;
    for (const s of stars) {
      s.y -= s.speed * 0.15;
      if (s.y < -4) {
        s.y = H + 4;
        s.x = Math.random() * W;
      }
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + s.phase));
      ctx.globalAlpha = tw * 0.8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function maybeSpawnComet() {
    if (comets.length === 0 && Math.random() < 0.0035) {
      const fromLeft = Math.random() < 0.5;
      comets.push({
        x: fromLeft ? -40 : W + 40,
        y: Math.random() * H * 0.4,
        vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 4),
        vy: 2 + Math.random() * 1.5,
        life: 1,
      });
    }
  }

  function drawComets(theme) {
    comets = comets.filter((c) => c.x > -120 && c.x < W + 120 && c.y < H + 120);
    for (const c of comets) {
      c.x += c.vx;
      c.y += c.vy;
      const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 12, c.y - c.vy * 12);
      grad.addColorStop(0, theme.primary);
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 12, c.y - c.vy * 12);
      ctx.stroke();
    }
  }

  function frame(t) {
    const theme = getCurrentTheme();
    ctx.clearRect(0, 0, W, H);
    drawStars(t, theme);
    maybeSpawnComet();
    drawComets(theme);

    for (const layer of layers) {
      for (const n of layer) {
        n.update(t);
      }
    }
    // edges + pulses
    for (let i = 0; i < layers.length - 1; i++) {
      for (const a of layers[i]) {
        for (const b of layers[i + 1]) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.035)';
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          if (a.intensity > 0.55 && Math.random() < 0.012 && pulses.length < 60) {
            pulses.push(new Pulse(a, b));
          } else if (Math.random() < 0.0006 && pulses.length < 60) {
            pulses.push(new Pulse(a, b));
          }
        }
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].update();
      pulses[i].draw(theme);
      if (!pulses[i].active) pulses.splice(i, 1);
    }
    for (const layer of layers) {
      for (const n of layer) n.draw(theme);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', init);
  init();
  if (reducedMotion) {
    // One static render for reduced-motion users.
    const theme = getCurrentTheme();
    drawStars(0, theme);
    for (const layer of layers) for (const n of layer) n.draw(theme);
    return;
  }
  requestAnimationFrame(frame);
}
