// ↑↑↓↓←→←→BA — the sacred cheat code. Progress dots optional.

const SEQ = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
];

export function initKonami(onTrigger) {
  let i = 0;
  const dots = document.getElementById('konami-progress');

  function paint() {
    if (!dots) return;
    dots.textContent = SEQ.map((_, idx) => (idx < i ? '▓' : '░')).join('');
  }
  paint();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
    // Don't steal typing from inputs (except single globally-safe case).
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    i = key === SEQ[i] ? i + 1 : key === SEQ[0] ? 1 : 0;
    paint();
    if (i === SEQ.length) {
      i = 0;
      paint();
      onTrigger?.();
    }
  });
}
