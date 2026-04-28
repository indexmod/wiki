// ================= MARKDOWN =================
export function render(md = "") {
  let html = String(md);

  html = html.replace(/^### (.*)$/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gim, "<h1>$1</h1>");

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    `<a href="$2">$1</a>`
  );

  html = html.replace(/^\* (.*)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");

  html = html.replace(/\n{2,}/g, "</p><p>");

  return html;
}


// ================= INDEX RENDER (FIXED STRUCTURE) =================
export function renderIndex(pages = []) {

  if (!Array.isArray(pages)) pages = [];

  // 1. фильтр мусора + index
  pages = pages.filter(p => p && p.slug && p.title && p.slug !== "index");

  // 2. сортировка
  pages.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  // 3. группировка
  const groups = {};

  for (const p of pages) {

    const title = (p.title || "").trim();
    const letter = title.length ? title[0].toUpperCase() : "#";

    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  }

  const letters = Object.keys(groups).sort();

  // 4. render
  return `
    <div class="index-grid">

      ${letters.map(letter => `
        <div class="section">

          <div class="section-letter">
            ${letter}
          </div>

          <div class="section-body">
            ${groups[letter].map(p => `
              <div class="topic-title">
                <a href="/${p.slug}">${p.title}</a>
              </div>
            `).join("")}
          </div>

        </div>
      `).join("")}

    </div>
  `;
}
