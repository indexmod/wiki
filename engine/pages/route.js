// =========================================================
// ENGINE STATE: PAGES ROUTE
// STATUS:
// ✔ unified string contract (NO Response return)
// ✔ stable slug normalization alignment with API
// ✔ safe fallback rendering
// ✔ index → page navigation stabilized
// ✔ editor hook ready (nav placeholder)
//
// NOTES:
// - MUST always return STRING HTML
// - NEVER return Response from this layer
// - layout layer owns HTML shell
// =========================================================

import { layout } from "./layout.js";
import { renderPage } from "./render.js";
import { getPage } from "./api.js";


// ===============================
// SLUG NORMALIZER (SOURCE ALIGNMENT)
// must match API layer exactly
// ===============================
function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") return null;

  return slug
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/g, "");
}


// ===============================
// PAGE ROUTE
// ===============================
export async function pageRoute(env, slug) {
  try {

    const cleanSlug = normalizeSlug(slug);

    if (!cleanSlug) {
      return `<h1>INVALID PAGE</h1>`;
    }

    const page = await getPage(env, cleanSlug);

    // ===============================
    // NOT FOUND STATE
    // ===============================
    if (!page) {
      return `
        <div class="page-wrap">
          <h1>PAGE NOT FOUND</h1>
          <a href="/" class="ui-link">Back to index</a>
        </div>
      `;
    }

    const tpl = await layout(env);
    const content = renderPage(page);

    // ===============================
    // NAV CONTRACT (future editor hook)
    // ===============================
    const nav = `
      <a href="/" class="ui-link">Index</a>
      <a href="/editor/${cleanSlug}" class="ui-link">Edit</a>
    `;

    // ===============================
    // BUILD PAGE
    // ===============================
    return tpl
      .replaceAll("{{title}}", page.title || cleanSlug)
      .replaceAll("{{layout}}", "page")
      .replaceAll("{{nav}}", nav)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[PAGE ROUTE ERROR]", e);

    return `
      <div class="page-wrap">
        <h1>PAGE ENGINE ERROR</h1>
        <pre>${e?.message || e}</pre>
        <a href="/" class="ui-link">Back</a>
      </div>
    `;
  }
}
