import { indexRoute } from "./routes/index-route.js";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index") {
      return new Response(await indexRoute(env), {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }

    return env.ASSETS.fetch(req);
  }
};
