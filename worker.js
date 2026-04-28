import { handleRoute } from "./engine/routes.js";
import { listPages, getPage, savePage } from "./engine/api.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // ================= API =================
    if (path === "/api/pages") {
      return Response.json(await listPages(env));
    }

    if (path.startsWith("/api/page/") && req.method === "GET") {
      const slug = path.split("/").pop();
      return Response.json(await getPage(env, slug));
    }

    if (path.startsWith("/api/page/") && req.method === "POST") {
      const slug = path.split("/").pop();
      const data = await req.json();
      return Response.json(await savePage(env, slug, data));
    }

    // ================= ROUTES =================
    const html = await handleRoute(req, env, path);

    if (html) {
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return env.ASSETS.fetch(req);
  }
};
