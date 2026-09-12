// Ctrl+K command palette: jump anywhere, switch themes, launch toys.

import { themes, themeOrder, applyTheme, getSeasonalKey, toggleParty, cycleTheme } from './theme.js';
import { openGame } from './game.js';
import { focusTerminal } from './terminal.js';

const EMAIL = 'abhisheksebinu@gmail.com';

let overlay, input, list;
let commands = [];
let filtered = [];
let selected = 0;

function goto(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildCommands() {
  const go = (title, hash, keywords = '') => ({
    group: 'Go to',
    title,
    hint: hash,
    keywords: `${title} ${keywords} goto navigate`,
    run: () => goto(hash),
  });
  commands = [
    go('Home', '#home', 'top hero start'),
    go('About', '#about', 'me bio who'),
    go('Skills', '#skills', 'tech stack arsenal languages'),
    go('Projects', '#projects', 'work medibot github rfa'),
    go('Journey', '#journey', 'timeline story chapters education'),
    go('Playground', '#playground', 'terminal game reflex toys fun'),
    go('Contact', '#contact', 'email hire socials footer'),
    {
      group: 'Theme',
      title: 'Auto theme (follow the season)',
      hint: 'seasonal',
      keywords: 'auto season theme',
      run: () => {
        applyTheme(getSeasonalKey());
        window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '📅 Seasonal theme engaged' } }));
      },
    },
    ...themeOrder.map((key) => ({
      group: 'Theme',
      title: `${themes[key].emoji} ${themes[key].label}`,
      hint: 'theme',
      keywords: `theme ${key} ${themes[key].label} color`,
      run: () => {
        applyTheme(key);
        window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: `${themes[key].emoji} ${themes[key].label} mode engaged` } }));
      },
    })),
    {
      group: 'Toys',
      title: '🪩 Toggle PARTY mode',
      hint: 'disco',
      keywords: 'party disco confetti fun dance',
      run: () => {
        const on = toggleParty();
        if (on) {
          window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 140 } }));
          window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🪩 PARTY MODE: ON' } }));
        }
      },
    },
    {
      group: 'Toys',
      title: '🎮 Launch NEURAL JUMP 2.0',
      hint: 'secret game',
      keywords: 'game play jump platformer secret neural',
      run: () => setTimeout(openGame, 120),
    },
    {
      group: 'Toys',
      title: '💻 Focus the terminal',
      hint: 'shell',
      keywords: 'terminal shell console focus type',
      run: () => focusTerminal(),
    },
    {
      group: 'Toys',
      title: '🎲 Surprise me',
      hint: 'chaos',
      keywords: 'surprise random chaos fun',
      run: () => {
        const roll = Math.random();
        if (roll < 0.3) {
          cycleTheme();
          window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🎲 The vibes have shifted' } }));
        } else if (roll < 0.6) {
          window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 150 } }));
          window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🎲 Confetti! You earned it.' } }));
        } else {
          setTimeout(openGame, 120);
        }
      },
    },
    {
      group: 'Contact',
      title: '📋 Copy email address',
      hint: EMAIL,
      keywords: 'email copy contact mail hire',
      run: async () => {
        try {
          await navigator.clipboard.writeText(EMAIL);
          window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '📋 Email copied to clipboard!' } }));
        } catch {
          window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: `📧 ${EMAIL}` } }));
        }
      },
    },
    {
      group: 'Contact',
      title: '🐙 Open GitHub profile',
      hint: 'external',
      keywords: 'github profile code repos',
      run: () => window.open('https://github.com/theunknownadorable', '_blank', 'noopener'),
    },
  ];
}

function render() {
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = `<div class="px-4 py-6 text-center text-sm text-gray-500 font-body">no spells match "<span class="text-gray-300"></span>"</div>`;
    list.querySelector('span').textContent = input.value;
    return;
  }
  let lastGroup = null;
  filtered.slice(0, 10).forEach((cmd, idx) => {
    if (cmd.group !== lastGroup) {
      lastGroup = cmd.group;
      const g = document.createElement('div');
      g.className = 'px-4 pt-3 pb-1 text-[11px] font-mono uppercase tracking-[0.25em] text-gray-500';
      g.textContent = cmd.group;
      list.appendChild(g);
    }
    const item = document.createElement('button');
    item.className = `palette-item w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between gap-3 ${idx === selected ? 'selected' : ''}`;
    const t = document.createElement('span');
    t.className = 'font-body font-semibold text-[15px]';
    t.textContent = cmd.title;
    const h = document.createElement('span');
    h.className = 'text-xs font-mono text-gray-500 shrink-0';
    h.textContent = cmd.hint;
    item.append(t, h);
    item.addEventListener('click', () => {
      selected = idx;
      execute();
    });
    item.addEventListener('mousemove', () => {
      if (selected !== idx) {
        selected = idx;
        render();
      }
    });
    list.appendChild(item);
  });
}

function filter() {
  const q = input.value.trim().toLowerCase();
  filtered = !q
    ? [...commands]
    : commands.filter((c) => `${c.title} ${c.keywords}`.toLowerCase().includes(q));
  selected = 0;
  render();
}

function execute() {
  const cmd = filtered.slice(0, 10)[selected];
  closePalette();
  cmd?.run();
}

export function openPalette() {
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  document.body.style.overflow = 'hidden';
  input.value = '';
  filter();
  setTimeout(() => input.focus(), 30);
}

export function closePalette() {
  if (!overlay || overlay.classList.contains('hidden')) return;
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  // only restore scroll if the game isn't holding it
  if (document.getElementById('game-modal')?.classList.contains('hidden')) {
    document.body.style.overflow = '';
  }
}

export function isPaletteOpen() {
  return overlay && !overlay.classList.contains('hidden');
}

export function initPalette() {
  overlay = document.getElementById('palette-overlay');
  input = document.getElementById('palette-input');
  list = document.getElementById('palette-list');
  if (!overlay || !input || !list) return;

  buildCommands();
  filter();

  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    const max = Math.min(filtered.length, 10) - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected = selected >= max ? 0 : selected + 1;
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected = selected <= 0 ? max : selected - 1;
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute();
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
  });

  document.querySelectorAll('[data-palette-open]').forEach((b) =>
    b.addEventListener('click', openPalette)
  );

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isPaletteOpen() ? closePalette() : openPalette();
    }
  });
  window.addEventListener('nlanding:open-palette', openPalette);
}
