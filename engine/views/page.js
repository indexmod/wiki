// =========================================================
// VIEW: PAGE
// ROLE: render single page
// =========================================================

export function pageView(title, content) {
  return `
<article class="page">
  <h1>${title}</h1>
  <div class="page-content">
    ${content}
  </div>
</article>
`;
}
