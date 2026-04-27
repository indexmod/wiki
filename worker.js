function generateId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // =========================
    // LIST
    // =========================
    if (pathname === "/api/pages") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys.map(async k => {
          const raw = await env.WIKI_DB.get(k.name);
          return raw ? JSON.parse(raw) : null;
        })
      );

      return Response.json(pages.filter(Boolean));
    }

    // =========================
    // GET BY SLUG
    // =========================
    if (pathname.startsWith("/api/page/") && request.method === "GET") {
      const slug = pathname.split("/").pop();

      const id = await env.WIKI_DB.get("slug:" + slug);
      if (!id) return new Response("Not found", { status: 404 });

      const raw = await env.WIKI_DB.get(id);
      if (!raw) return new Response("Not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // =========================
    // SAVE
    // =========================
    if (pathname.startsWith("/api/page/") && request.method === "POST") {
      const slug = pathname.split("/").pop();
      const body = await request.json();

      let id = await env.WIKI_DB.get("slug:" + slug);
      if (!id) id = generateId();

      const page = {
        id,
        slug,
        title: body.title || slug,
        content: body.content || "",
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(id, JSON.stringify(page));
      await env.WIKI_DB.put("slug:" + slug, id);

      return Response.json(page);
    }

    // =========================
    // DELETE
    // =========================
    if (pathname.startsWith("/api/page/") && request.method === "DELETE") {
      const slug = pathname.split("/").pop();

      const id = await env.WIKI_DB.get("slug:" + slug);
      if (!id) return new Response("Not found", { status: 404 });

      await env.WIKI_DB.delete(id);
      await env.WIKI_DB.delete("slug:" + slug);

      return new Response("deleted");
    }

    return new Response("404");
  }
};
