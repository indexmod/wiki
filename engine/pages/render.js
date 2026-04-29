// ===============================
// ENGINE: PAGES
// FILE: render.js
// PURPOSE: markdown page renderer
// ===============================


/* ===============================
   SIMPLE SANITIZER (LIGHTWEIGHT)
=============================== */

function safeText(value) {
  if (!value) return "";

  return String(value)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* ===============================
   RENDER PAGES
=============================== */

export function renderPage(page) {

  const title = safeText(page?.title) || "Untitled page";
  const content = page?.content || "";

  return `
<!-- ===============================
     PAGE ENGINE START
     =============================== -->

<article class="page-wrap">

  <header class="page-header">
    <h1 class="page-title">${title}</h1>
  </header>

  <div class="page-content">
    ${content}
  </div>

</article>

<!-- ===============================
     PAGE ENGINE END
     =============================== -->
`;
}
