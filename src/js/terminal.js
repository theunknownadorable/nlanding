// Fake-but-fun terminal, professor era. Always dark, whatever mood the site
// is in. Try `help`, `tkmit`, `academia`, `rush`, `sudo grant tenure`…

import { themes, themeOrder, applyTheme, getSeasonalKey, toggleParty } from './theme.js';
import { openRush } from './grade-rush.js';
import { openPalette } from './palette.js';

const EMAIL = 'abhisheksebinu@gmail.com';
const DEPT_URL = 'https://tkmit.ac.in/wp_department/computer-science-engineering/';

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
      `<span class="term-green">visitor@tkmit</span><span class="term-dim">:</span><span class="term-cyan">~</span><span class="term-dim">$</span> <span class="term-white">${escapeHtml(cmd)}</span>`
    );
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const cmds = {
    help() {
      print(`available commands: <span class="term-yellow">help whoami about academia tkmit officehours skills projects research contact socials rush game party palette reflex theme season konami date echo goto clear</span>`);
      print(`<span class="term-dim">psst… also try: sudo grant tenure · sudo hire abhishek · rm -rf / · vim</span>`);
    },
    whoami() {
      print(`you are <span class="term-green">visitor</span> — a human of excellent taste in academic landing pages.`);
    },
    about() {
      print(`<span class="term-cyan font-bold">Abhishek S.</span> — Assistant Professor, Computer Science &amp; Engineering @ TKM Institute of Technology.`);
      print(`Research: machine unlearning, SISA, educational robotics. Teaches AI/ML, Python, and the occasional life lesson.`);
    },
    academia() {
      print(`<span class="term-gold font-bold">ACADEMIA</span> — the part of the page with a syllabus attached.`);
      print(`<span class="term-cyan">appointment</span>  Assistant Professor · CSE · TKMIT`);
      print(`<span class="term-cyan">teaching</span>     AI/ML · Python · data-structures lab`);
      print(`<span class="term-cyan">research</span>     machine unlearning · SISA · computer vision · NLP · educational robotics`);
      print(`<span class="term-dim">scroll to #academia, or: goto academia</span>`);
      goto('#academia');
    },
    tkmit() {
      print(`<span class="term-gold font-bold">TKM Institute of Technology</span> — Department of Computer Science &amp; Engineering.`);
      print(`opening the department page in a new tab… <span class="term-dim">${escapeHtml(DEPT_URL)}</span>`);
      window.open(DEPT_URL, '_blank', 'noopener');
    },
    officehours() {
      print(`<span class="term-yellow">OFFICE HOURS</span> Mon–Fri · 3:30–4:30 pm · CSE Department, TKMIT`);
      print(`<span class="term-dim">bring the question, not the panic. appointments always welcome.</span>`);
      goto('#academia');
    },
    hours() {
      cmds.officehours();
    },
    research() {
      print(`<span class="term-yellow">interests:</span> machine unlearning · SISA / selective retraining · computer vision · NLP · educational robotics · AI for healthcare · privacy-preserving ML`);
    },
    skills() {
      print(`<span class="term-yellow">languages:</span> python ▰▰▰▰▱ · c/c++ ▰▰▰▰ · html/css ▰▰▰▰▱ · java ▰▰▰▱ · latex ▰▰▰▰`);
      print(`<span class="term-yellow">arsenal:</span> tensorflow · pytorch · flask · django · robotics`);
    },
    projects() {
      print(`<span class="term-cyan">medibot</span> — diagnostic assistant for students, doctors &amp; patients`);
      print(`<span class="term-cyan">machine-unlearning</span> — SISA selective retraining research`);
      print(`<span class="term-cyan">rfa-robot</span> — classroom assistant robot`);
      print(`<span class="term-dim">scroll to #projects, or: goto projects</span>`);
    },
    contact() {
      print(`📧 <span class="term-green">${EMAIL}</span>`);
      print(`💼 linkedin.com/in/abhishekofficial2427`);
      print(`🐙 github.com/theunknownadorable`);
      print(`🏛️ tkmit.ac.in — Computer Science &amp; Engineering`);
    },
    socials() {
      cmds.contact();
    },
    rush() {
      print(`chalk in hand… <span class="term-dim">catch the A+, dodge the F. 60 seconds, three apples.</span>`);
      setTimeout(openRush, 450);
    },
    game() {
      cmds.rush();
    },
    grade() {
      cmds.rush();
    },
    party() {
      const on = toggleParty();
      print(on ? `🪩 <span class="term-pink font-bold">PARTY MODE: ON.</span> <span class="term-dim">run party again to restore order.</span>` : `party mode off. the department thanks you.`);
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
      const k = getSeasonalKey();
      print(`the academic calendar says: <span class="term-yellow">${themes[k].label}</span> ${themes[k].emoji}`);
    },
    theme(args) {
      const [arg] = args;
      if (!arg || arg === 'list') {
        print(`moods: <span class="term-yellow">${['auto', ...themeOrder].join(' · ')}</span>`);
        print(`<span class="term-dim">usage: theme &lt;name&gt; — e.g. theme blackboard</span>`);
        return;
      }
      if (arg === 'auto') {
        applyTheme(getSeasonalKey());
        print(`mood follows the calendar now: <span class="term-cyan">${themes[getSeasonalKey()].label}</span>`);
        return;
      }
      if (applyTheme(arg)) {
        print(`mood set: <span class="term-cyan">${themes[arg].emoji} ${themes[arg].label}</span>`);
      } else {
        print(`<span class="term-red">unknown mood "${escapeHtml(arg)}".</span> <span class="term-dim">try: theme list</span>`);
      }
    },
    mood(args) {
      cmds.theme(args);
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
      const map = {
        home: '#home',
        about: '#about',
        skills: '#skills',
        projects: '#projects',
        academia: '#academia',
        journey: '#journey',
        playground: '#playground',
        contact: '#contact',
      };
      const dest = map[(args[0] || '').toLowerCase()];
      if (dest) {
        print(`warping to <span class="term-cyan">${dest}</span>…`);
        goto(dest);
      } else {
        print(`<span class="term-dim">usage: goto &lt;${Object.keys(map).join('|')}&gt;</span>`);
      }
    },
    sudo(args) {
      const rest = args.join(' ').toLowerCase();
      if (rest === 'grant tenure') {
        print(`<span class="term-gold font-bold">[sudo] TENURE GRANTED.</span> 🎓`);
        print(`<span class="term-dim">committee vote: unanimous. one (1) robot abstained, citing "beep boop".</span>`);
        print(`office relocated to the corner room. chalk budget: <span class="term-green">unlimited</span>.`);
        window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 170 } }));
        window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🎓 Tenure granted. Congratulations, Professor.' } }));
      } else if (rest === 'hire abhishek') {
        print(`<span class="term-green font-bold">[sudo] EXCELLENT DECISION.</span> ✅`);
        print(`forwarding your offer letter to <span class="term-cyan">${EMAIL}</span>… (not really, but you should email him)`);
        window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 120 } }));
      } else if (rest === 'rm -rf /') {
        print(`<span class="term-red">[sudo] permission denied.</span> <span class="term-dim">the students need that directory.</span>`);
      } else {
        print(`<span class="term-red">visitor is not in the sudoers file. this incident will be reported to Glitch. 🤖</span>`);
      }
    },
    tenure() {
      print(`<span class="term-dim">you can't just type tenure. try:</span> <span class="term-yellow">sudo grant tenure</span>`);
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
    latex() {
      print(`<span class="term-yellow">overleaf is just vim with a compile button.</span> <span class="term-dim">fight me in office hours.</span>`);
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
    // Allow multi-word commands to reach `sudo …` intact.
    const [name, ...args] = line.split(/\s+/);
    const fn = cmds[name.toLowerCase()];
    if (fn) fn(args);
    else print(`<span class="term-red">command not found:</span> <span class="term-white">${escapeHtml(name)}</span> <span class="term-dim">— try help</span>`);
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
    `<span class="term-dim">tkmit shell v2.1 — faculty terminal, CSE department 🏛️</span>`,
    `<span class="term-dim">type </span><span class="term-yellow">help</span><span class="term-dim"> to see what I can do.</span>`,
  ];
  boot.forEach((line, i) => setTimeout(() => print(line), 350 + i * 350));
}

export function focusTerminal() {
  goto('#playground');
  setTimeout(() => document.getElementById('term-input')?.focus({ preventScroll: true }), 600);
}
