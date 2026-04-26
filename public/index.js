async function load() {
  const [pagesRes, topicsRes] = await Promise.all([
    fetch("/api/pages"),
    fetch("/api/topics") // 🔥 ВАЖНО: теперь API
  ]);

  const pages = await pagesRes.json();
  const topicsText = await topicsRes.text();

  const grid = document.getElementById("grid");

  // =========================
  // ✔ SLUG МНОЖЕСТВО (ЕДИНОЕ)
  // =========================
  const existingSet = new Set(
    pages.map(p => smartSlug(p.slug))
  );

  // =========================
  // ✔ REAL PAGES
  // =========================
  const real = pages.map(p => {
    const slug = smartSlug(p.slug);

    return {
      slug,
      title: (p.title && p.title.trim())
        ? p.title
        : autoTitle(slug), // 🔥 авто-тайтл
      exists: true
    };
  });

  // =========================
  // ✔ TOPICS RAW
  // =========================
  const topics = topicsText
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean);

  // =========================
  // ✔ MISSING (без дублей)
  // =========================
  const missing = [];

  const seen = new Set(); // 🔥 защита от дублей внутри topics

  topics.forEach(raw => {
    const slug = smartSlug(raw);

    if (!slug) return;

    // уже есть как страница → пропускаем
    if (existingSet.has(slug)) return;

    // уже добавляли → пропускаем
    if (seen.has(slug)) return;

    seen.add(slug);

    missing.push({
      slug,
      title: raw, // 🔥 сохраняем оригинальный текст
      exists: false
    });
  });

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
    const letter = (p.title?.[0] || "#").toUpperCase();

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
              : `<a class="missing" href="/editor.html?slug=${p.slug}&title=${encodeURIComponent(p.title)}">${p.title}</a>`
          }
        </div>
      `).join("")}
    </div>
  `).join("");
}

load();
