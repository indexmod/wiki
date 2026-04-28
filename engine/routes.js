import { layout } from "./layouts.js";
import { render, renderIndex } from "./render.js";
import { listPages, getPage } from "./api.js";

export async function handleRoute(req, env, path) {

  // ================= INDEX =================
  if (path === "/" || path === "/index") {

    const pages = (await listPages(env))
      .filter(p => p.slug && p.slug !== "index");

    const tpl = await layout(env, "index");

    const html = tpl
      .replaceAll("{{title}}", "IndexMod")
      .replaceAll("{{content}}", renderIndex(pages));

    return html;
  }

  // ================= PAGE =================
  if (!path.startsWith("/api") && !path.includes(".")) {

    const slug = path.slice(1);

    const page = await getPage(env, slug);

    if (!page) return "<h1>404</h1>";

    const tpl = await layout(env, "page");

    const html = tpl
      .replaceAll("{{title}}", page.title || slug)
      .replaceAll("{{slug}}", page.slug || slug)
      .replaceAll("{{content}}", render(page.content || ""));

    return html;
  }

  return null;
}
