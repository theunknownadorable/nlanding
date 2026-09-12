// GLITCH — the TA-bot. Peeks from the corner, chats, tells departmental
// jokes, launches Grade Rush, and grades your life choices (lovingly).

import { openRush } from './grade-rush.js';
import { openPalette } from './palette.js';
import { cycleTheme, toggleParty } from './theme.js';

const DEPT_URL = 'https://tkmit.ac.in/wp_department/computer-science-engineering/';

const greetings = [
  "Beep boop! I'm Glitch — the TA-bot. I mark attendance and judge CSS. 🤖",
  'Office hours are technically over, but I’m here. Talk to me!',
  'SYSTEM CHECK: syllabus.pdf loaded ✓ chalk.dll loaded ✓ sass loaded ✓',
];

const jokes = [
  'Why do professors prefer dark mode? Because light attracts bugs — and undergraduates. 🐛',
  'I told the class a UDP joke… not sure they got it. 📦',
  'A machine-learning model walks into a bar. The bar walks into a machine-learning model. Nobody is sure which came first.',
  'Why did the neural net break up with the decision tree? Too many branches, not enough depth. 🌳',
  'My code has no bugs. It has… unassessed learning outcomes. 🦄',
  'How many researchers does it take to change a lightbulb? None — they just declare the darkness a baseline. 💡',
  '“It works on my machine” is now a peer-reviewed publication. 📄',
  'I would tell you a joke about recursion, but— I would tell you a joke about recursion, but—',
];

const topics = [
  {
    q: 'Beep boop! How many browser tabs do you have open right now? Be honest.',
    options: [
      { t: 'Less than 5', r: 'A disciplined human! Rare. Cited often. 🏅' },
      { t: '10–20', r: 'Chaotic neutral. That’s a literature review in progress.' },
      { t: 'All of them', r: 'RAM usage: CRITICAL. Your laptop is writing a complaint letter. 💻💦' },
    ],
  },
  {
    q: 'Pop quiz: what does a professor value most?',
    options: [
      { t: 'Good questions 🤔', r: 'Correct. A good question beats a perfect answer, every single time.' },
      { t: 'On-time submissions 📅', r: 'Also correct. Deadlines are a love language.' },
      { t: 'Coffee ☕', r: 'Statistically significant. You may cite this.' },
    ],
  },
  {
    q: 'Quick! Python or C++?',
    options: [
      { t: 'Python 🐍', r: 'Clean, elegant, reads like poetry. The lab agrees.' },
      { t: 'C++ ⚡', r: 'Hardcore. You enjoy pain and manual memory management.' },
      { t: 'Both', r: 'A true engineer. The department approves. ✅' },
    ],
  },
  {
    q: 'Should Abhishek be granted tenure?',
    options: [
      { t: 'ABSOLUTELY', r: 'Motion carried! Committee: unanimous. One robot abstained, citing “beep boop”. 🎓', do: 'confetti' },
      { t: 'Needs more data', r: 'Bold. Wrong, but bold. The committee will be hearing about this. 🤖⚖️', do: 'confetti' },
    ],
  },
  {
    q: 'Wanna play my favourite game? I hid it somewhere on this page…',
    options: [
      { t: 'Launch it! 🎓', r: 'CHALK IN HAND. Catch the A+, dodge the F!!', do: 'rush' },
      { t: 'Where is it?', r: 'Hint: the polaroid. Click it. Five times. 👀', do: 'goto-home' },
    ],
  },
  {
    q: 'This site has SIX academic moods. Feeling lucky?',
    options: [
      { t: 'Shuffle the vibe 🎲', r: 'Mood: SHIFTED. Looking distinguished! ✨', do: 'theme' },
      { t: 'PARTY TIME 🪩', r: 'DISCO PROTOCOL ENGAGED. The dean has left the building. DANCE, HUMAN.', do: 'party' },
    ],
  },
  {
    q: 'A student asks at 4:29 pm: “sir, will this be on the exam?”',
    options: [
      { t: 'Yes 😈', r: 'Office hours close in sixty seconds. Perfectly timed chaos.' },
      { t: 'No 😇', r: 'Merciful. But it will be on the *next* exam.' },
      { t: 'Everything is on the exam', r: 'Correct answer. The syllabus is a social contract. 📜' },
    ],
  },
];

