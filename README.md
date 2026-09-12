# nlanding ⚡

**Abhishek S. — AI/ML × Playful Engineer.** A neon-soaked, aggressively interactive
landing page (v2), inspired by [`theunknownadorable/portfolio`](https://github.com/theunknownadorable/portfolio).

Built with **Vite + Tailwind CSS** — no framework, just small ES modules and canvas magic.

## ✨ What's inside

- 🌌 **Living neural-net background** — nodes flinch from your cursor, pulses travel the synapses, comets streak by
- 📅 **Seasonal theme engine** — Cyberpunk / Frost / Bloom / Solar / Harvest / Spooky, auto-detected by date, manually switchable, persisted
- ⌨️ **Ctrl+K command palette** — teleport anywhere, switch themes, launch toys
- 💻 **Fake terminal** — `help`, `game`, `party`, `theme spooky`, `sudo hire abhishek`…
- 👾 **NEURAL JUMP 2.0** — a secret 2-level canvas platformer (tap the hero photo 5×)
- 🤖 **Glitch 2.0** — the resident robot. Chats, jokes, judges, launches games
- ⚡ **Reflex tester** with local best time · 🪩 **Konami code party mode** · 🎊 confetti engine
- ★ **Live GitHub stats** on project cards · custom neon cursor · scroll reveals · tilt cards
- 👻 A **404 page** with a robot that watches your cursor (touch its eyes, I dare you)

## 🚀 Quickstart

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build
```

## 📁 Structure

```
├── index.html            # the whole page
├── public/
│   ├── abhi.jpg / mona.jpg
│   ├── favicon.svg
│   └── 404.html          # standalone neon 404 (copied to dist)
├── src/
│   ├── main.js           # boot sequence + cross-module wiring
│   ├── style.css         # tailwind + design system
│   └── js/               # one module per feature
│       ├── theme.js      # seasonal themes + party mode
│       ├── background.js # neural canvas
│       ├── game.js       # Neural Jump 2.0
│       ├── terminal.js   # fake shell
│       ├── palette.js    # ctrl+k commands
│       ├── npc.js        # Glitch the robot
│       ├── confetti.js toast.js cursor.js reveal.js
│       ├── nav.js tilt.js typewriter.js reflex.js
│       └── konami.js github.js
└── .github/workflows/deploy.yml  # auto-deploy to GitHub Pages
```

## 🌍 Deploy

Push to `main` — the workflow builds and deploys to **GitHub Pages** automatically.
(Repo Settings → Pages → Source: *GitHub Actions*.)
`vite.config.js` uses `base: './'` so the build works from any sub-path.

---

*v2.0 — forged with caffeine & curiosity.* ☕
