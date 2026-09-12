// Ctrl+K command palette: jump anywhere, switch moods, launch toys.

import { themes, themeOrder, applyTheme, getSeasonalKey, toggleParty, cycleTheme } from './theme.js';
import { openRush } from './grade-rush.js';
import { focusTerminal } from './terminal.js';

const EMAIL = 'abhisheksebinu@gmail.com';
const DEPT_URL = 'https://tkmit.ac.in/wp_department/computer-science-engineering/';

let overlay, input, list;
let commands = [];
let filtered = [];
let selected = 0;

function goto(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toast(message) {
  window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message } }));
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
    go('Academia', '#academia', 'professor teaching research office hours students tkmit department'),
    go('Journey', '#journey', 'timeline story chapters education'),
    go('Playground', '#playground', 'terminal game reflex toys fun'),
    go('Contact', '#contact', 'email hire socials footer'),
    {
      group: 'Academia',
      title: '🏛️ Open the TKMIT department page',
      hint: 'external',
      keywords: 'tkmit tkm institute technology department computer science engineering college campus',
      run: () => window.open(DEPT_URL, '_blank', 'noopener'),
    },
    {
      group: 'Academia',
      title: '🕒 Office hours (Mon–Fri 3:30–4:30)',
      hint: '#academia',
      keywords: 'office hours students appointment slot teaching help',
      run: () => {
        goto('#academia');
        toast('🕒 Office hours: Mon–Fri, 3:30–4:30 pm · CSE, TKMIT');
      },
    },
    {
      group: 'Mood',
      title: 'Auto mood (follow the academic calendar)',
      hint: 'seasonal',
      keywords: 'auto season theme mood calendar',
      run: () => {
        applyTheme(getSeasonalKey());
        toast('📅 Seasonal mood engaged');
      },
    },
    ...themeOrder.map((key) => ({
      group: 'Mood',
      title: `${themes[key].emoji} ${themes[key].label}`,
      hint: 'theme',
      keywords: `theme mood ${key} ${themes[key].label} color colour`,
      run: () => {
        applyTheme(key);
        toast(`${themes[key].emoji} ${themes[key].label} mode engaged`);
      },
    })),
    {
      group: 'Toys',
      title: '🪩 Toggle PARTY mode',
      hint: 'disco',
      keywords: 'party disco confetti fun dance konami',
      run: () => {
        const on = toggleParty();
        if (on) {
          window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 140 } }));
          toast('🪩 PARTY MODE: ON');
        }
      },
    },
    {
      group: 'Toys',
      title: '🎓 Launch GRADE RUSH',
      hint: 'secret game',
      keywords: 'game play grade rush chalkboard catch apple secret professor tenure',
      run: () => setTimeout(openRush, 120),
    },
    {
      group: 'Toys',
      title: '💻 Focus the terminal',
      hint: 'shell',
      keywords: 'terminal shell console focus type tkmit academia sudo tenure',
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
          toast('🎲 The vibes have shifted');
        } else if (roll < 0.6) {
          window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 150 } }));
          toast('🎲 Confetti! You earned it.');
        } else {
          setTimeout(openRush, 120);
        }
      },
    },
    {
      group: 'Contact',
      title: '📋 Copy email address',
      hint: EMAIL,
      keywords: 'email copy contact mail hire students',
      run: async () => {
        try {
          await navigator.clipboard.writeText(EMAIL);
          toast('📋 Email copied to clipboard!');
        } catch {
          toast(`📧 ${EMAIL}`);
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
    {
      group: 'Contact',
      title: '💼 Open LinkedIn',
      hint: 'external',
      keywords: 'linkedin profile network resume cv',
      run: () => window.open('https://www.linkedin.com/in/abhishekofficial2427/', '_blank', 'noopener'),
    },
  ];
}

function render() {
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = `<div class="px-4 py-6 text-center text-sm txt-faint font-body">nothing on the syllabus matches "<span class="txt-soft"></span>"</div>`;
    list.querySelector('span').textContent = input.value;
    return;
  }
  let lastGroup = null;
  filtered.slice(0, 10).forEach((cmd, idx) => {
    if (cmd.group !== lastGroup) {
      lastGroup = cmd.group;
      const g = document.createElement('div');
      g.className = 'pal-group px-4 pt-3 pb-1 text-[11px] font-mono uppercase tracking-[0.25em]';
      g.textContent = cmd.group;
      list.appendChild(g);
    }
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `palette-item w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between gap-3 ${idx === selected ? 'selected' : ''}`;
    const t = document.createElement('span');
    t.className = 'font-body font-semibold text-[15px]';
    t.textContent = cmd.title;
    const h = document.createElement('span');
    h.className = 'text-xs font-mono txt-faint shrink-0';
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
  // Drop focus so the global hotkeys (esc / arrows / Konami) work again the
  // moment the palette is gone — otherwise a launch straight into Grade Rush
  // leaves focus parked in a hidden input and swallows the first keystrokes.
  input?.blur();
  // only restore scroll if Grade Rush isn't holding it
  if (document.getElementById('rush-modal')?.classList.contains('hidden')) {
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
