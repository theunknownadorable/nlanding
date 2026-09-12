// v2.1 · "professor era" theme engine.
//
// Six academic moods, one light-first (Scholar) and five dark. Each theme is
// a compact spec; every other colour the design system needs (soft/faint ink,
// hairlines, card surfaces, tints, navbar wash) is *derived* from it so the
// moods stay visually consistent instead of being hand-tuned one by one.
//
// Carries forward from v2.0: seasonal auto-detect, manual switcher,
// localStorage persistence, and PARTY mode with hue cycling.

export const themeOrder = [
  'scholar',
  'blackboard',
  'ivy',
  'meridian',
  'archive',
  'convocation',
];

const STORAGE_KEY = 'nlanding-theme';

/* ------------------------------------------------------------------ */
/* colour helpers                                                      */
/* ------------------------------------------------------------------ */

export function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r, g, b) {
  const c = (v) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Blend two hex colours. t = 0 → a, t = 1 → b. */
function mix(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** hex → "r, g, b" for rgba() use in CSS custom properties. */
function rgbList(hex) {
  return hexToRgb(hex).join(', ');
}

function rgba(hex, alpha) {
  return `rgba(${rgbList(hex)}, ${alpha})`;
}

/** hsl (deg, 0-100, 0-100) → hex, so PARTY mode can feed the same pipeline. */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

/* ------------------------------------------------------------------ */
/* derive a full paint set from a compact spec                         */
/* ------------------------------------------------------------------ */

function derive(spec) {
  const light = spec.mode === 'light';
  const { paper, ink, primary, secondary } = spec;

  // Card surfaces are translucent so the fluid background drifts *through*
  // them (with backdrop-blur) instead of being hidden behind opaque sheets —
  // but opaque enough that text contrast is measured against a stable value.
  const panelBase = light ? mix(paper, '#ffffff', 0.62) : mix(paper, '#ffffff', 0.055);
  const panel = rgba(panelBase, light ? 0.78 : 0.8);
  const blobs = spec.blobs || [primary, secondary, primary, secondary, ink];

  return {
    ...spec,
    light,
    panel,
    panelSolid: panelBase,
    // Tuned so every mood clears WCAG AA: ink ≥ 7:1, soft ≥ 4.5:1 and even
    // the faintest meta text ≥ 4.5:1 against its own paper.
    inkSoft: mix(ink, paper, light ? 0.26 : 0.22),
    inkFaint: mix(ink, paper, light ? 0.34 : 0.4),
    line: rgba(ink, light ? 0.15 : 0.2),
    lineStrong: rgba(ink, light ? 0.3 : 0.38),
    tint: light ? rgba(ink, 0.045) : 'rgba(255,255,255,0.055)',
    navBg: rgba(paper, light ? 0.82 : 0.6),
    navBgScrolled: rgba(paper, light ? 0.95 : 0.88),
    // Canvas fluids: lighter alpha on paper so the ink stays readable.
    blobAlpha: light ? 0.17 : 0.34,
    blobComposite: light ? 'source-over' : 'lighter',
    blobRgb: blobs.map(hexToRgb),
    primaryRgb: hexToRgb(primary),
    secondaryRgb: hexToRgb(secondary),
    paperRgb: hexToRgb(paper),
    inkRgb: hexToRgb(ink),
  };
}

/* ------------------------------------------------------------------ */
/* the six moods                                                       */
/* ------------------------------------------------------------------ */

const specs = {
  scholar: {
    key: 'scholar',
    label: 'Scholar',
    emoji: '📖',
    mode: 'light',
    paper: '#f6f2e9', // laid paper
    ink: '#1c2433', // fountain-pen ink
    primary: '#1d4ed8', // faculty blue
    secondary: '#b45309', // leather amber
    blobs: ['#1d4ed8', '#b45309', '#7c9fd8', '#d8b26a', '#8a94a6'],
  },
  blackboard: {
    key: 'blackboard',
    label: 'Blackboard',
    emoji: '✏️',
    mode: 'dark',
    paper: '#1e2f27', // slate green
    ink: '#eef4ee', // chalk white
    primary: '#f2d16b', // chalk yellow
    secondary: '#86b8d8', // chalk blue
    blobs: ['#f2d16b', '#86b8d8', '#eef4ee', '#9fbf9f', '#f2d16b'],
  },
  ivy: {
    key: 'ivy',
    label: 'Ivy',
    emoji: '🌿',
    mode: 'dark',
    paper: '#101f17', // deep quad green
    ink: '#eaf2e6',
    primary: '#c9a227', // old gold
    secondary: '#7fb069', // ivy leaf
    blobs: ['#c9a227', '#7fb069', '#3f6b4a', '#e0d3a1', '#c9a227'],
  },
  meridian: {
    key: 'meridian',
    label: 'Meridian',
    emoji: '🧭',
    mode: 'dark',
    paper: '#0c1a30', // midnight navy
    ink: '#e9f0fb',
    primary: '#e0b64c', // meridian gold
    secondary: '#6f9fe0', // atlas blue
    blobs: ['#e0b64c', '#6f9fe0', '#2c4a78', '#f0e2b6', '#e0b64c'],
  },
  archive: {
    key: 'archive',
    label: 'Archive',
    emoji: '📜',
    mode: 'dark',
    paper: '#241a12', // dark sepia
    ink: '#f2e6d4',
    primary: '#d9a566', // foxed parchment
    secondary: '#a9743f', // binding brown
    blobs: ['#d9a566', '#a9743f', '#6b4f33', '#e8d5b0', '#d9a566'],
  },
  convocation: {
    key: 'convocation',
    label: 'Convocation',
    emoji: '🎓',
    mode: 'dark',
    paper: '#2b0f16', // ceremonial maroon
    ink: '#f8ecea',
    primary: '#e3c14a', // convocation gold
    secondary: '#a83a52', // robe maroon
    blobs: ['#e3c14a', '#a83a52', '#6d2233', '#f4e3b0', '#e3c14a'],
  },
};

export const themes = Object.fromEntries(
  Object.entries(specs).map(([k, s]) => [k, derive(s)])
);

// PARTY base: lights down, disco up. Derived once, recoloured every tick.
const partyBase = derive({
  key: 'party',
  label: 'Convocation Disco',
  emoji: '🪩',
  mode: 'dark',
  paper: '#14101c',
  ink: '#f7f3ff',
  primary: '#ff4fd8',
  secondary: '#4fd8ff',
  blobs: ['#ff4fd8', '#4fd8ff', '#ffe14f', '#7dff9b', '#ff8a4f'],
});

let currentKey = 'scholar';
let party = { active: false, hue: 0, timer: null, confettiTimer: null };
let partyTheme = { ...partyBase };

/* ------------------------------------------------------------------ */
/* seasonal auto-detect (academic calendar)                            */
/* ------------------------------------------------------------------ */

export function getSeasonalKey() {
  const now = new Date();
  const m = now.getMonth(); // 0 = January
  const d = now.getDate();

  // Ceremonial window straddling the new year.
  if ((m === 11 && d >= 15) || (m === 0 && d <= 5)) return 'convocation';
  // New academic year: the flagship light theme.
  if (m === 8 || m === 9) return 'scholar';
  // Late autumn into early winter.
  if (m === 10 || (m === 11 && d < 15)) return 'meridian';
  // Exam-and-records season.
  if (m === 0 || m === 1) return 'archive';
  // Spring term, the quad greens up.
  if (m >= 2 && m <= 4) return 'ivy';
  // Summer school: chalk dust.
  return 'blackboard';
}

/* ------------------------------------------------------------------ */
/* painting                                                            */
/* ------------------------------------------------------------------ */

function setVars(t) {
  const root = document.documentElement;
  const set = (name, value) => root.style.setProperty(name, value);

  root.dataset.mode = t.mode;
  root.dataset.theme = t.key;

  set('--paper', t.paper);
  set('--paper-rgb', t.paperRgb.join(', '));
  set('--panel', t.panel);
  set('--ink', t.ink);
  set('--ink-soft', t.inkSoft);
  set('--ink-faint', t.inkFaint);
  set('--primary', t.primary);
  set('--primary-rgb', t.primaryRgb.join(', '));
  set('--secondary', t.secondary);
  set('--secondary-rgb', t.secondaryRgb.join(', '));
  set('--line', t.line);
  set('--line-strong', t.lineStrong);
  set('--tint', t.tint);
  set('--nav-bg', t.navBg);
  set('--nav-bg-scrolled', t.navBgScrolled);
  set('--glass-border', rgba(t.primary, 0.38));
  set('--glass-shadow', rgba(t.primary, 0.16));
  set('--blob-alpha', String(t.blobAlpha));

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.paper);

  const glow1 = document.getElementById('hero-glow-1');
  const glow2 = document.getElementById('hero-glow-2');
  if (glow1) glow1.style.backgroundColor = t.primary;
  if (glow2) glow2.style.backgroundColor = t.secondary;
}

function paintBadge(t, suffix = '') {
  const badge = document.getElementById('season-badge');
  if (!badge) return;
  badge.innerHTML = `${t.emoji} &nbsp;${t.label} Mode${suffix}`;
  badge.style.borderColor = rgba(t.primary, 0.5);
  badge.style.color = t.primary;
  badge.style.backgroundColor = rgba(t.primary, t.light ? 0.1 : 0.14);
}

function paintSwitcher() {
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle(
      'active',
      btn.dataset.themeKey === currentKey && !party.active
    );
  });
}

