// ===============================
// ENGINE: INDEX
// FILE: route.js
// ===============================

import { layout } from "./layout.js";
import { renderIndex } from "./render.js";
import { listPages } from "./api.js";

export async function indexRoute(env) {
  const tpl = await layout(env);

  const pages = await listPages(env);

  const content = renderIndex(pages);

  return tpl
    .replaceAll("{{title}}", "Index")
    .replaceAll("{{layout}}", "index")
    .replaceAll("{{nav}}", `<a href="/editor" class="ui-link">NEW</a>`)
    .replaceAll("{{content}}", content);
}
