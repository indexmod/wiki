async function load() {
  const [pagesRes, topicsRes] = await Promise.all([
    fetch("/api/pages"),
    fetch("/topics.txt")
  ]);

  const pages = await pagesRes.json();
  const topicsText = await topicsRes.text();

  const grid = document.getElementById("grid");

  // множество существующих
  const existingSet = new Set(pages.map(p => p.slug));

  // реальные страницы
  const real = pages.map(p => ({
    slug: p.slug,
    title: p.title || p.slug,
    exists: true
  }));

  // только отсутствующие темы
  const missing = topicsText
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean)
    .filter(slug => !existingSet.has(slug))
    .map(slug => ({
      slug,
      title: slug,
      exists: false
    }));

  const all = [...real, ...missing];

  // сортировка
  all.sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  // группировка
  const groups = {};
  all.forEach(p => {
    const letter = p.title[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  });

  // рендер
  grid.innerHTML = Object.keys(groups).sort().map(letter => `
    <div>
      <div class="letter">${letter}</div>

      ${groups[letter].map(p => `
        <div class="page">
          ${
            p.exists
              ? `<a class="exists" href="/view.html?slug=${p.slug}">${p.title}</a>`
              : `<a class="missing" href="/editor.html?slug=${p.slug}">${p.title}</a>`
          }
        </div>
      `).join("")}
    </div>
  `).join("");
}

load();