function paintFooter(t) {
  const foot = document.getElementById('theme-name-foot');
  if (foot) foot.textContent = party.active ? 'Party' : t.label;
}

export function getCurrentTheme() {
  return party.active ? partyTheme : themes[currentKey];
}

export function applyTheme(key, { persist = true } = {}) {
  if (!themes[key]) return false;
  stopParty();
  currentKey = key;
  const t = themes[key];
  setVars(t);
  paintBadge(t);
  paintSwitcher();
  paintFooter(t);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* private mode — ignore */
    }
  }
  return true;
}

export function cycleTheme() {
  const idx = themeOrder.indexOf(currentKey);
  const next = themeOrder[(idx + 1) % themeOrder.length];
  applyTheme(next);
  return next;
}

export function isParty() {
  return party.active;
}

export function toggleParty() {
  if (party.active) {
    stopParty();
    applyTheme(currentKey);
    return false;
  }
  party.active = true;
  party.hue = Math.floor(Math.random() * 360);
  recolorParty();

  party.timer = setInterval(() => {
    party.hue = (party.hue + 6) % 360;
    recolorParty();
  }, 90);

  party.confettiTimer = setInterval(() => {
    window.dispatchEvent(
      new CustomEvent('nlanding:confetti', { detail: { n: 24, spread: true } })
    );
  }, 1400);

  paintSwitcher();
  const foot = document.getElementById('theme-name-foot');
  if (foot) foot.textContent = 'Party';
  return true;
}

