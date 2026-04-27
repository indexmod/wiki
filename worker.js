// FILE: worker.js (FIXED ROUTING: /slug ALWAYS WORKS)

import { seoRouter } from "./modules/seo.js";

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // =========================
    // API: LIST
    // =========================
    if (pathname === "/api/pages" && req.method === "GET") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys
          .map(k => k.name)
          .filter(k => k.startsWith("p_"))
          .map(id => env.WIKI_DB.get(id))
      );

      return Response.json(
        pages.filter(Boolean).map(p => JSON.parse(p))
      );
    }

    // =========================
    // API: GET PAGE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "GET") {
      const key = pathname.split("/").pop();

      let raw = await env.WIKI_DB.get(key);

      if (!raw) {
        const id = await env.WIKI_DB.get("slug:" + key);
        if (id) raw = await env.WIKI_DB.get(id);
      }

      if (!raw) return new Response("not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // API: SAVE PAGE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "POST") {
      const key = pathname.split("/").pop();
      const body = await req.json();

      const isNew = key === "new";

      let id;

      if (isNew) {
        id = genId();
      } else {
        id = (await env.WIKI_DB.get("slug:" + key)) || key;
      }

      const existingRaw = await env.WIKI_DB.get(id);
      const existing = existingRaw ? JSON.parse(existingRaw) : null;

      let slug = (body.slug || existing?.slug || body.title || "page")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (existing?.slug && existing.slug !== slug) {
        await env.WIKI_DB.delete("slug:" + existing.slug);
      }

      const page = {
        id,
        slug,
        title: body.title || slug,
        content: body.content || "",
        html: body.content || "",
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(id, JSON.stringify(page));
      await env.WIKI_DB.put("slug:" + slug, id);

      return Response.json(page);
    }

    // =========================
    // API: DELETE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "DELETE") {
      const key = pathname.split("/").pop();

      const id = (await env.WIKI_DB.get("slug:" + key)) || key;
      const raw = await env.WIKI_DB.get(id);

      if (!raw) return new Response("not found", { status: 404 });

      const page = JSON.parse(raw);

      await env.WIKI_DB.delete(id);
      await env.WIKI_DB.delete("slug:" + page.slug);

      return new Response("deleted");
    }

    // =========================
    // 🔥 IMPORTANT: SLUG ROUTING LAST BUT ALWAYS EXECUTES
    // =========================
    const isSlugRoute =
      req.method === "GET" &&
      !pathname.startsWith("/api") &&
      !pathname.includes(".");

    if (isSlugRoute) {
      return seoRouter(req, env);
    }

    return new Response("404");
  }
};
