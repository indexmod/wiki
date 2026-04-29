// ===============================
// ENGINE: INDEX
// FILE: route.js
// PURPOSE: index entry route (home page)
// ===============================

import { layout } from "./layout.js";
import { renderIndex } from "./render.js";

export async function indexRoute(env) {
  const tpl = await layout(env);

  const content = await renderIndex(env);

  return tpl
    .replaceAll("{{title}}", "INDEX ENGINE")
    .replaceAll("{{layout}}", "index")
    .replaceAll("{{nav}}", `<span class="ui-link">INDEX MODE</span>`)
    .replaceAll("{{content}}", content);
}
