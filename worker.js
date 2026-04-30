import { indexRoute } from "./engine/routes/index-route.js";
import { pagesRoute } from "./engine/routes/pages-route.js";
import { editorRoute } from "./engine/routes/editor-route.js";
import { htmlResponse } from "./engine/core/response.js";

// ===============================
// BASE TEMPLATE LOADER
// ===============================
async function loadBase(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/base.html")
  );

  if (!res.ok) {
    throw new Error("Base layout not found in ASSETS");
  }

  return await res.text();
}

// ===============================
// SAFE STRING
// ===============================
function safe(v) {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

// ===============================
// RENDER PIPELINE
// ===============================
function render(base, { title, content, styles = "" }) {
  return base
    .replaceAll("{{title}}", safe(title))
    .replaceAll("{{content}}", safe(content))
    .replaceAll("{{styles}}", styles);
}

// ===============================
// ROUTER
// ===============================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      const base = await loadBase(env);

      // ===================== INDEX
      if (path === "/" || path === "/index") {
        const content = safe(await indexRoute(env));

        return htmlResponse(
          render(base, {
            title: "Index",
            content,
            styles: `<link rel="stylesheet" href="/styles/index.css">`
          })
        );
      }

      // ===================== EDITOR
      if (path === "/editor") {
        const content = safe(await editorRoute(env));

        return htmlResponse(
          render(base, {
            title: "Editor",
            content,
            styles: `<link rel="stylesheet" href="/styles/editor.css">`
          })
        );
      }

      // ===================== PAGES (slug router)
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.replace(/^\/+|\/+$/g, "");

        const content = safe(await pagesRoute(env, slug));

        return htmlResponse(
          render(base, {
            title: slug || "Page",
            content,
            styles: `<link rel="stylesheet" href="/styles/page.css">`
          })
        );
      }

      // ===================== STATIC FILES
      return env.ASSETS.fetch(req);

    } catch (err) {
      console.error("[WORKER ERROR]", err);
      return new Response(String(err), { status: 500 });
    }
  }
};
