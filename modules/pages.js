// FILE: modules/pages.js

function generateId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

// =========================
// PAGES API (ID-FIRST SYSTEM)
// =========================
export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const matchId = pathname.match(/^\/api\/page\/([^/]+)$/);

  // =========================
  // LIST (ALL PAGES)
  // =========================
  if (pathname === "/api/pages" && request.method === "GET") {
    const keys = await env.WIKI_DB.list();

    const pages = await Promise.all(
      keys.keys.map(k => env.WIKI_DB.get(k.name))
    );

    return Response.json(
      pages
        .filter(Boolean)
        .map(p => JSON.parse(p))
    );
  }

  // =========================
  // GET BY ID
  // =========================
  if (matchId && request.method === "GET") {
    const id = matchId[1];

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE (UPSERT BY ID)
  // =========================
  if (matchId && request.method === "POST") {
    const id = matchId[1];
    const body = await request.json();

    const raw = await env.WIKI_DB.get(id);
    const existing = raw ? JSON.parse(raw) : null;

    const slug = body.slug || existing?.slug || id;

    const page = {
      id,
      slug,
      title: body.title || slug,
      content: body.content || "",
      html: body.content || "",
      updatedAt: Date.now()
    };

    // store by id
    await env.WIKI_DB.put(id, JSON.stringify(page));

    // slug index
    await env.WIKI_DB.put("slug:" + slug, id);

    return Response.json(page);
  }

  // =========================
  // DELETE BY ID
  // =========================
  if (matchId && request.method === "DELETE") {
    const id = matchId[1];

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    const page = JSON.parse(raw);

    await env.WIKI_DB.delete(id);
    await env.WIKI_DB.delete("slug:" + page.slug);

    return new Response("deleted");
  }
}
