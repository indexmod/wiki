// =========================================================
// ENGINE STATE: PAGES ROUTE
// STATUS:
// ✔ unified layout contract (ALWAYS used)
// ✔ no raw HTML returns outside layout
// ✔ safe not-found rendering inside shell
// ✔ stable slug normalization aligned with API
// ✔ consistent index → page flow restored
// =========================================================

import { layout } from "./layout.js";
import { renderPage } from "./render.js";
import { getPage } from "./api.js";


// ===============================
// SLUG NORMALIZER (MUST MATCH API)
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
      const tpl = await layout(env);

      return tpl
        .replaceAll("{{title}}", "Invalid page")
        .replaceAll("{{layout}}", "page")
        .replaceAll("{{nav}}", `<a href="/" class="ui-link">Index</a>`)
        .replaceAll("{{content}}", `<h1>INVALID PAGE</h1>`);
    }

    const page = await getPage(env, cleanSlug);

    const tpl = await layout(env);

    // ===============================
    // NOT FOUND (INSIDE LAYOUT)
    // ===============================
    if (!page) {
      const fallback = `
        <div class="page-wrap">
          <h1>PAGE NOT FOUND</h1>
          <a href="/" class="ui-link">Back to index</a>
        </div>
      `;

      return tpl
        .replaceAll("{{title}}", "Not found")
        .replaceAll("{{layout}}", "page")
        .replaceAll("{{nav}}", `<a href="/" class="ui-link">Index</a>`)
        .replaceAll("{{content}}", fallback);
    }

    // ===============================
    // NORMAL PAGE
    // ===============================
    const content = renderPage(page);

    const nav = `
      <a href="/" class="ui-link">Index</a>
      <a href="/editor/${cleanSlug}" class="ui-link">Edit</a>
    `;

    return tpl
      .replaceAll("{{title}}", page.title || cleanSlug)
      .replaceAll("{{layout}}", "page")
      .replaceAll("{{nav}}", nav)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[PAGE ROUTE ERROR]", e);

    const tpl = await layout(env);

    const errorBlock = `
      <div class="page-wrap">
        <h1>PAGE ENGINE ERROR</h1>
        <pre>${e?.message || e}</pre>
        <a href="/" class="ui-link">Back</a>
      </div>
    `;

    return tpl
      .replaceAll("{{title}}", "Error")
      .replaceAll("{{layout}}", "page")
      .replaceAll("{{nav}}", `<a href="/" class="ui-link">Index</a>`)
      .replaceAll("{{content}}", errorBlock);
  }
}
