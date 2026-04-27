import { pagesAPI } from "./modules/pages.js";
import { topicsAPI } from "./modules/topics.js";
import { seoRouter } from "./modules/seo.js";

// =========================
// HELPERS
// =========================
function isAssetPath(pathname) {
  return pathname.includes(".");
}

function isSlugRoute(pathname) {
  return /^\/[a-z0-9-]+$/.test(pathname);
}

function isApi(pathname) {
  return pathname.startsWith("/api/");
}

// =========================
// WORKER
// =========================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =========================
    // 1. API LAYER
    // =========================
    if (isApi(pathname)) {

      if (pathname === "/api/pages") {
        return pagesAPI(request, env);
      }

      if (pathname.startsWith("/api/page/")) {
        return pagesAPI(request, env);
      }

      if (pathname.startsWith("/api/topics")) {
        return topicsAPI(request, env);
      }

      return new Response("API not found", { status: 404 });
    }

    // =========================
    // 2. STATIC
    // =========================
    if (isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // =========================
    // 3. SEO (slug → resolver)
    // =========================
    if (isSlugRoute(pathname)) {
      return seoRouter(request, env);
    }

    // =========================
    // 4. FALLBACK
    // =========================
    return env.ASSETS.fetch(request);
  }
};
