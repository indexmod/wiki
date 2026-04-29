// ===============================
// ENGINE: EDITOR
// FILE: route.js
// PURPOSE: editor entry route
// ===============================

import { layout } from "./layout.js";
import { renderEditor } from "./render.js";

export async function editorRoute(env) {
  const tpl = await layout(env);

  const content = renderEditor();

  return tpl
    .replaceAll("{{title}}", "EDITOR ENGINE")
    .replaceAll("{{layout}}", "editor")
    .replaceAll("{{nav}}", `<a href="/" class="ui-link">BACK TO INDEX</a>`)
    .replaceAll("{{content}}", content);
}
