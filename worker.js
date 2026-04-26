import { pagesAPI } from "./modules/pages.js";
import { topicsAPI } from "./modules/topics.js";
import { seoRouter } from "./modules/seo.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API
    if (url.pathname.startsWith("/api/pages")) {
      return pagesAPI(request, env);
    }

    if (url.pathname.startsWith("/api/topics")) {
      return topicsAPI(request, env);
    }

    // SEO / pages
    if (url.pathname.match(/^\/[a-z0-9-]+$/)) {
      return seoRouter(request, env);
    }

    // static
    return env.ASSETS.fetch(request);
  }
};
