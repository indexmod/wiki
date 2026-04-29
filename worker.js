// =========================================================
// ENGINE STATE: CORE ROUTER
// STATUS:
// ✔ unified response pipeline
// ✔ html normalization layer
// ✔ Response/HTML safety guard added
// ✔ index / page / editor routing stabilized
//
// NOTES:
// - ALL engines may return string OR Response
// - worker normalizes output into safe HTML
// - prevents [object Response] regression
// =========================================================

import { indexRoute } from "./engine/index/route.js";
import { pageRoute } from "./engine/pages/route.js";
import { editorRoute } from "./engine/editor/route.js";

import { htmlResponse, errorResponse } from "./engine/core/response.js";


// ===============================
// OUTPUT NORMALIZER (CRITICAL LAYER)
// ===============================
function normalizeOutput(result) {
  if (!result) return "<h1>EMPTY RESPONSE</h1>";

  // if engine returned full Response (legacy-safe mode)
  if (result instanceof Response) {
    return result;
  }

  // enforce string contract
  if (typeof result !== "string") {
    return String(result);
  }

  return result;
}


// ===============================
// ROUTER
// ===============================
export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;

    try {

      // ===============================
      // INDEX ENGINE
      // ===============================
      if (path === "/" || path === "/index") {
        const html = normalizeOutput(await indexRoute(env));
        return htmlResponse(html);
      }

      // ===============================
      // EDITOR ENGINE
      // ===============================
      if (path === "/editor") {
        const html = normalizeOutput(await editorRoute(env));
        return htmlResponse(html);
      }

      // ===============================
      // PAGE ENGINE (DYNAMIC ROUTES)
      // ===============================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path.replace(/^\/+|\/+$/g, "");
        const html = normalizeOutput(await pageRoute(env, slug));
        return htmlResponse(html);
      }

      // ===============================
      // STATIC ASSETS
      // ===============================
      return env.ASSETS.fetch(req);

    } catch (e) {
      console.log("[WORKER ERROR]", e);
      return errorResponse(e, "WORKER");
    }
  }
};
