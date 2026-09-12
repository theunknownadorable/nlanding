// Scroll reveals, animated counters, and skill-bar fills.

function animateCounter(el) {
  const target = parseFloat(el.dataset.target || '0');
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function initReveal() {
  // Stagger delays via data-delay.
  document.querySelectorAll('[data-delay]').forEach((el) => {
    el.style.transitionDelay = `${el.dataset.delay}ms`;
  });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.counter[data-target]').forEach((el) =>
    counterObs.observe(el)
  );

  const barObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          requestAnimationFrame(() => {
            fill.style.width = `${fill.dataset.level}%`;
          });
          barObs.unobserve(fill);
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('.skill-fill[data-level]').forEach((el) =>
    barObs.observe(el)
  );
}