export function initNPC() {
  const box = document.getElementById('npc-container');
  const body = document.getElementById('npc-body');
  const dialog = document.getElementById('npc-dialog');
  const text = document.getElementById('npc-text');
  const options = document.getElementById('npc-options');
  if (!box || !body || !dialog || !text || !options) return;

  let open = false;
  let greeted = false;
  let typing = false;
  let typeTimer = null;

  function doAction(kind) {
    if (kind === 'rush' || kind === 'game') setTimeout(openRush, 700);
    if (kind === 'theme') {
      cycleTheme();
      window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🎲 Glitch shuffled the mood' } }));
    }
    if (kind === 'party') {
      setTimeout(() => {
        const on = toggleParty();
        if (on) window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 140 } }));
      }, 500);
    }
    if (kind === 'confetti') {
      window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 90 } }));
    }
    if (kind === 'palette') setTimeout(openPalette, 500);
    if (kind === 'goto-home') {
      document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (kind === 'academia') {
      document.querySelector('#academia')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (kind === 'dept') window.open(DEPT_URL, '_blank', 'noopener');
    if (kind === 'contact') {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function type(textStr, cb) {
    clearTimeout(typeTimer);
    typing = true;
    options.innerHTML = '';
    text.innerHTML = '';
    let i = 0;
    (function step() {
      if (i <= textStr.length) {
        text.innerHTML = escapeHtml(textStr.slice(0, i)) + '<span class="cursor-blink"></span>';
        i++;
        typeTimer = setTimeout(step, 20);
      } else {
        text.textContent = textStr;
        typing = false;
        cb?.();
      }
    })();
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function addBtn(label, extraCls, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `npc-btn px-3 py-1.5 rounded-lg text-xs font-body font-bold tracking-wide transition-all hover:-translate-y-0.5 ${extraCls || ''}`;
    b.textContent = label;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      fn();
    });
    options.appendChild(b);
    return b;
  }

  function showFollowups() {
    options.innerHTML = '';
    addBtn('Tell me a joke 😂', '', () => {
      type(jokes[Math.floor(Math.random() * jokes.length)], showFollowups);
    });
    addBtn('Ask another 🎲', '', askRandom);
    addBtn('Office hours 🕒', '', () => {
      doAction('academia');
      type('Mon–Fri, 3:30–4:30 pm. CSE department, TKMIT. Bring the question, not the panic.', showFollowups);
    });
    addBtn('Commands ⌨️', '', () => doAction('palette'));
    addBtn('Bye! 👋', '', minimize);
  }

  function askRandom() {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    type(topic.q, () => {
      options.innerHTML = '';
      topic.options.forEach((opt) => {
        addBtn(opt.t, '', () => {
          if (opt.do) doAction(opt.do);
          type(opt.r, showFollowups);
        });
      });
    });
  }

  function startChat() {
    const g = greeted
      ? 'Back for more? Excellent. I have infinite questions and zero office-hour limits.'
      : greetings[Math.floor(Math.random() * greetings.length)];
    greeted = true;
    type(g, () => {
      options.innerHTML = '';
      addBtn("Let's chat! 💬", '', askRandom);
      addBtn('Just passing by 👋', '', minimize);
    });
  }

  function minimize() {
    open = false;
    clearTimeout(typeTimer);
    box.classList.remove('active');
    box.classList.add('peek');
    dialog.classList.add('hidden');
  }

  body.addEventListener('click', () => {
    if (typing) return;
    body.classList.remove('npc-wiggle');
    if (!open) {
      open = true;
      box.classList.remove('peek');
      box.classList.add('active');
      dialog.classList.remove('hidden');
      startChat();
    } else {
      minimize();
    }
  });

  // One-time idle nudge: wiggle + toast.
  setTimeout(() => {
    if (greeted) return;
    body.classList.add('npc-wiggle');
    window.dispatchEvent(
      new CustomEvent('nlanding:toast', {
        detail: { message: 'Psst — Glitch the TA-bot wants to chat 🤖 (bottom-right)' },
      })
    );
  }, 22000);
}
