// FILE: modules/pages.js

function generateId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

// =========================
// HELPERS
// =========================
function isPageKey(key) {
  return key.startsWith("p_"); // ONLY real pages
}

// =========================
// PAGES API
// =========================
export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/([^/]+)$/);

  // =========================
  // LIST (ONLY REAL PAGES)
  // =========================
  if (pathname === "/api/pages" && request.method === "GET") {
    const keys = await env.WIKI_DB.list();

    const pages = await Promise.all(
      keys.keys
        .map(k => k.name)
        .filter(isPageKey)
        .map(id => env.WIKI_DB.get(id))
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
  if (match && request.method === "GET") {
    const id = match[1];

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE (UPSERT)
  // =========================
  if (match && request.method === "POST") {
    const id = match[1];
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

    // main record
    await env.WIKI_DB.put(id, JSON.stringify(page));

    // slug index (only pointer)
    await env.WIKI_DB.put("slug:" + slug, id);

    return Response.json(page);
  }

  // =========================
  // DELETE
  // =========================
  if (match && request.method === "DELETE") {
    const id = match[1];

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    const page = JSON.parse(raw);

    await env.WIKI_DB.delete(id);
    await env.WIKI_DB.delete("slug:" + page.slug);

    return new Response("deleted");
  }
}
