import { layout } from "./layouts.js";
import { render, renderIndex } from "./render.js";
import { listPages, getPage, savePage } from "./api.js";

export async function handleRoute(req, env, path) {

  // ================= INDEX =================
  if (path === "/" || path === "/index") {
    const pages = await listPages(env);
    const tpl = await layout(env, "index");

    const html = tpl.replace(
      "{{content}}",
      renderIndex(pages)
    );

    return html;
  }

  // ================= PAGE =================
  if (!path.startsWith("/api") && !path.includes(".")) {
    const slug = path.slice(1);

    const page = await getPage(env, slug);
    if (!page) return null;

    const tpl = await layout(env, "page");

    return tpl
      .replaceAll("{{title}}", page.title)
      .replaceAll("{{slug}}", page.slug)
      .replaceAll("{{content}}", render(page.content));
  }

  return null;
}
