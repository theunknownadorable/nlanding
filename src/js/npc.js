// GLITCH 2.0 — the resident robot. Peeks from the corner, chats, tells
// jokes, launches the game, and judges your life choices (lovingly).

import { openGame } from './game.js';
import { openPalette } from './palette.js';
import { cycleTheme, toggleParty } from './theme.js';

const greetings = [
  "Beep boop! I'm Glitch — resident robot of this landing page. 🤖",
  'Oh hey, a visitor! I get SO bored down here. Talk to me!',
  'SYSTEM CHECK: charm.exe loaded ✓ sass.dll loaded ✓ How can I help?',
];

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
  'I told my friend a UDP joke… not sure they got it. 📦',
  'There are only 10 kinds of people: those who understand binary and those who don’t.',
  'Why did the neural net dump the decision tree? Too many branches, not enough depth. 🌳',
  'My code has no bugs. It just develops… random features. 🦄',
  'Why do Java devs wear glasses? Because they don’t C#. 😎',
  'I would tell you a joke about recursion, but— I would tell you a joke about recursion, but—',
];

const topics = [
  {
    q: 'Beep boop! How many tabs do you have open right now? Be honest.',
    options: [
      { t: 'Less than 5', r: 'A disciplined human! Rare. Cherished. 🏅' },
      { t: '10–20', r: 'Chaotic neutral. I respect it.' },
      { t: 'All of them', r: 'RAM usage: CRITICAL. Your laptop is crying. 💻💦' },
    ],
  },
  {
    q: 'If I offered you a digital cookie, would you accept?',
    options: [
      { t: 'Yes! 🍪', r: '🍪 Here! Freshly rendered. Definitely not tracking you.' },
      { t: 'No thanks', r: 'Suspicious. Smart. I like you.' },
    ],
  },
  {
    q: 'Quick! Python or C++?',
    options: [
      { t: 'Python 🐍', r: 'Clean. Elegant. Reads like poetry. Good choice.' },
      { t: 'C++ ⚡', r: 'Hardcore! You enjoy pain and manual memory management.' },
      { t: 'Both', r: 'A true engineer. Abhishek approves. ✅' },
    ],
  },
  {
    q: 'Should Abhishek be hired?',
    options: [
      { t: 'ABSOLUTELY', r: 'Correct answer! Transmitting offer letter vibes… 📨', do: 'confetti' },
      { t: "He's mid", r: 'Bold. Wrong, but bold. The council disagrees. 🤖⚖️', do: 'confetti' },
    ],
  },
  {
    q: 'Wanna play my favorite game? I hid it somewhere on this page…',
    options: [
      { t: 'Launch it! 🎮', r: 'JACKING YOU IN. Mind the lava!!', do: 'game' },
      { t: 'Where is it?', r: 'Hint: the hero photo. Click it. Five times. 👀', do: 'goto-home' },
    ],
  },
  {
    q: 'This site has SIX seasonal moods. Feeling lucky?',
    options: [
      { t: 'Shuffle the vibe 🎲', r: 'Vibes: SHIFTED. Looking fresh! ✨', do: 'theme' },
      { t: 'PARTY TIME 🪩', r: 'DISCO PROTOCOL ENGAGED. DANCE, HUMAN.', do: 'party' },
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
    if (kind === 'game') setTimeout(openGame, 700);
    if (kind === 'theme') {
      cycleTheme();
      window.dispatchEvent(new CustomEvent('nlanding:toast', { detail: { message: '🎲 Glitch shuffled the vibe' } }));
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
        typeTimer = setTimeout(step, 22);
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

  function addBtn(label, cls, fn) {
    const b = document.createElement('button');
    b.className = `px-3 py-1.5 rounded-lg text-xs font-body font-bold tracking-wide border transition-all hover:-translate-y-0.5 ${cls}`;
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
    addBtn('Tell me a joke 😂', 'bg-purple-900/40 border-purple-500/60 hover:bg-purple-800/60', () => {
      type(jokes[Math.floor(Math.random() * jokes.length)], showFollowups);
    });
    addBtn('Ask another 🎲', 'bg-green-900/40 border-green-500/60 hover:bg-green-800/60', askRandom);
    addBtn('Show commands ⌨️', 'bg-gray-800 border-gray-600 hover:bg-gray-700', () => {
      doAction('palette');
    });
    addBtn('Bye! 👋', 'bg-red-900/40 border-red-500/60 hover:bg-red-800/60', minimize);
  }

  function askRandom() {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    type(topic.q, () => {
      options.innerHTML = '';
      topic.options.forEach((opt) => {
        addBtn(
          opt.t,
          'bg-gray-800 border-gray-600 hover:bg-[var(--primary)] hover:text-black hover:border-transparent',
          () => {
            if (opt.do) doAction(opt.do);
            type(opt.r, showFollowups);
          }
        );
      });
    });
  }

  function startChat() {
    const g = greeted ? 'Back for more? Excellent. I have infinite questions.' : greetings[Math.floor(Math.random() * greetings.length)];
    greeted = true;
    type(g, () => {
      options.innerHTML = '';
      addBtn("Let's chat! 💬", 'bg-gray-800 border-gray-600 hover:bg-[var(--primary)] hover:text-black hover:border-transparent', askRandom);
      addBtn('Just passing by 👋', 'bg-gray-800 border-gray-600 hover:bg-gray-700', minimize);
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
      new CustomEvent('nlanding:toast', { detail: { message: 'Psst — Glitch the robot wants to chat 🤖 (bottom-right)' } })
    );
  }, 22000);
}
