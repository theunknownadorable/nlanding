// Fake-but-fun terminal. Try `help`, `game`, `party`, `theme spooky`…

import { themes, themeOrder, applyTheme, getSeasonalKey, toggleParty } from './theme.js';
import { openGame } from './game.js';
import { openPalette } from './palette.js';

const EMAIL = 'abhisheksebinu@gmail.com';

function goto(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function initTerminal() {
  const win = document.getElementById('terminal');
  const out = document.getElementById('term-output');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-input');
  if (!win || !out || !form || !input) return;

  const history = [];
  let hIdx = -1;

  function print(html, cls = '') {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  function echo(cmd) {
    print(
      `<span class="term-green">visitor@nlanding</span><span class="term-dim">:</span><span class="term-cyan">~</span><span class="term-dim">$</span> <span class="text-white">${escapeHtml(cmd)}</span>`
    );
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const cmds = {
    help() {
      print(`available spells: <span class="term-yellow">help whoami about skills projects contact socials game party palette reflex theme season konami date echo clear</span>`);
      print(`<span class="term-dim">psst… also try: sudo hire abhishek · rm -rf / · vim</span>`);
    },
    whoami() {
      print(`you are <span class="term-green">visitor</span> — a human of excellent taste in landing pages.`);
    },
    about() {
      print(`<span class="term-cyan font-bold">Abhishek S.</span> — AI/ML enthusiast @ TKM College of Engineering.`);
      print(`Python + C wrangler, robot befriender, professional bug-to-feature alchemist.`);
    },
    skills() {
      print(`<span class="term-yellow">languages:</span> python ▰▰▰▰▱ · c/c++ ▰▰▰▰ · html/css ▰▰▰▰▱ · java ▰▰▰▱ · latex ▰▰▰▰`);
      print(`<span class="term-yellow">arsenal:</span> tensorflow · pytorch · flask · django · robotics`);
    },
    projects() {
      print(`<span class="term-cyan">medibot</span> — diagnostic assistant for students, doctors & patients`);
      print(`<span class="term-cyan">machine-unlearning</span> — SISA selective retraining research`);
      print(`<span class="term-cyan">rfa-robot</span> — classroom assistant robot`);
      print(`<span class="term-dim">scroll up to #projects or type: goto projects</span>`);
    },
    contact() {
      print(`📧 <span class="term-green">${EMAIL}</span>`);
      print(`💼 linkedin.com/in/abhishekofficial2427`);
      print(`🐙 github.com/theunknownadorable`);
    },
    socials() {
      cmds.contact();
    },
    game() {
      print(`jackin you in… <span class="term-dim">reach the EXIT portal. mind the lava.</span>`);
      setTimeout(openGame, 450);
    },
    party() {
      const on = toggleParty();
      print(on ? `🪩 <span class="term-pink font-bold">PARTY MODE: ON.</span> <span class="term-dim">run party again to chill.</span>` : `party mode off. the neighbors thank you.`);
    },
    palette() {
      print(`summoning the command palette… <span class="term-dim">(psst: ctrl+k works anywhere)</span>`);
      setTimeout(openPalette, 350);
    },
    reflex() {
      print(`warming up your neurons…`);
      goto('#playground');
    },
    season() {
      print(`the calendar says: <span class="term-yellow">${themes[getSeasonalKey()].label}</span> ${themes[getSeasonalKey()].emoji}`);
    },
    theme(args) {
      const [arg] = args;
      if (!arg || arg === 'list') {
        print(`themes: <span class="term-yellow">${['auto', ...themeOrder].join(' · ')}</span>`);
        print(`<span class="term-dim">usage: theme &lt;name&gt; — e.g. theme spooky</span>`);
        return;
      }
      if (arg === 'auto') {
        applyTheme(getSeasonalKey());
        print(`theme follows the season now: <span class="term-cyan">${themes[getSeasonalKey()].label}</span>`);
        return;
      }
      if (applyTheme(arg)) {
        print(`theme set: <span class="term-cyan">${themes[arg].emoji} ${themes[arg].label}</span>`);
      } else {
        print(`<span class="term-red">unknown theme "${escapeHtml(arg)}".</span> <span class="term-dim">try: theme list</span>`);
      }
    },
    konami() {
      print(`↑ ↑ ↓ ↓ ← → ← → <span class="term-yellow">B A</span>`);
      print(`<span class="term-dim">type it anywhere on this page. trust me.</span>`);
    },
    date() {
      print(new Date().toString());
    },
    echo(args) {
      print(escapeHtml(args.join(' ')) || '<span class="term-dim">(silence)</span>');
    },
    goto(args) {
      const map = { home: '#home', about: '#about', skills: '#skills', projects: '#projects', journey: '#journey', playground: '#playground', contact: '#contact' };
      const dest = map[(args[0] || '').toLowerCase()];
      if (dest) {
        print(`warping to <span class="term-cyan">${dest}</span>…`);
        goto(dest);
      } else {
        print(`<span class="term-dim">usage: goto &lt;${Object.keys(map).join('|')}&gt;</span>`);
      }
    },
    sudo(args) {
      if (args.join(' ').toLowerCase() === 'hire abhishek') {
        print(`<span class="term-green font-bold">[sudo] EXCELLENT DECISION.</span> ✅`);
        print(`forwarding your offer letter to <span class="term-cyan">${EMAIL}</span>… (not really, but you should email him)`);
        window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 120 } }));
      } else {
        print(`<span class="term-red">visitor is not in the sudoers file. this incident will be reported to Glitch. 🤖</span>`);
      }
    },
    rm() {
      print(`<span class="term-red">nice try.</span> <span class="term-dim">the robots have seen this one before.</span>`);
    },
    vim() {
      print(`you open vim. you can never leave. <span class="term-dim">(this is now a vim tutorial site. :q! to panic)</span>`);
    },
    emacs() {
      print(`a worthy choice. the editor war rages on. ⚔️`);
    },
    exit() {
      print(`there is no escape. <span class="term-dim">this terminal loves you.</span> ❤️`);
    },
    clear() {
      out.innerHTML = '';
    },
  };

  function run(raw) {
    const line = raw.trim();
    if (!line) return;
    const [name, ...args] = line.split(/\s+/);
    const fn = cmds[name.toLowerCase()];
    if (fn) fn(args);
    else print(`<span class="term-red">command not found:</span> ${escapeHtml(name)} <span class="term-dim">— try help</span>`);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cmd = input.value;
    echo(cmd || '');
    history.unshift(cmd);
    hIdx = -1;
    input.value = '';
    run(cmd);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdx < history.length - 1) {
        hIdx++;
        input.value = history[hIdx] ?? '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx > 0) {
        hIdx--;
        input.value = history[hIdx];
      } else {
        hIdx = -1;
        input.value = '';
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = '';
    }
  });

  win.addEventListener('click', () => input.focus({ preventScroll: true }));

  // boot sequence
  const boot = [
    `<span class="term-dim">nlanding shell v2.0 — neural link established 🛰️</span>`,
    `type <span class="term-yellow">help</span> to see what I can do.`,
  ];
  boot.forEach((line, i) => setTimeout(() => print(line), 350 + i * 350));
}

export function focusTerminal() {
  goto('#playground');
  setTimeout(() => document.getElementById('term-input')?.focus({ preventScroll: true }), 600);
}
