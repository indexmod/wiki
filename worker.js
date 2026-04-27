import { pagesAPI } from "./modules/pages.js";
import { topicsAPI } from "./modules/topics.js";
import { seoRouter } from "./modules/seo.js";

// =========================
// ROUTE HELPERS
// =========================
function isAssetPath(pathname) {
  return pathname.includes("."); // css / js / png / svg
}

function isSlugRoute(pathname) {
  return /^\/[a-z0-9-]+$/.test(pathname);
}

// =========================
// WORKER
// =========================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =====================================================
    // 1. API LAYER (ABSOLUTE PRIORITY)
    // =====================================================

    if (pathname.startsWith("/api/")) {

      // pages collection
      if (pathname === "/api/pages") {
        return pagesAPI(request, env);
      }

      // single page
      if (pathname.startsWith("/api/page/")) {
        return pagesAPI(request, env);
      }

      // topics
      if (pathname.startsWith("/api/topics")) {
        return topicsAPI(request, env);
      }

      return new Response("API route not found", { status: 404 });
    }

    // =====================================================
    // 2. STATIC ASSETS
    // =====================================================
    if (isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // =====================================================
    // 3. SEO ROUTES (CLEAN URLS)
    // /svinoe-rylo → seoRouter → HTML render
    // =====================================================
    if (isSlugRoute(pathname)) {
      return seoRouter(request, env);
    }

    // =====================================================
    // 4. FALLBACK (INDEX / SPA)
    // =====================================================
    return env.ASSETS.fetch(request);
  }
};
