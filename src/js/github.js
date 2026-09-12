// Live ★ counts + language tags for project cards, cached for an hour.
// Fails silently (offline / rate-limited) — the page never depends on it.

const TTL = 1000 * 60 * 60;

function cacheGet(repo) {
  try {
    const raw = sessionStorage.getItem(`nlanding-gh-${repo}`);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < TTL ? data : null;
  } catch {
    return null;
  }
}

function cacheSet(repo, data) {
  try {
    sessionStorage.setItem(`nlanding-gh-${repo}`, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

export function initGithubStars() {
  const cards = document.querySelectorAll('.project-card[data-repo]');
  if (!cards.length) return;

  cards.forEach(async (card) => {
    const repo = card.dataset.repo;
    const starEl = card.querySelector('.star-count');
    const langEl = card.querySelector('.repo-lang');
    try {
      let data = cacheGet(repo);
      if (!data) {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) throw new Error(`gh ${res.status}`);
        data = await res.json();
        cacheSet(repo, data);
      }
      if (starEl && typeof data.stargazers_count === 'number') {
        starEl.innerHTML = `<i class="fas fa-star text-yellow-300"></i> ${data.stargazers_count}`;
        starEl.classList.remove('opacity-40');
      }
      if (langEl && data.language) {
        langEl.textContent = data.language;
        langEl.classList.remove('hidden');
      }
    } catch {
      if (starEl) starEl.innerHTML = '<i class="fas fa-star"></i> —';
    }
  });
}
