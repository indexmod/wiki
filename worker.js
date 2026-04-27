<!-- FILE: worker.js -->

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

function isApiPageById(pathname) {
  return pathname.startsWith("/api/page/");
}

function isApiPageBySlug(pathname) {
  return pathname.startsWith("/api/page/by-slug/");
}

// =========================
// WORKER
// =========================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =====================================================
    // 1. API LAYER (HIGHEST PRIORITY)
    // =====================================================
    if (pathname.startsWith("/api/")) {

      // -------------------------
      // pages list
      // -------------------------
      if (pathname === "/api/pages") {
        return pagesAPI(request, env);
      }

      // -------------------------
      // page by ID (PRIMARY KEY)
      // -------------------------
      if (isApiPageById(pathname) && !pathname.includes("/by-slug/")) {
        return pagesAPI(request, env);
      }

      // -------------------------
      // page by SLUG (lookup layer)
      // -------------------------
      if (isApiPageBySlug(pathname)) {
        return pagesAPI(request, env);
      }

      // -------------------------
      // topics
      // -------------------------
      if (pathname.startsWith("/api/topics")) {
        return topicsAPI(request, env);
      }

      return new Response("API route not found", { status: 404 });
    }

    // =====================================================
    // 2. STATIC FILES
    // =====================================================
    if (isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // =====================================================
    // 3. SEO ROUTES (CLEAN URLS)
    // /svinoe-rylo → resolve by slug → render HTML
    // =====================================================
    if (isSlugRoute(pathname)) {
      return seoRouter(request, env);
    }

    // =====================================================
    // 4. FALLBACK
    // =====================================================
    return env.ASSETS.fetch(request);
  }
};
