// ===============================
// ENGINE: PAGES
// FILE: route.js
// PURPOSE: dynamic wiki page route
// ===============================

import { layout } from "./layout.js";
import { renderPage } from "./render.js";
import { getPage } from "./api.js";

export async function pageRoute(env, slug) {
  try {
    console.log("[PAGE ROUTE]", slug);

    // ===============================
    // LOAD PAGE FROM R2
    // ===============================
    const page = await getPage(env, slug);

    // ===============================
    // NOT FOUND
    // ===============================
    if (!page) {
      return new Response("PAGE NOT FOUND", { status: 404 });
    }

    // ===============================
    // LOAD LAYOUT
    // ===============================
    const tpl = await layout(env);

    if (!tpl || !tpl.includes("{{content}}")) {
      throw new Error("PAGE LAYOUT BROKEN");
    }

    // ===============================
    // RENDER CONTENT
    // ===============================
    const content = renderPage(page);

    // ===============================
    // NAVIGATION (SIMPLE FOR NOW)
    // ===============================
    const nav = `<a href="/" class="ui-link">Back</a>`;

    // ===============================
    // BUILD RESPONSE
    // ===============================
    return tpl
      .replaceAll("{{title}}", page.title || slug)
      .replaceAll("{{layout}}", "page")
      .replaceAll("{{nav}}", nav)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[PAGE ROUTE ERROR]", e);

    return new Response(
      "PAGE ENGINE ERROR:\n\n" +
      (e?.stack || e?.message || e),
      { status: 500 }
    );
  }
}
