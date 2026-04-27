// FILE: worker.js (SINGLE SOURCE MODEL — NO SLUG INDEX)

import { seoRouter } from "./modules/seo.js";

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // =========================
    // SEO ROUTE (/slug → page)
    // =========================
    if (
      req.method === "GET" &&
      !pathname.startsWith("/api") &&
      !pathname.includes(".") &&
      pathname !== "/"
    ) {
      return seoRouter(req, env);
    }

    // =========================
    // LIST
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
    // GET PAGE (ONLY BY ID)
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "GET") {
      const id = pathname.split("/").pop();

      const raw = await env.WIKI_DB.get(id);

      if (!raw) return new Response("not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // SAVE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "POST") {
      const id = pathname.split("/").pop();
      const body = await req.json();

      const isNew = id === "new";

      const realId = isNew ? genId() : id;

      const existingRaw = await env.WIKI_DB.get(realId);
      const existing = existingRaw ? JSON.parse(existingRaw) : null;

      // slug теперь ТОЛЬКО поле, без KV индекса
      let slug = (body.slug || existing?.slug || body.title || "page")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const page = {
        id: realId,
        slug,
        title: body.title || slug,
        content: body.content || "",
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(realId, JSON.stringify(page));

      return Response.json(page);
    }

    // =========================
    // DELETE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "DELETE") {
      const id = pathname.split("/").pop();

      await env.WIKI_DB.delete(id);

      return new Response("deleted");
    }

    return new Response("404");
  }
};
