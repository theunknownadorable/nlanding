// Custom neon cursor (dot + trailing ring). Desktop fine-pointers only,
// and never when the user prefers reduced motion.

export function initCursor() {
  const fine = matchMedia('(pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('has-cursor');

  let mx = -100, my = -100, rx = -100, ry = -100;
  let visible = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });
  document.addEventListener('mouseleave', () => {
    visible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  const interactive = 'a, button, input, .chip, [data-tilt], .project-card, #reflex-box';
  document.addEventListener('mouseover', (e) => {
    ring.classList.toggle('grow', !!e.target.closest(interactive));
  });

  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    const half = ring.classList.contains('grow') ? 29 : 19;
    ring.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
    requestAnimationFrame(follow);
  })();
}
