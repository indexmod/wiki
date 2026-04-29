// ===============================
// ENGINE: EDITOR
// FILE: route.js
// PURPOSE: editor entry route
// ===============================

import { layout } from "./layout.js";
import { renderEditor } from "./render.js";

export async function editorRoute(env) {
  try {
    console.log("[EDITOR ROUTE] start");

    // ===============================
    // LOAD LAYOUT (STRICT CONTRACT)
    // ===============================
    const tpl = await layout(env, "editor");

    if (!tpl) {
      throw new Error("EDITOR LAYOUT EMPTY");
    }

    // ===============================
    // RENDER CONTENT
    // ===============================
    const content = renderEditor();

    if (!content) {
      throw new Error("EDITOR RENDER EMPTY");
    }

    // ===============================
    // BUILD RESPONSE
    // ===============================
    return tpl
      .replaceAll("{{title}}", "EDITOR ENGINE")
      .replaceAll("{{layout}}", "editor")
      .replaceAll("{{nav}}", `<a href="/" class="ui-link">BACK TO INDEX</a>`)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[EDITOR ROUTE ERROR]", e);

    return new Response(
      "EDITOR ENGINE CRASH:\n\n" +
      (e?.stack || e?.message || e),
      { status: 500 }
    );
  }
}