function recolorParty() {
  const h = party.hue;
  const primary = hslToHex(h, 95, 62);
  const secondary = hslToHex((h + 70) % 360, 95, 64);
  const blobs = [0, 70, 140, 210, 280].map((off) =>
    hexToRgb(hslToHex((h + off) % 360, 92, 62))
  );

  partyTheme = { ...partyBase, primary, secondary, primaryRgb: hexToRgb(primary), secondaryRgb: hexToRgb(secondary), blobRgb: blobs };

  setVars(partyTheme);
  const badge = document.getElementById('season-badge');
  if (badge) {
    badge.innerHTML = `🪩 &nbsp;PARTY MODE · hue ${h}°`;
    badge.style.borderColor = primary;
    badge.style.color = primary;
  }
}

function stopParty() {
  if (party.timer) clearInterval(party.timer);
  if (party.confettiTimer) clearInterval(party.confettiTimer);
  party.timer = null;
  party.confettiTimer = null;
  party.active = false;
}

export function initThemeSwitcher(container) {
  if (!container) return;
  container.innerHTML = '';

  themeOrder.forEach((key) => {
    const t = themes[key];
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.dataset.themeKey = key;
    btn.type = 'button';
    btn.title = `${t.emoji} ${t.label}`;
    btn.setAttribute('aria-label', `Switch to ${t.label} theme`);
    btn.style.background = `linear-gradient(135deg, ${t.primary} 50%, ${t.secondary} 50%)`;
    btn.addEventListener('click', () => {
      applyTheme(key);
      window.dispatchEvent(
        new CustomEvent('nlanding:toast', {
          detail: { message: `${t.emoji} ${t.label} mode engaged` },
        })
      );
    });
    container.appendChild(btn);
  });

  // Restore saved mood, otherwise follow the academic calendar.
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const auto = !saved || !themes[saved];
  currentKey = auto ? getSeasonalKey() : saved;

  const t = themes[currentKey];
  setVars(t);
  paintBadge(t, auto ? ' · auto' : '');
  paintSwitcher();
  paintFooter(t);
}
