import { handleIndex } from "./engine/routes/index-route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // ❌ ВСЁ API ВРЕМЕННО ВЫКЛЮЧАЕМ
    if (path.startsWith("/api")) {
      return new Response("API disabled (index fix mode)", { status: 503 });
    }

    // ❌ ЭДИТОР ВЫКЛЮЧАЕМ
    if (path.startsWith("/editor")) {
      return new Response("Editor disabled (index fix mode)", { status: 503 });
    }

    // ✅ ТОЛЬКО ИНДЕКС
    if (path === "/" || path === "/index") {
      const html = await handleIndex(req, env);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache"
        }
      });
    }

    // всё остальное
    return new Response("Not in index mode", { status: 404 });
  }
};
