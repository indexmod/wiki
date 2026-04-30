// =========================================================
// VIEW: PAGE
// ROLE: format page content (markdown already rendered OR raw safe HTML)
// =========================================================

export function viewPage(page) {
  if (!page) {
    return `<article class="page"><h1>Not Found</h1></article>`;
  }

  return `
<article class="page">

  <header class="page-header">
    <h1>${page.title || "Untitled"}</h1>
  </header>

  <section class="page-content">
    ${page.content || ""}
  </section>

</article>
`;
}
