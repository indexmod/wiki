// ===============================
// ENGINE: PAGES
// FILE: render.js
// PURPOSE: render markdown page into HTML fragment
//
// CONTRACT:
// - receives page object { title, content }
// - converts markdown → HTML
// - returns inner HTML (no layout)
// ===============================

import { marked } from "marked";


/* ===============================
   SIMPLE SANITIZER (TITLE ONLY)
=============================== */

function safeText(value) {
  if (!value) return "";

  return String(value)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* ===============================
   RENDER PAGE
=============================== */

export function renderPage(page) {

  const title = safeText(page?.title) || "Untitled page";

  // 🔥 markdown → HTML
  const content = marked.parse(page?.content || "");

  return `
<article class="page">

  <header class="page-header">
    <h1 class="page-title">${title}</h1>
  </header>

  <section class="page-content">
    ${content}
  </section>

</article>
`;
}
