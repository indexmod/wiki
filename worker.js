import { indexRoute } from "./engine/routes/index-route.js";
import { pageRoute } from "./engine/routes/page-route.js";
import { editorRoute } from "./engine/routes/editor-route.js";

export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;

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

      // ================= STATIC ASSETS =================
      return env.ASSETS.fetch(req);

    } catch (err) {
      console.log("[WORKER ERROR]", err);

      return new Response(
        "Worker crashed: " + (err?.message || err),
        { status: 500 }
      );
    }
  }
};
