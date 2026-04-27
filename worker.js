import { pagesAPI } from "./modules/pages.js";
import { topicsAPI } from "./modules/topics.js";
import { seoRouter } from "./modules/seo.js";

function isAssetPath(pathname) {
  return pathname.includes(".");
}

function isSlugRoute(pathname) {
  return /^\/[a-z0-9-]+$/.test(pathname);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // API
    if (pathname.startsWith("/api/pages")) {
      return pagesAPI(request, env);
    }

    if (pathname.startsWith("/api/topics")) {
      return topicsAPI(request, env);
    }

    // STATIC
    if (isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // SLUG → SSR
    if (isSlugRoute(pathname)) {
      return seoRouter(request, env);
    }

    // fallback
    return env.ASSETS.fetch(request);
  }
};
