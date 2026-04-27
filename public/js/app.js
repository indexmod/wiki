/// FILE: app.js

// =========================
// LOAD ALL PAGES (ID-FIRST)
// =========================
async function load() {
  const res = await fetch("/api/pages");
  const pages = await res.json();

  const grid = document.getElementById("grid");

  if (!grid) {
    console.error("GRID NOT FOUND");
    return;
  }

  // =========================
  // NORMALIZE (ID IS PRIMARY)
  // =========================
  const items = pages.map(p => {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title || p.id,

      letter: (p.title?.trim()?.[0] || "#").toUpperCase()
    };
  });

  // =========================
  // SORT (stable title sort)
  // =========================
  items.sort((a, b) =>
    (a.title || "")
      .toLowerCase()
      .localeCompare((b.title || "").toLowerCase())
  );

  // =========================
  // GROUP BY LETTER
  // =========================
  const groups = {};

  for (const p of items) {
    const letter = p.letter;

    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  }

  // =========================
  // RENDER (ID ROUTING FIXED)
  // =========================
  grid.innerHTML = Object.keys(groups)
    .sort()
    .map(letter => {
      return `
        <div class="group">
          <div class="letter">${letter}</div>

          ${groups[letter]
            .map(p => {
              return `
                <div class="item">
                  <!-- IMPORTANT: ID is navigation key -->
                  <a href="/view.html?id=${p.id}">
                    ${escapeHtml(p.title)}
                  </a>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    })
    .join("");
}

// =========================
// SAFE HTML
// =========================
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

load();
