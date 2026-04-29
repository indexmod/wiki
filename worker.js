import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/page/route.js";
import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;

      if (path === "/" || path === "/index") {
        return await indexRoute(env);
      }

      if (path === "/editor") {
        return await editorRoute(env);
      }

      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.slice(1);
        return await pageRoute(env, slug);
      }

      return env.ASSETS.fetch(req);

    } catch (err) {
      console.log("[WORKER ERROR]", err);

      return new Response("Worker crashed: " + err.message, {
        status: 500
      });
    }
  }
};
