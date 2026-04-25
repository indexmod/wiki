export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // GET /api/pages → список страниц
    // =========================
    if (url.pathname === "/api/pages") {
      const list = await env.WIKI_DB.list();

      const pages = await Promise.all(
        list.keys.map(async (k) => {
          const raw = await env.WIKI_DB.get(k.name);
          const doc = raw ? JSON.parse(raw) : null;

          return {
            slug: k.name,
            title: doc?.title || "untitled",
            updated: doc?.updated || null,
          };
        })
      );

      return Response.json(pages);
    }

    // =========================
    // GET /api/page/:slug
    // =========================
    if (url.pathname.startsWith("/api/page/")) {
      const slug = url.pathname.split("/").pop();

      const raw = await env.WIKI_DB.get(slug);

      if (!raw) {
        return new Response("Not Found", { status: 404 });
      }

      return new Response(raw, {
        headers: { "Content-Type": "application/json" },
      });
    }

    // =========================
    // POST /api/page/:slug
    // =========================
    if (url.pathname.startsWith("/api/page/") && request.method === "POST") {
      const slug = url.pathname.split("/").pop();
      const body = await request.json();

      const doc = {
        title: body.title || "untitled",
        content: body.content || "",
        updated: Date.now(),
      };

      await env.WIKI_DB.put(slug, JSON.stringify(doc));

      return Response.json({ ok: true, slug });
    }

    // =========================
    // fallback → статика
    // =========================
    return env.ASSETS.fetch(request);
  },
};
