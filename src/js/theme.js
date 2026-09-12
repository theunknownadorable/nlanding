// Seasonal + manual theme engine. Carries forward the seasonal spirit of
// portfolio v1, now with a manual switcher, persistence, and PARTY mode.

export const themes = {
  cyber: {
    label: 'Cyberpunk',
    emoji: '🌆',
    primary: '#00f2ff',
    secondary: '#bd00ff',
    bg: ['#11111d', '#000000'],
    node: 'rgba(0, 242, 255, 0.35)',
    pulse: '#bd00ff',
  },
  frost: {
    label: 'Winter Frost',
    emoji: '❄️',
    primary: '#00ffff',
    secondary: '#e0f2ff',
    bg: ['#0b1026', '#000000'],
    node: 'rgba(200, 255, 255, 0.45)',
    pulse: '#ffffff',
  },
  bloom: {
    label: 'Spring Bloom',
    emoji: '🌸',
    primary: '#2ecc71',
    secondary: '#ff6b81',
    bg: ['#0f2015', '#000000'],
    node: 'rgba(46, 204, 113, 0.35)',
    pulse: '#ff6b81',
  },
  solar: {
    label: 'Solar Flare',
    emoji: '☀️',
    primary: '#f1c40f',
    secondary: '#e67e22',
    bg: ['#261c0b', '#000000'],
    node: 'rgba(241, 196, 15, 0.35)',
    pulse: '#e67e22',
  },
  harvest: {
    label: 'Autumn Harvest',
    emoji: '🍂',
    primary: '#e67e22',
    secondary: '#c0392b',
    bg: ['#26120b', '#000000'],
    node: 'rgba(230, 126, 34, 0.45)',
    pulse: '#f39c12',
  },
  spooky: {
    label: 'Spooky Season',
    emoji: '🎃',
    primary: '#ff9f43',
    secondary: '#8e44ad',
    bg: ['#1a0b26', '#000000'],
    node: 'rgba(255, 159, 67, 0.45)',
    pulse: '#a55eea',
  },
};

export const themeOrder = ['cyber', 'frost', 'bloom', 'solar', 'harvest', 'spooky'];

const STORAGE_KEY = 'nlanding-theme';

let currentKey = 'cyber';
let party = { active: false, hue: 0, timer: null, confettiTimer: null };

export function getSeasonalKey() {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  if ((month === 9 && day >= 25) || (month === 10 && day <= 2)) return 'spooky';
  if (month === 11 || month === 0 || month === 1 || (month === 10 && day >= 20))
    return 'frost';
  if (month >= 2 && month <= 4) return 'bloom';
  if (month >= 5 && month <= 7) return 'solar';
  if (month >= 8 && month <= 10) return 'harvest';
  return 'cyber';
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3 ? h.split('').map((c) => c + c).join('') : h,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function paint(theme, badgeText) {
  const root = document.documentElement;
  const [pr, pg, pb] = hexToRgb(theme.primary);
  const [sr, sg, sb] = hexToRgb(theme.secondary);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-rgb', `${pr}, ${pg}, ${pb}`);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`);
  root.style.setProperty('--glass-border', `rgba(${pr}, ${pg}, ${pb}, 0.35)`);
  root.style.setProperty('--glass-shadow', `rgba(${pr}, ${pg}, ${pb}, 0.14)`);

  const bg = document.getElementById('bg-canvas');
  if (bg) {
    bg.style.background = `radial-gradient(circle at center, ${theme.bg[0]} 0%, ${theme.bg[1]} 100%)`;
  }
  const glow1 = document.getElementById('hero-glow-1');
  const glow2 = document.getElementById('hero-glow-2');
  if (glow1) glow1.style.backgroundColor = theme.primary;
  if (glow2) glow2.style.backgroundColor = theme.secondary;

  const badge = document.getElementById('season-badge');
  if (badge) {
    badge.innerHTML = badgeText;
    badge.style.borderColor = theme.primary;
    badge.style.color = theme.primary;
    badge.style.backgroundColor = `rgba(${pr}, ${pg}, ${pb}, 0.08)`;
  }
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeKey === currentKey && !party.active);
  });
  const foot = document.getElementById('theme-name-foot');
  if (foot) foot.textContent = party.active ? 'Party' : theme.label;
}

export function getCurrentTheme() {
  if (party.active) {
    const h = party.hue;
    return {
      ...themes[currentKey],
      primary: `hsl(${h}, 100%, 60%)`,
      secondary: `hsl(${(h + 70) % 360}, 100%, 60%)`,
      node: `hsla(${h}, 100%, 65%, 0.4)`,
      pulse: `hsl(${(h + 140) % 360}, 100%, 65%)`,
    };
  }
  return themes[currentKey];
}

export function applyTheme(key, { persist = true } = {}) {
  if (!themes[key]) return false;
  stopParty();
  currentKey = key;
  const theme = themes[key];
  paint(theme, `${theme.emoji} &nbsp;${theme.label} Mode`);
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
  const root = document.documentElement;
  party.timer = setInterval(() => {
    party.hue = (party.hue + 6) % 360;
    const p = `hsl(${party.hue}, 100%, 60%)`;
    const s = `hsl(${(party.hue + 70) % 360}, 100%, 62%)`;
    root.style.setProperty('--primary', p);
    root.style.setProperty('--secondary', s);
    const badge = document.getElementById('season-badge');
    if (badge) {
      badge.innerHTML = `🪩 &nbsp;PARTY MODE · hue ${party.hue}°`;
      badge.style.borderColor = p;
      badge.style.color = p;
    }
    const glow1 = document.getElementById('hero-glow-1');
    const glow2 = document.getElementById('hero-glow-2');
    if (glow1) glow1.style.backgroundColor = p;
    if (glow2) glow2.style.backgroundColor = s;
  }, 90);
  party.confettiTimer = setInterval(() => {
    window.dispatchEvent(
      new CustomEvent('nlanding:confetti', {
        detail: { n: 24, spread: true },
      })
    );
  }, 1400);
  document.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
  const foot = document.getElementById('theme-name-foot');
  if (foot) foot.textContent = 'Party';
  return true;
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
  themeOrder.forEach((key) => {
    const t = themes[key];
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.dataset.themeKey = key;
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

  // Restore saved theme, otherwise follow the season.
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const initial = saved && themes[saved] ? saved : getSeasonalKey();
  currentKey = initial;
  const theme = themes[initial];
  const auto = !saved || !themes[saved];
  paint(
    theme,
    auto
      ? `${theme.emoji} &nbsp;${theme.label} Mode · auto`
      : `${theme.emoji} &nbsp;${theme.label} Mode`
  );
}
