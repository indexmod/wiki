// =========================================================
// VIEW: INDEX
// ROLE: render list of pages
// =========================================================

export function indexView(pages) {
  return `
<div class="index-wrap">
  ${pages.map(p => `
    <a href="/${p}" class="index-item">
      ${p.replace(/-/g, " ")}
    </a>
  `).join("")}
</div>
`;
}
