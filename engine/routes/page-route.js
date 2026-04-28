import { layout } from "../layouts.js";
import { getPage } from "../api.js";
import { renderPage } from "../renders/page-render.js";

export async function pageRoute(env, slug) {
  const page = await getPage(env, slug);

  if (!page) {
    return new Response("<h1>404</h1>", { status: 404 });
  }

  const content = renderPage(page);

  const tpl = await layout(env, "base");

  const html = tpl
    .replaceAll("{{title}}", page.title || slug)
    .replaceAll("{{layout}}", "page")
    .replaceAll("{{content}}", content);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
