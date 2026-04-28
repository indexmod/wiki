import { layout } from "../layouts.js";
import { listPages } from "../api.js";
import { renderIndex } from "../renders/index-render.js";

export async function indexRoute(env) {

  const pages = await listPages(env);

  const filtered = pages.filter(p => p.slug !== "index");

  const content = renderIndex(filtered);

  const tpl = await layout(env, "index");

  const html = tpl
    .replace("{{title}}", "IndexMod")
    .replace("{{layout}}", "index")
    .replace("{{content}}", content);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
