import { indexRoute } from "./engine/core/index-route.js";
import { pagesRoute } from "./engine/core/pages-route.js";
import { editorRoute } from "./engine/core/editor-route.js";
import { htmlResponse } from "./engine/core/response.js";

async function loadBase(env) {
  const res = await env.ASSETS.fetch("/layouts/base.html");
  return await res.text();
}

function safe(v) {
  if (!v) return "";
  return typeof v === "string" ? v : String(v);
}

function render(base, { title, content, styles = "" }) {
  return base
    .replace("{{title}}", title)
    .replace("{{content}}", content)
    .replace("{{styles}}", styles);
}

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    const base = await loadBase(env);

    // INDEX
    if (path === "/" || path === "/index") {
      const content = safe(await indexRoute(env));

      return htmlResponse(render(base, {
        title: "Index",
        content,
        styles: `<link rel="stylesheet" href="/styles/index.css">`
      }));
    }

    // EDITOR
    if (path === "/editor") {
      const content = safe(await editorRoute(env));

      return htmlResponse(render(base, {
        title: "Editor",
        content,
        styles: `<link rel="stylesheet" href="/styles/editor.css">`
      }));
    }

    // PAGE
    if (!path.startsWith("/api") && !path.includes(".")) {
      const slug = path.replace(/^\/+|\/+$/g, "");
      const content = safe(await pagesRoute(env, slug));

      return htmlResponse(render(base, {
        title: slug,
        content,
        styles: `<link rel="stylesheet" href="/styles/page.css">`
      }));
    }

    return env.ASSETS.fetch(req);
  }
};
