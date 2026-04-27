import { pagesAPI } from "./modules/pages.js";
import { topicsAPI } from "./modules/topics.js";
import { seoRouter } from "./modules/seo.js";

// =========================
// ROUTE HELPERS
// =========================
function isAssetPath(pathname) {
  return pathname.includes("."); // /logo.png /favicon.svg /index.css
}

function isSlugRoute(pathname) {
  return /^\/[a-z0-9-]+$/.test(pathname);
}

function isApiPage(pathname) {
  return pathname.startsWith("/api/page/");
}

// =========================
// WORKER
// =========================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =====================================================
    // 1. API LAYER (JSON — ПЕРВЫЙ ПРИОРИТЕТ)
    // =====================================================

    if (pathname === "/api/pages") {
      return pagesAPI(request, env);
    }

    if (pathname.startsWith("/api/topics")) {
      return topicsAPI(request, env);
    }

    // 👉 ВАЖНО: конкретная страница API
    if (isApiPage(pathname)) {
      return pagesAPI(request, env);
    }

    // =====================================================
    // 2. STATIC FILES (CSS, JS, IMG)
    // =====================================================
    if (isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // =====================================================
    // 3. SEO SLUG ROUTES (HTML VIEW)
    // /svinoe-rylo → SSR page
    // =====================================================
    if (isSlugRoute(pathname)) {
      return seoRouter(request, env);
    }

    // =====================================================
    // 4. FALLBACK (SPA / INDEX)
    // =====================================================
    return env.ASSETS.fetch(request);
  }
};
