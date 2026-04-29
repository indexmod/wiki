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
    .replaceAll("{{title}}", "Indexmod Fashion and Art")
    .replaceAll("{{layout}}", "index")
    .replaceAll("{{nav}}", `<a href="/editor" class="nav-new">New</a>`)
    .replaceAll("{{content}}", content);
}
