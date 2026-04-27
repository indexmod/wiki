async function load() {
  const res = await fetch("/api/pages");
  const pages = await res.json();

  const grid = document.getElementById("grid");

  // =========================
  // GROUPS INIT (ОБЯЗАТЕЛЬНО)
  // =========================
  const groups = {};

  // =========================
  // NORMALIZE
  // =========================
  pages.forEach(p => {
    const title = (p.title && p.title.trim()) ? p.title : p.slug;
    const letter = (title[0] || "#").toUpperCase();

    if (!groups[letter]) groups[letter] = [];

    groups[letter].push({
      slug: p.slug,
      title
    });
  });

  // =========================
  // RENDER
  // =========================
  grid.innerHTML = Object.keys(groups)
    .sort()
    .map(letter => `
      <div>
        <div class="letter">${letter}</div>

        ${groups[letter].map(p => `
          <div class="page">
            <a href="/view.html?slug=${p.slug}">
              ${p.title}
            </a>
          </div>
        `).join("")}
      </div>
    `).join("");
}

load();
