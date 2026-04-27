<!-- FILE: pages.js -->

export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/(.+)$/);

  // =========================
  // LIST PAGES
  // =========================
  if (pathname === "/api/pages" && request.method === "GET") {
    const keys = await env.WIKI_DB.list();

    const pages = await Promise.all(
      keys.keys.map(async (k) => {
        const raw = await env.WIKI_DB.get(k.name);
        if (!raw) return null;

        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
    );

    return Response.json(pages.filter(Boolean));
  }

  // =========================
  // GET BY ID
  // =========================
  if (match && request.method === "GET") {
    const id = match[1];

    const raw = await env.WIKI_DB.get(id);

    if (!raw) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE BY ID
  // =========================
  if (match && request.method === "POST") {
    const id = match[1];
    const body = await request.json();

    const existingRaw = await env.WIKI_DB.get(id);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    // =========================
    // Markdown → HTML (safe minimal)
    // =========================
    const html = (body.content || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    const page = {
      id,
      slug: body.slug || existing.slug || id,
      title: body.title || existing.title || id,
      content: body.content || "",
      html,
      createdAt: existing.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await env.WIKI_DB.put(id, JSON.stringify(page));

    return Response.json(page);
  }

  // =========================
  // DELETE BY ID
  // =========================
  if (match && request.method === "DELETE") {
    const id = match[1];

    await env.WIKI_DB.delete(id);

    return new Response("deleted");
  }

  return new Response("Not found", { status: 404 });
}
