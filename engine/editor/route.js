// ===============================
// ENGINE: EDITOR
// FILE: route.js
// PURPOSE: editor entry route
// ===============================

import { layout } from "./layout.js";
import { renderEditor } from "./render.js";
import { loadPage } from "./state.js";

function assertContract(html) {
  if (!html || typeof html !== "string") {
    throw new Error("EDITOR LAYOUT EMPTY");
  }

  if (!html.includes("{{content}}")) {
    throw new Error("EDITOR LAYOUT CONTRACT BROKEN");
  }
}

export async function editorRoute(env, slug = "untitled") {
  try {
    console.log("[EDITOR ROUTE] start");

    // ===============================
    // LOAD DATA (STATE LAYER)
    // ===============================
    const page = await loadPage(env, slug);

    // ===============================
    // LOAD LAYOUT
    // ===============================
    const tpl = await layout(env);

    assertContract(tpl);

    // ===============================
    // NAVIGATION (CONTEXT-AWARE)
    // ===============================
    const nav = `
      <a href="/" class="ui-link">Back</a>
      <a href="#" class="ui-link">Save</a>
      <a href="#" class="ui-link">Edit</a>
    `;

    // ===============================
    // RENDER CONTENT (WITH STATE)
    // ===============================
    const content = renderEditor(page);

    if (!content) {
      throw new Error("EDITOR RENDER EMPTY");
    }

    // ===============================
    // BUILD RESPONSE
    // ===============================
    return tpl
      .replaceAll("{{title}}", page?.title || "Editor Engine")
      .replaceAll("{{layout}}", "editor")
      .replaceAll("{{nav}}", nav)
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
