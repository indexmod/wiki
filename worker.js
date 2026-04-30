import { indexRoute } from "./engine/routes/index-route.js";
import { pagesRoute } from "./engine/routes/pages-route.js";
import { editorRoute } from "./engine/routes/editor-route.js";
import { htmlResponse } from "./engine/core/response.js";

async function loadBase(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/base.html")
  );
  return await res.text();
}

function safe(v) {
  return typeof v === "string" ? v : (v ? String(v) : "");
}

function render(base, { title, content, styles = "", nav = "" }) {
  return base
    .replace("{{title}}", safe(title))
    .replace("{{content}}", safe(content))
    .replace("{{styles}}", styles)
    .replace("{{nav}}", nav);
}

/* ================= NAV SYSTEM ================= */
function buildNav() {
  return `
    <a href="/">Index</a>
    <a href="/editor">Editor</a>
  `;
}

/* ================= ROUTER ================= */
export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    const base = await loadBase(env);

    const nav = buildNav();

    /* ================= INDEX ================= */
    if (path === "/" || path === "/index") {
      const content = await indexRoute(env);

      return htmlResponse(render(base, {
        title: "Index",
        content,
        nav,
        styles: `<link rel="stylesheet" href="/styles/index.css">`
      }));
    }

    /* ================= EDITOR ================= */
    if (path === "/editor") {
      const content = await editorRoute(env);

      return htmlResponse(render(base, {
        title: "Editor",
        content,
        nav,
        styles: `<link rel="stylesheet" href="/styles/editor.css">`
      }));
    }

    /* ================= PAGE ================= */
    if (!path.startsWith("/api") && !path.includes(".")) {
      const slug = path.replace(/^\/+|\/+$/g, "");
      const content = await pagesRoute(env, slug);

      return htmlResponse(render(base, {
        title: slug,
        content,
        nav,
        styles: `<link rel="stylesheet" href="/styles/page.css">`
      }));
    }

    return env.ASSETS.fetch(req);
  }
};
