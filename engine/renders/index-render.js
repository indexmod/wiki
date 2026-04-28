export function renderIndex(pages = []) {

  if (!pages.length) {
    return "<h2>No pages</h2>";
  }

  pages.sort((a, b) =>
    (a.title || "").localeCompare(b.title || "")
  );

  const groups = {};

  for (const p of pages) {
    const title = p.title || p.slug;
    const letter = title[0]?.toUpperCase() || "#";

    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  }

  const letters = Object.keys(groups).sort();

  return `
    <div class="index-grid">
      ${letters.map(letter => `
        <div class="section">

          <div class="section-letter">${letter}</div>

          ${groups[letter].map(p => `
            <div class="topic-title">
              <a href="/${p.slug}">${p.title}</a>
            </div>
          `).join("")}

        </div>
      `).join("")}
    </div>
  `;
}
