// Hero rotating-role typewriter with realistic delete + pause rhythm.

export function initTypewriter(el, phrases, { typeMs = 55, deleteMs = 28, holdMs = 1700 } = {}) {
  if (!el || !phrases?.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    el.textContent = phrases[0];
    return;
  }
  let pi = 0, ci = 0, deleting = false;

  function step() {
    const word = phrases[pi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(step, holdMs);
        return;
      }
      setTimeout(step, typeMs + Math.random() * 40);
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(step, 350);
        return;
      }
      setTimeout(step, deleteMs);
    }
  }
  step();
}
