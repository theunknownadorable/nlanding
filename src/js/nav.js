// Navbar: mobile menu, active-section highlight, scroll progress,
// back-to-top, and navbar blur on scroll.

export function initNav() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!open));
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active link highlighting.
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  const linkObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((s) => linkObs.observe(s));

  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');
  const navbar = document.getElementById('navbar');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    if (toTop) toTop.classList.toggle('show', y > 650);
    // The navbar wash is driven by --nav-bg / --nav-bg-scrolled in CSS, so it
    // follows the mood (light Scholar → dark Blackboard) instead of being
    // hard-coded to one colour.
    if (navbar) navbar.classList.toggle('scrolled', y > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
}
