// ===============================
// ENGINE: INDEX
// FILE: render.js
// PURPOSE: build A–Z grouped index HTML
//
// CONTRACT:
// - receives array of slugs
// - returns pure HTML fragment
// - DOES NOT include styles or layout
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
