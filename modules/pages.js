// FILE: modules/pages.js

function generateId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

// =========================
// HELPERS
// =========================
function isPageKey(key) {
  return key.startsWith("p_");
}

// =========================
// PAGES API
// =========================
export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/([^/]+)$/);

  // =========================
  // LIST
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
      pages.filter(Boolean).map(p => JSON.parse(p))
    );
  }

  // =========================
  // GET
  // =========================
  if (match && request.method === "GET") {
    const id = match[1];

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE (FIXED SLUG RULE)
  // =========================
  if (match && request.method === "POST") {
    const id = match[1];
    const body = await request.json();

    const raw = await env.WIKI_DB.get(id);
    const existing = raw ? JSON.parse(raw) : null;

    // =========================
    // ⚠️ FIX: slug NEVER depends on id
    // =========================
    let slug = body.slug?.trim();

    if (!slug) {
      slug = (body.title || "page")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // remove old slug index if changed
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
