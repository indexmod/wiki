import { indexRoute } from "./engine/routes/index-route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index") {
      return indexRoute(env);
    }

    return env.ASSETS.fetch(req);
  }
};
