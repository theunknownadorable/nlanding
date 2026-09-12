# nlanding 🎓

**Abhishek S. — Assistant Professor, Computer Science & Engineering @ TKM Institute of Technology.**

A light-first, aggressively interactive academic landing page (**v2.1 · “professor era”**): laid paper,
fountain-pen ink, six scholarly moods, a fluid canvas that parts around your cursor, and a secret
chalkboard game called **Grade Rush**.

Built with **Vite + Tailwind CSS** — no framework, just small ES modules. Set in **Fraunces** (display),
**Inter** (body) and **JetBrains Mono** (everything typeset).

---

## ✨ What's inside

- 📖 **Six academic moods** — Scholar (light), Blackboard, Ivy, Meridian, Archive, Convocation. Auto-detected
  from the academic calendar, manually switchable, persisted in `localStorage`, plus a Konami **party mode**
  that cycles hue across the whole page.
- 🌊 **Fluid canvas background** — five drifting radial-gradient ink blobs in the current mood's colours,
  repelled by the cursor; a fading particle wake trails the pointer; clicks send out rings (links, buttons and
  inputs are politely ignored); thin dust floats throughout. Reduced-motion visitors get a single static frame.
- 🏛️ **Academia section** — appointment card (Assistant Professor, CSE, TKMIT) with a link to the
  [department page](https://tkmit.ac.in/wp_department/computer-science-engineering/), a **For Students**
  office-hours card, and research-interest chips.
- 🎓 **GRADE RUSH** — the secret 480×300 chalkboard game. Slide a mortarboard, catch `A+` (+10), `★` (+25) and
  `☕` (+15), dodge `F` papers and `⏰` deadlines. Three 🍎, sixty seconds, best score saved, ranks up to
  **Tenure Material**.
- 🖼️ **Polaroid hero** — taped to the page, tilted, captioned. Tap it five times for Grade Rush.
- ⌨️ **Ctrl+K command palette** — teleport, switch moods, open the TKMIT department page, launch the game.
- 💻 **Faculty terminal** — always dark, in every mood. `help`, `tkmit`, `academia`, `officehours`, `rush`,
  `theme blackboard`, `sudo grant tenure`, `sudo hire abhishek`, `vim`…
- 🤖 **Glitch, the TA-bot** — chats, tells departmental jokes, runs pop quizzes, launches games.
- ⚡ **Reflex tester** with a local best · 🪩 **Konami party mode** · 🎊 confetti engine · toasts
- ★ **Live GitHub stars** on project cards · custom cursor · scroll reveals · tilt cards
- 📄 **“Off the Syllabus” 404** — a marked paper with an eye-tracking TA-bot that ushers you home

---

## 🎨 The six moods

| Mood | Paper / board | Primary | Secondary | Mode | Auto-detected |
| --- | --- | --- | --- | --- | --- |
| 📖 **Scholar** | `#f6f2e9` laid paper | `#1d4ed8` faculty blue | `#b45309` leather amber | light | Sep – Oct (new academic year) |
| ✏️ **Blackboard** | `#1e2f27` slate green | `#f2d16b` chalk yellow | `#86b8d8` chalk blue | dark | Jun – Aug (summer school) |
| 🌿 **Ivy** | `#101f17` deep green | `#c9a227` old gold | `#7fb069` ivy leaf | dark | Mar – May |
| 🧭 **Meridian** | `#0c1a30` midnight navy | `#e0b64c` gold | `#6f9fe0` atlas blue | dark | Nov – mid Dec |
| 📜 **Archive** | `#241a12` dark sepia | `#d9a566` parchment | `#a9743f` binding brown | dark | Jan – Feb |
| 🎓 **Convocation** | `#2b0f16` ceremonial maroon | `#e3c14a` gold | `#a83a52` robe maroon | dark | mid Dec – 5 Jan |

Everything else — soft/faint ink, hairlines, card surfaces, tints, the navbar wash — is **derived** from those
four values in `src/js/theme.js`, so the moods stay consistent instead of being hand-tuned one by one.

Two surfaces deliberately never follow the mood, because they are props rather than chrome: **the terminal**
and **the Grade Rush chalkboard**. Both stay dark.

---

## 🚀 Quickstart

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build
```

### Deploying

**Vercel** (what this site uses): framework preset **Vite**, build command `npm run build`, output directory
`dist`. Every push to `main` redeploys automatically.

`vite.config.js` sets `base: './'`, so the built site also works from a sub-path — which is what the bundled
GitHub Pages workflow (`.github/workflows/deploy.yml`) expects. That workflow needs **Settings → Pages →
Source: GitHub Actions** enabled before its deploy step will succeed.

---

## 📁 Structure

```
├── index.html            # the whole page
├── public/
│   ├── abhi.jpg          # the polaroid
│   ├── favicon.svg       # mortarboard
│   └── 404.html          # standalone "Off the Syllabus" page (copied to dist)
├── src/
│   ├── main.js           # boot sequence + cross-module wiring
│   ├── style.css         # tailwind + the v2.1 design system
│   └── js/               # one module per feature
│       ├── theme.js      # six moods, derivation, season, party mode
│       ├── background.js # fluid blobs, cursor wake, click ripples, dust
│       ├── grade-rush.js # the secret chalkboard game
│       ├── terminal.js   # faculty shell
│       ├── palette.js    # Ctrl+K
│       ├── npc.js        # Glitch the TA-bot
│       ├── reflex.js  konami.js  confetti.js  toast.js
│       ├── cursor.js  reveal.js  tilt.js  nav.js  typewriter.js
│       └── github.js     # live ★ counts (fails silently offline)
├── tailwind.config.js    # Fraunces / Inter / JetBrains Mono
└── vite.config.js
```

---

## 🎓 Grade Rush

| Catch | Points | | Dodge | Cost |
| --- | --- | --- | --- | --- |
| `A+` | +10 | | `F` paper | −1 🍎 |
| `★` | +25 | | `⏰` deadline | −1 🍎 |
| `☕` | +15 | | | |

Three ways in: **tap the polaroid 5×**, **Ctrl+K → “Launch GRADE RUSH”**, or type **`rush`** in the terminal.
Controls: mouse / drag on the board, or `←` `→` / `A` `D`. The board gets busier as the term runs down.

| Score | Rank |
| --- | --- |
| 900+ | **Tenure Material** |
| 650+ | Chair's Shortlist |
| 450+ | Summa Cum Laude |
| 300+ | Dean's List |
| 180+ | Passable. Barely. |
| 90+ | Audit Candidate |
| below | See Me After Class |

Best score persists in `localStorage` (`nlanding-graderush-best`); the reflex best uses
`nlanding-reflex-best`, and your chosen mood uses `nlanding-theme`.

---

## ♿ Accessibility & motion

- `prefers-reduced-motion` disables the background animation loop (one static frame instead), the marquee,
  floaty/spin animations, scroll-reveal transforms, and the 404's countdown animation.
- The custom cursor only activates on fine pointers and never under reduced motion.
- Cards and links keep visible `:focus-visible` rings; the palette, terminal and game are all keyboard-driven.
- Contrast: Scholar is ink `#1c2433` on paper `#f6f2e9`; button text flips to dark in the dark moods, where
  the primaries are bright golds and chalks.

---

## 🔁 v2.0 → v2.1

| | v2.0 “neon” | v2.1 “professor era” |
| --- | --- | --- |
| Look | Cyberpunk dark, Orbitron/Rajdhani | Light-first paper, Fraunces/Inter |
| Moods | 6 seasonal neon themes | 6 academic moods (1 light, 5 dark) |
| Background | Neural net: nodes, pulses, comets | Fluid ink blobs, cursor wake, ripples, dust |
| Identity | AI/ML student @ TKMCE | Assistant Professor @ TKMIT |
| Sections | 6 | 7 — new **Academia** |
| Secret game | NEURAL JUMP 2.0 platformer | **GRADE RUSH** chalkboard catcher |
| Terminal | `sudo hire abhishek` | + `tkmit`, `academia`, `sudo grant tenure` |
| 404 | “Lost in the Neural Net” | “Off the Syllabus” |

Carried over and restyled: the command palette, Glitch (now a TA-bot), confetti, toasts, the custom cursor,
the reflex tester, live GitHub stars, tilt cards, scroll reveals and the Konami code.

---

Made with caffeine, chalk dust and curiosity. © Abhishek S.
