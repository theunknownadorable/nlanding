// Reaction-time mini-game: wait for green, then smash that click.

const BEST_KEY = 'nlanding-reflex-best';

function rank(ms) {
  if (ms < 200) return 'reflexes, peer-reviewed ⚡';
  if (ms < 280) return 'tenure-track speed 🎯';
  if (ms < 380) return 'solid — duly cited ✅';
  if (ms < 550) return 'powered by decaf ☕';
  return 'asleep in the back row? 😴';
}

export function initReflex() {
  const box = document.getElementById('reflex-box');
  const label = document.getElementById('reflex-label');
  const sub = document.getElementById('reflex-sub');
  const bestEl = document.getElementById('reflex-best');
  if (!box || !label) return;

  let mode = 'idle'; // idle | arming | waiting | ready | done
  let timer = null;
  let t0 = 0;
  let best = null;
  try {
    best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null');
  } catch {
    /* ignore */
  }
  const paintBest = () => {
    if (bestEl) bestEl.textContent = best ? `${best} ms` : '—';
  };
  paintBest();

  function setBox(cls, text, subtext) {
    box.classList.remove('waiting', 'ready');
    if (cls) box.classList.add(cls);
    label.textContent = text;
    if (sub) sub.textContent = subtext || '';
  }

  function arm() {
    clearTimeout(timer);
    mode = 'waiting';
    setBox('waiting', 'wait for green…', 'click too early and you lose');
    timer = setTimeout(() => {
      mode = 'ready';
      t0 = performance.now();
      setBox('ready', 'CLICK!', 'now now now');
    }, 1200 + Math.random() * 3200);
  }

  box.addEventListener('click', () => {
    if (mode === 'idle' || mode === 'done' || mode === 'early') {
      arm();
    } else if (mode === 'waiting') {
      clearTimeout(timer);
      mode = 'early';
      setBox('', 'TOO SOON! 🐢', 'click to try again');
    } else if (mode === 'ready') {
      const ms = Math.round(performance.now() - t0);
      mode = 'done';
      const isBest = best === null || ms < best;
      if (isBest) {
        best = ms;
        try {
          localStorage.setItem(BEST_KEY, JSON.stringify(ms));
        } catch {
          /* ignore */
        }
        paintBest();
      }
      setBox('', `${ms} ms — ${rank(ms)}`, `best ${best} ms · click to retry${isBest ? ' · NEW BEST!' : ''}`);
      if (ms < 230) {
        window.dispatchEvent(new CustomEvent('nlanding:confetti', { detail: { n: 70 } }));
      }
      if (isBest) {
        window.dispatchEvent(
          new CustomEvent('nlanding:toast', { detail: { message: `⚡ New reflex best: ${ms} ms!` } })
        );
      }
    }
  });
}
