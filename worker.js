import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/pages/route.js";
import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    try {
      // ================= INDEX =================
      if (path === "/" || path === "/index") {
        return await indexRoute(env);
      }

      // ================= EDITOR =================
      if (path === "/editor") {
        return await editorRoute(env);
      }

      // ================= PAGES =================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.slice(1);
        return await pageRoute(env, slug);
      }

      // ================= STATIC =================
      return env.ASSETS.fetch(req);

    } catch (e) {
      console.log("[WORKER ERROR]", e);

      return new Response(
        "WORKER CRASH:\n\n" + (e?.stack || e?.message || e),
        { status: 500 }
      );
    }
  }
};
