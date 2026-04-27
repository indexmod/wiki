// FILE: worker.js (API MINIMAL CORE)

function genId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // LIST
    if (url.pathname === "/api/pages") {
      const keys = await env.WIKI_DB.list();

      const pages = await Promise.all(
        keys.keys.map(k => env.WIKI_DB.get(k.name))
      );

      return Response.json(
        pages.filter(Boolean).map(p => JSON.parse(p))
      );
    }

    // GET
    if (url.pathname.startsWith("/api/page/") && req.method === "GET") {
      const id = url.pathname.split("/").pop();

      const raw = await env.WIKI_DB.get(id);
      if (!raw) return new Response("not found", { status: 404 });

      return Response.json(JSON.parse(raw));
    }

    // SAVE
    if (url.pathname.startsWith("/api/page/") && req.method === "POST") {
      const idParam = url.pathname.split("/").pop();
      const body = await req.json();

      const id = idParam === "new" ? genId() : idParam;

      const page = {
        id,
        title: body.title,
        content: body.content,
        updatedAt: Date.now()
      };

      await env.WIKI_DB.put(id, JSON.stringify(page));

      return Response.json(page);
    }

    return new Response("404");
  }
};
