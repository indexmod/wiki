import { indexRoute } from "../routes/index-route.js";
import { layout } from "./layouts.js";
import { render } from "./render.js";
import { getPage } from "./api.js";

export async function handleRoute(req, env, path) {

  // ================= INDEX =================
  if (path === "/" || path === "/index") {
    return await indexRoute(env);
  }

  // ================= PAGE =================
  if (!path.startsWith("/api") && !path.includes(".")) {

    const slug = path.slice(1);
    const page = await getPage(env, slug);

    if (!page) return null;

    const tpl = await layout(env, "index");

    return tpl;

  return null;
}
