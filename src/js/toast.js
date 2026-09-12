// Tiny toast notification system. Other modules can either import `toast`
// or dispatch `window` event `nlanding:toast` with `{ message, ms }`.

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }
  return container;
}

export function toast(message, { ms = 2600 } = {}) {
  const box = ensureContainer();
  const el = document.createElement('div');
  el.className =
    'toast glass rounded-xl px-5 py-3 text-sm font-body font-semibold tracking-wide flex items-center gap-2 max-w-[92vw]';
  el.innerHTML = `<span style="color: var(--primary)">▸</span><span></span>`;
  el.querySelector('span:last-child').textContent = message;
  box.appendChild(el);
  // Cap concurrent toasts.
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, ms);
}

export function initToasts() {
  ensureContainer();
  window.addEventListener('nlanding:toast', (e) => {
    if (e.detail?.message) toast(e.detail.message, { ms: e.detail.ms ?? 2600 });
  });
}
