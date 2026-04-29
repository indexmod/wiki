
// ===============================
// WORKER ENTRY
// ===============================

import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/pages/route.js";
import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {

    try {
      const path = new URL(req.url).pathname;

      // ===============================
      // INDEX
      // ===============================
      if (path === "/" || path === "/index") {
        return await indexRoute(env);
      }

      // ===============================
      // EDITOR
      // ===============================
      if (path === "/editor") {
        return await editorRoute(env);
      }

      // ===============================
      // PAGES
      // ===============================
      if (!path.startsWith("/api") && !path.includes(".")) {
        return await pageRoute(env, path.slice(1));
      }

      // ===============================
      // STATIC ASSETS
      // ===============================
      return env.ASSETS.fetch(req);

    } catch (e) {

      console.log("[WORKER ERROR]", e);

      return new Response(
        "WORKER ERROR:\n\n" +
        (e?.stack || e?.message || e),
        { status: 500 }
      );
    }
  }
};
