import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/pages/route.js";
import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // ================= INDEX =================
      if (path === "/" || path === "/index") {
        return await indexRoute(env);
      }

      // ================= EDITOR =================
      if (path === "/editor") {
        return await editorRoute(env);
      }

      // ================= PAGE ENGINE =================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const res = await pageRoute(env, path.slice(1));

        // 💥 важный safety fallback
        if (!res) {
          return new Response("PAGE NOT FOUND", { status: 404 });
        }

        return res;
      }

      // ================= STATIC =================
      return env.ASSETS.fetch(req);

      catch (e) {
        console.log("[WORKER CRASH]", e);

        return new Response(
          "WORKER CRASH:\n\n" +
          (e?.stack || e?.message || e),
          { status: 500 }
        );
      }
  }
};
