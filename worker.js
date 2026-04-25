export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =========================
    // API: LIST PAGES
    // =========================
    if (pathname === "/api/pages" && request.method === "GET") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys.map(async (k) => {
          const value = await env.WIKI_DB.get(k.name);
          return value ? JSON.parse(value) : null;
        })
      );

      return Response.json(pages.filter(Boolean));
    }

    // =========================
    // API: GET PAGE
    // =========================
    const pageMatch = pathname.match(/^\/api\/page\/(.+)$/);
    if (pageMatch && request.method === "GET") {
      const slug = pageMatch[1];
      const value = await env.WIKI_DB.get(slug);

      if (!value) {
        return new Response("Not found", { status: 404 });
      }

      return Response.json(JSON.parse(value));
    }

    // =========================
    // API: SAVE PAGE
    // =========================
    if (pageMatch && request.method === "POST") {
      const slug = pageMatch[1];
      const body = await request.json();

      const page = {
        slug,
        title: body.title || slug,
        content: body.content || "",
        html: body.html || "",
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(slug, JSON.stringify(page));

      return Response.json(page);
    }

    // =========================
    // STATIC FRONTEND
    // =========================
    return env.ASSETS.fetch(request);
  }
};
