// FILE: worker.js (MINIMAL ID + SLUG LAYER)

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // =========================
    // LIST
    // =========================
    if (url.pathname === "/api/pages") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys.map(k => env.WIKI_DB.get(k.name))
      );

      return Response.json(
        pages.filter(Boolean).map(p => JSON.parse(p))
      );
    }

    // =========================
    // GET BY ID
    // =========================
    if (url.pathname.startsWith("/api/page/") && req.method === "GET") {
      const key = url.pathname.split("/").pop();

      // 1) сначала пробуем как ID
      let raw = await env.WIKI_DB.get(key);

      // 2) если нет — пробуем как slug
      if (!raw) {
        const id = await env.WIKI_DB.get("slug:" + key);
        if (id) {
          raw = await env.WIKI_DB.get(id);
        }
      }

      if (!raw) return new Response("not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // SAVE (UPSERT)
    // =========================
    if (url.pathname.startsWith("/api/page/") && req.method === "POST") {
      const key = url.pathname.split("/").pop();
      const body = await req.json();

      const id = key === "new"
        ? genId()
        : (await env.WIKI_DB.get("slug:" + key)) || key;

      const slug = body.slug || key;

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
    // DELETE
    // =========================
    if (url.pathname.startsWith("/api/page/") && req.method === "DELETE") {
      const key = url.pathname.split("/").pop();

      const id = await env.WIKI_DB.get("slug:" + key) || key;
      const raw = await env.WIKI_DB.get(id);

      if (!raw) return new Response("not found", { status: 404 });

      const page = JSON.parse(raw);

      await env.WIKI_DB.delete(id);
      await env.WIKI_DB.delete("slug:" + page.slug);

      return new Response("deleted");
    }
  }
};
