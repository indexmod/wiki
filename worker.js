import { indexRoute } from "./engine/routes/index-route.js";
import { pageRoute } from "./engine/routes/page-route.js";
import { editorRoute } from "./engine/editor/route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
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
      return new Response(
        "WORKER ERROR: " + (err?.stack || err?.message || err),
        { status: 500 }
      );
    }
  }
};
