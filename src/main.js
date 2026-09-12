// NLANDING v2.1 · "professor era" — boot sequence.
// Every module stays independent; this file wakes them up and wires the
// cross-cutting extras.

import './style.css';

import { initThemeSwitcher, toggleParty, isParty } from './js/theme.js';
import { initToasts, toast } from './js/toast.js';
import { initConfetti, confettiBurst } from './js/confetti.js';
import { initBackground } from './js/background.js';
import { initCursor } from './js/cursor.js';
import { initReveal } from './js/reveal.js';
import { initNav } from './js/nav.js';
import { initTilt } from './js/tilt.js';
import { initTypewriter } from './js/typewriter.js';
import { initGradeRush, openRush } from './js/grade-rush.js';
import { initReflex } from './js/reflex.js';
import { initKonami } from './js/konami.js';
import { initGithubStars } from './js/github.js';
import { initTerminal } from './js/terminal.js';
import { initPalette, openPalette } from './js/palette.js';
import { initNPC } from './js/npc.js';

const EMAIL = 'abhisheksebinu@gmail.com';

// ---- core ----
initToasts();
initConfetti();
document.querySelectorAll('.theme-switcher').forEach(initThemeSwitcher);
initBackground();
initCursor();
initReveal();
initNav();
initTilt();
initTypewriter(document.getElementById('typewriter'), [
  'Assistant Professor @ TKMIT',
  'AI/ML Researcher',
  'Machine Unlearning Enthusiast',
  'Robot Befriender',
  'Python Wrangler',
  'Office-Hours Regular',
]);

// ---- toys ----
initGradeRush();
initReflex();
initGithubStars();
initTerminal();
initPalette();
initNPC();
initKonami(() => {
  if (!isParty()) {
    toggleParty();
    confettiBurst({ n: 160 });
    toast('↑↑↓↓←→←→BA — YOU KNOW THE WAYS 🪩');
  }
});

// ---- hero polaroid: 5 taps to open Grade Rush ----
(function secretPhoto() {
  const photo = document.getElementById('brain-trigger');
  if (!photo) return;
  let taps = 0;
  let timer = null;
  photo.addEventListener('click', () => {
    taps++;
    clearTimeout(timer);
    timer = setTimeout(() => (taps = 0), 1300);
    if (taps === 3) toast('the chalk dust is stirring… (3/5) 👀');
    if (taps === 4) toast('almost there… (4/5) 🎓');
    if (taps >= 5) {
      taps = 0;
      openRush();
    }
  });
})();

// ---- party button ----
document.getElementById('party-btn')?.addEventListener('click', () => {
  const on = toggleParty();
  if (on) {
    confettiBurst({ n: 140 });
    toast('🪩 PARTY MODE: ON (pick any mood to chill)');
  } else {
    toast('party mode off. back to the syllabus. 📖');
  }
});

// ---- copy email ----
document.getElementById('copy-email-btn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    toast('📋 Email copied — say hi!');
  } catch {
    toast(`📧 ${EMAIL}`);
  }
});

// ---- project cards: whole-card links ----
document.querySelectorAll('.project-card[data-href]').forEach((card) => {
  const href = card.dataset.href;
  const go = () => {
    toast('opening GitHub ↗');
    window.open(href, '_blank', 'noopener');
  };
  card.addEventListener('click', go);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  });
});

// ---- footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- console easter egg for fellow devs ----
console.log(
  '%c🎓 nlanding v2.1 “professor era” — office hours are open. Try the Konami code: ↑↑↓↓←→←→BA',
  'background:#f6f2e9;color:#1d4ed8;font-size:13px;padding:8px;border-radius:6px;border:1px solid #b45309;'
);

// expose openers for inline handlers and curious visitors
window.nlanding = { openPalette, openRush };
