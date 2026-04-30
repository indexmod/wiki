// =========================================================
// VIEW: INDEX
// ROLE: format pages list into HTML fragment
// =========================================================

function formatTitle(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function viewIndex(pages = []) {
  if (!pages.length) {
    return `<div class="empty">No pages</div>`;
  }

  return `
<div class="index-wrap">

  ${pages.map(p => `
    <a class="index-item" href="/${p.name}">
      ${formatTitle(p.name)}
    </a>
  `).join("")}

</div>
`;
}
