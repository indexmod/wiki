import { layout } from "../engine/layouts.js";
import { renderIndex } from "../engine/render.js";
import { listPages } from "../engine/api.js";

export async function indexRoute(env) {
  const pages = (await listPages(env))
    .filter(p => p.slug !== "index");

  const tpl = await layout(env, "index");

  const html = tpl.replace(
    "{{content}}",
    renderIndex(pages)
  );

  return html;
}
