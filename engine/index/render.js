// ===============================
// ENGINE: INDEX
// FILE: render.js
// PURPOSE: clean index list (no nav)
// ===============================

import { groupPages } from "./state.js";

function formatTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function renderIndex(pages = []) {
  const groups = groupPages(pages);

  if (!groups.length) {
    return `<div class="empty">No pages found</div>`;
  }

  return `
<link rel="stylesheet" href="/styles/index.css">

<div class="index-wrap">

  ${groups.map(g => `
    <section class="index-section">

      <div class="index-letter">
        ${g.letter}
      </div>

      <div class="index-list">
        ${g.items.map(p => `
          <a href="/${p}" class="index-item">
            ${formatTitle(p)}
          </a>
        `).join("")}
      </div>

    </section>
  `).join("")}

</div>
`;
}
