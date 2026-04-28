export function renderIndex(pages = []) {
  const safe = Array.isArray(pages) ? pages : [];

  safe.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  const groups = {};

  for (const p of safe) {
    const letter = ((p.title || "")[0] || "#").toUpperCase();

    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  }

  const letters = Object.keys(groups).sort();

  return `
    <div class="index-grid">
      ${letters.map(letter => `
        <section class="section">

          <div class="section-letter">${letter}</div>

          ${groups[letter].map(p => `
            <div class="topic-title">
              <a href="/${p.slug}">${p.title}</a>
            </div>
          `).join("")}

        </section>
      `).join("")}
    </div>
  `;
}
