// ===============================
// ENGINE: PAGE
// FILE: route.js
// PURPOSE: dynamic wiki page route
// ===============================

import { layout } from "./layout.js";
import { renderPage } from "./render.js";
import { getPage } from "./api.js";

export async function pageRoute(env, slug) {
  const page = await getPage(env, slug);

  // page not found → fallback
  if (!page) {
    return new Response("PAGE NOT FOUND", { status: 404 });
  }

  const tpl = await layout(env);

  const content = renderPage(page);

  return tpl
    .replaceAll("{{title}}", page.title || slug)
    .replaceAll("{{layout}}", "page")
    .replaceAll("{{slug}}", slug)
    .replaceAll("{{content}}", content);
}
