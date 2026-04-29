// =========================================================
// ENGINE STATE: EDITOR ROUTE
// STATUS:
// ✔ slug-aware editor (/editor/:slug)
// ✔ page preload supported
// ✔ Page → Editor transformation layer
// ✔ safe fallback mode (new page)
// ✔ layout contract enforced
//
// NOTES:
// - editor can work in 2 modes:
//   1) new page (no slug)
//   2) edit existing page (with slug)
// =========================================================

import { layout } from "./layout.js";
import { renderEditor } from "./render.js";
import { getPage } from "../pages/api.js";


// ===============================
// SLUG NORMALIZER (shared rule)
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
// EDITOR ROUTE
// ===============================
export async function editorRoute(env, slug) {
  try {

    const cleanSlug = normalizeSlug(slug);

    let page = null;

    // ===============================
    // LOAD EXISTING PAGE (EDIT MODE)
    // ===============================
    if (cleanSlug) {
      page = await getPage(env, cleanSlug);
    }

    const tpl = await layout(env);

    if (!tpl || !tpl.includes("{{content}}")) {
      throw new Error("EDITOR LAYOUT CONTRACT BROKEN");
    }

    // ===============================
    // RENDER CONTENT
    // ===============================
    const content = renderEditor(page);

    // ===============================
    // NAV CONTRACT
    // ===============================
    const nav = `
      <a href="/" class="ui-link">Index</a>
      ${
        cleanSlug
          ? `<a href="/${cleanSlug}" class="ui-link">View</a>`
          : ""
      }
    `;

    // ===============================
    // TITLE CONTEXT
    // ===============================
    const title = cleanSlug
      ? `Edit: ${cleanSlug}`
      : "New page";

    // ===============================
    // BUILD RESPONSE (STRING ONLY)
    // ===============================
    return tpl
      .replaceAll("{{title}}", title)
      .replaceAll("{{layout}}", "editor")
      .replaceAll("{{nav}}", nav)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[EDITOR ROUTE ERROR]", e);

    return `
      <div class="editor-error">
        <h1>EDITOR ENGINE ERROR</h1>
        <pre>${e?.message || e}</pre>
        <a href="/" class="ui-link">Back to index</a>
      </div>
    `;
  }
}
