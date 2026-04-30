// =========================================================
// CORE ROUTER (FINALIZED WITH LAYOUT SYSTEM)
// =========================================================

import { indexRoute } from "./engine/core/index-route.js";
import { pageRoute } from "./engine/core/pages-route.js";
import { editorRoute } from "./engine/core/editor-route.js";

import { htmlResponse, errorResponse } from "./engine/core/response.js";


// ===============================
// LOAD BASE TEMPLATE (ONCE PER REQUEST)
// ===============================
async function loadBase(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/base.html")
  );

  return await res.text();
}


// ===============================
// BUILD FINAL HTML
// ===============================
function buildPage({ base, content, title = "", layout, styles = "", nav = "" }) {
  return base
    .replace("{{title}}", title)
    .replace("{{content}}", content)
    .replace("{{styles}}", styles)
    .replace("{{layout}}", layout)
    .replace("{{nav}}", nav);
}


// ===============================
// OUTPUT NORMALIZER
// ===============================
function normalizeOutput(result) {
  if (!result) return "<h1>EMPTY RESPONSE</h1>";

  if (result instanceof Response) return result;

  if (typeof result !== "string") {
    return String(result);
  }

  return result;
}


// ===============================
// ROUTER
// ===============================
export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    try {

      const base = await loadBase(env);

      // ===============================
      // INDEX
      // ===============================
      if (path === "/" || path === "/index") {

        const content = normalizeOutput(await indexRoute(env));

        const html = buildPage({
          base,
          content,
          title: "Index",
          layout: "index",
          styles: `<link rel="stylesheet" href="/styles/index.css">`
        });

        return htmlResponse(html);
      }


      // ===============================
      // EDITOR
      // ===============================
      if (path === "/editor") {

        const content = normalizeOutput(await editorRoute(env));

        const html = buildPage({
          base,
          content,
          title: "Editor",
          layout: "editor",
          styles: `<link rel="stylesheet" href="/styles/editor.css">`
        });

        return htmlResponse(html);
      }


      // ===============================
      // PAGE
      // ===============================
      if (!path.startsWith("/api") && !path.includes(".")) {

        const slug = path.replace(/^\/+|\/+$/g, "");

        const content = normalizeOutput(await pageRoute(env, slug));

        const html = buildPage({
          base,
          content,
          title: slug,
          layout: "page",
          styles: `<link rel="stylesheet" href="/styles/page.css">`
        });

        return htmlResponse(html);
      }


      // ===============================
      // STATIC
      // ===============================
      return env.ASSETS.fetch(req);

    } catch (e) {
      console.log("[WORKER ERROR]", e);
      return errorResponse(e, "WORKER");
    }
  }
};
