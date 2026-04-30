// =========================================================
// ENGINE STATE: PAGES ROUTE
//
// STATUS:
// ✔ unified layout contract (ALWAYS used)
// ✔ strict data normalization layer added
// ✔ safe markdown → HTML transformation
// ✔ no raw HTML returned outside layout
// ✔ stable slug → storage mapping
// ✔ resilient against schema drift (string/object)
// ✔ consistent index → page → editor flow
//
// ARCHITECTURAL ROLE:
// DATA (R2) → NORMALIZE → MARKDOWN → LAYOUT → HTML
//
// CONTRACT:
// - input: slug
// - output: full HTML via layout()
// - never returns raw HTML
// =========================================================

import { renderMarkdown } from "../core/markdown.js";
import { layout } from "./layout.js";


// ===============================
// DATA NORMALIZER (CRITICAL SAFETY LAYER)
// ===============================
function normalizePage(page) {
  if (!page) return null;

  // case: raw markdown string in storage
  if (typeof page === "string") {
    return {
      title: "Untitled",
      content: page
    };
  }

  // case: structured object
  return {
    title: page.title || "Untitled",
    content: page.content || ""
  };
}


// ===============================
// ROUTE: PAGE
// ===============================
export async function pageRoute(env, slug) {
  const raw = await env.PAGES.get(slug);

  const page = normalizePage(raw);

  // not found → still goes through layout (IMPORTANT)
  if (!page) {
    return layout(env, {
      title: "Not Found",
      content: `<article class="page"><h1>404</h1><p>Page not found</p></article>`,
      layout: "page"
    });
  }

  const html = renderMarkdown(page.content);

  return layout(env, {
    title: page.title,
    content: html,
    layout: "page"
  });
}
