import { indexRoute } from "./engine/routes/index-route.js";
import { pageRoute } from "./engine/routes/page-route.js";
import { editorRoute } from "./engine/routes/editor-route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // INDEX
    if (path === "/" || path === "/index") {
      return indexRoute(env);
    }

    // EDITOR
    if (path === "/editor") {
      return editorRoute(env);
    }

    // PAGE
    if (!path.startsWith("/api") && !path.includes(".")) {
      const slug = path.slice(1);
      return pageRoute(env, slug);
    }

    return env.ASSETS.fetch(req);
  }
};
