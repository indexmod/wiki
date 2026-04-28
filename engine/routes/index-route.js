import { layout } from "../layouts.js";
import { listPages } from "../api.js";
import { renderIndex } from "../../renders/index-render.js";

export async function handleIndex(req, env) {

  // 1. DATA
  const pages = await listPages(env);

  if (!Array.isArray(pages)) {
    return "<h1>NO PAGES</h1>";
  }

  const filtered = pages.filter(p => p.slug !== "index");

  // 2. RENDER
  const content = renderIndex(filtered);

  // 3. LAYOUT
  const tpl = await layout(env, "index");

  // 4. DEBUG SAFETY
  if (!tpl.includes("{{content}}")) {
    return "<h1>LAYOUT ERROR: missing {{content}}</h1>";
  }

  // 5. FINAL
  return tpl
    .replace("{{title}}", "IndexMod")
    .replace("{{content}}", content);
}
