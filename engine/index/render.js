// ===============================
// ENGINE: INDEX
// FILE: render.js
// PURPOSE: index UI with nav + A-Z sections
// ===============================

import { groupPages } from "./state.js";

export function renderIndex(pages = []) {
  const groups = groupPages(pages);

  // ================= NAV (TOPICS)
  const nav = `
<div class="index-nav">
  ${groups.map(g => `
    <a href="#section-${g.letter}" class="index-nav-link">
      ${g.letter}
    </a>
  `).join("")}
</div>
`;

  // ================= SECTIONS
  const sections = `
<div class="index-sections">
  ${groups.map(g => `
    <section id="section-${g.letter}" class="index-section">

      <div class="index-letter">
        ${g.letter}
      </div>

      <div class="index-list">
        ${g.items.map(p => `
          <a href="/${p}" class="index-item">
            ${p}
          </a>
        `).join("")}
      </div>

    </section>
  `).join("")}
</div>
`;

  return `
<link rel="stylesheet" href="/styles/index.css">

<div class="index-wrap" data-engine="index">
  ${nav}
  ${sections}
</div>
`;
}
