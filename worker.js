import { indexRoute } from "./engine/routes/index-route.js";
import { pageRoute } from "./engine/routes/page-route.js";
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
        try {
          return await editorRoute(env);
        } catch (e) {
          return new Response(
            "EDITOR ERROR:\n\n" + (e?.stack || e?.message || e),
            {
              status: 500,
              headers: {
                "content-type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      }

      // ================= PAGES =================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.slice(1);
        return await pageRoute(env, slug);
      }

      // ================= ASSETS =================
      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response(
        "WORKER CRASH:\n\n" + (err?.stack || err?.message || err),
        {
          status: 500,
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        }
      );
    }
  }
};
