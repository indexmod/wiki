async function load() {
  const [pagesRes, topicsRes] = await Promise.all([
    fetch("/api/pages"),
    fetch("/topics.txt")
  ]);

  const pages = await pagesRes.json();
  const topicsText = await topicsRes.text();

  const grid = document.getElementById("grid");

  // =========================
  // ✔ ЕДИНОЕ МНОЖЕСТВО СЛАГОВ
  // =========================
  const existingSet = new Set(
    pages.map(p => smartSlug(p.slug))
  );

  // =========================
  // ✔ РЕАЛЬНЫЕ СТРАНИЦЫ
  // =========================
  const real = pages.map(p => ({
    slug: smartSlug(p.slug),
    title: (p.title && p.title.trim())
      ? p.title
      : autoTitle(p.slug),
    exists: true
  }));

  // =========================
  // ✔ TOPICS (RAW → DISPLAY SAFE)
  // =========================
  const topics = topicsText
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean);

  // =========================
  // ✔ ТОЛЬКО НЕСУЩЕСТВУЮЩИЕ
  // =========================
  const missing = topics
    .map(raw => ({
      slug: smartSlug(raw),
      title: raw,
      exists: false
    }))
    .filter(p => !existingSet.has(p.slug));

  const all = [...real, ...missing];

  // =========================
  // SORT
  // =========================
  all.sort((a, b) =>
    (a.title || "")
      .toLowerCase()
      .localeCompare((b.title || "").toLowerCase())
  );

  // =========================
  // GROUP
  // =========================
  const groups = {};
  all.forEach(p => {
    const letter = (p.title?.[0] || "").toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  });

  // =========================
  // RENDER
  // =========================
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
