// ===============================
// ENGINE: PAGE
// FILE: render.js
// PURPOSE: markdown page renderer
// ===============================

export function renderPage(page) {
  return `
<!-- PAGE ENGINE START -->

<article class="page-wrap">

  <h1>${page.title || "UNTITLED PAGE"}</h1>

  <div class="page-content">
    ${page.content || ""}
  </div>

</article>

<!-- PAGE ENGINE END -->
`;
}
