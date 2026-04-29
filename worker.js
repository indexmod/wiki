import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/pages/route.js";
import { editorRoute } from "./engine/editor/route.js";

import { htmlResponse, errorResponse } from "./engine/core/response.js";

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    try {
      // ================= INDEX =================
      if (path === "/" || path === "/index") {
        const html = await indexRoute(env);
        return htmlResponse(html);
      }

      // ================= EDITOR =================
      if (path === "/editor") {
        const html = await editorRoute(env);
        return htmlResponse(html);
      }

      // ================= PAGES =================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.slice(1);
        const html = await pageRoute(env, slug);
        return htmlResponse(html);
      }

      // ================= STATIC =================
      return env.ASSETS.fetch(req);

    } catch (e) {
      console.log("[WORKER ERROR]", e);
      return errorResponse(e, "WORKER");
    }
  }
};
