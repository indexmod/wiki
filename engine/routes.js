import { layout } from "./layouts.js";
import { render, renderIndex } from "./render.js";
import { listPages, getPage } from "./api.js";

export async function handleRoute(req, env, path) {

  const base = await layout(env, "base");

  // ================= INDEX =================
  if (path === "/" || path === "/index") {

    const pages = (await listPages(env))
      .filter(p => p.slug !== "index");

    const indexTpl = await layout(env, "index");

    const content = indexTpl.replace(
      "{{content}}",
      renderIndex(pages)
    );

    return base
      .replaceAll("{{title}}", "IndexMod")
      .replaceAll("{{content}}", content);
  }

  // ================= PAGE =================
  if (!path.startsWith("/api") && !path.includes(".")) {

    const slug = path.slice(1);
    const page = await getPage(env, slug);

    if (!page) return null;

    const pageTpl = await layout(env, "page");

    const content = pageTpl
      .replaceAll("{{title}}", page.title || slug)
      .replaceAll("{{slug}}", slug)
      .replaceAll("{{content}}", render(page.content || ""));

    return base.replaceAll("{{content}}", content);
  }

  return null;
}
