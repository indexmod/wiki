// FILE: worker.js (ZERO-INDEX MODE)

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

// =========================
// HELPERS
// =========================
async function getPageBySlug(env, slug) {
  const keys = await env.WIKI_DB.list();

  const pages = await Promise.all(
    keys.keys
      .map(k => k.name)
      .filter(k => k.startsWith("p_"))
      .map(id => env.WIKI_DB.get(id))
  );

  for (const raw of pages) {
    if (!raw) continue;
    const page = JSON.parse(raw);
    if (page.slug === slug) return page;
  }

  return null;
}

// =========================
// WORKER
// =========================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // =========================
    // LIST (ALL PAGES)
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
    // GET BY ID OR SLUG (UNIFIED)
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "GET") {
      const key = pathname.split("/").pop();

      let raw = await env.WIKI_DB.get(key);

      if (!raw) {
        const page = await getPageBySlug(env, key);
        if (!page) return new Response("not found", { status: 404 });
        return Response.json(page);
      }

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // SAVE (ID ONLY SOURCE OF TRUTH)
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "POST") {
      const key = pathname.split("/").pop();
      const body = await req.json();

      const isNew = key === "new";

      let id = isNew
        ? genId()
        : key;

      const raw = await env.WIKI_DB.get(id);
      const existing = raw ? JSON.parse(raw) : null;

      const slug = (body.slug || body.title || "page")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const page = {
        id,
        slug,
        title: body.title || slug,
        content: body.content || "",
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(id, JSON.stringify(page));

      return Response.json(page);
    }

    // =========================
    // DELETE
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "DELETE") {
      const key = pathname.split("/").pop();

      const raw = await env.WIKI_DB.get(key);
      if (!raw) return new Response("not found", { status: 404 });

      await env.WIKI_DB.delete(key);

      return new Response("deleted");
    }

    return new Response("404");
  }
};
