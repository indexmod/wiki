// FILE: worker.js (MINIMAL ID + SLUG LAYER)

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // =========================
    // LIST (ONLY REAL PAGES)
    // =========================
    if (pathname === "/api/pages" && req.method === "GET") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys
          .map(k => k.name)
          .filter(k => k.startsWith("p_")) // только ID
          .map(id => env.WIKI_DB.get(id))
      );

      return Response.json(
        pages.filter(Boolean).map(p => JSON.parse(p))
      );
    }

    // =========================
    // GET (BY ID OR SLUG)
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "GET") {
      const key = pathname.split("/").pop();

      let raw = await env.WIKI_DB.get(key); // ID first

      if (!raw) {
        const id = await env.WIKI_DB.get("slug:" + key); // fallback slug
        if (id) raw = await env.WIKI_DB.get(id);
      }

      if (!raw) return new Response("not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // SAVE (UPSERT)
    // =========================
    if (pathname.startsWith("/api/page/") && req.method === "POST") {
      const key = pathname.split("/").pop();
      const body = await req.json();

      const isNew = key === "new";

      let id;

      if (isNew) {
        id = genId();
      } else {
        // если key это slug → получаем id
        id = (await env.WIKI_DB.get("slug:" + key)) || key;
      }

      const existingRaw = await env.WIKI_DB.get(id);
      const existing = existingRaw ? JSON.parse(existingRaw) : null;

      // ⚠️ slug НИКОГДА не равен id
      let slug = (body.slug || existing?.slug || body.title || "page")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // удалить старый slug если поменялся
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
    // DELETE
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

    return new Response("404");
  }
};
