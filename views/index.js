export function indexView(pages) {
  return `
<div class="index-wrap">
  ${pages.map(p => `
    <a class="index-item" href="/${p.name}">
      ${p.name}
    </a>
  `).join("")}
</div>
`;
}
