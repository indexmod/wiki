// FILE: modules/pages.js (SINGLE SOURCE MODEL - FIXED)

function isPageKey(key) {
  return key.startsWith("p_");
}

function normalizeSlug(input) {
  return (input || "page")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// HELPERS
// =========================
async function getAllPages(env) {
  const keys = await env.WIKI_DB.list();

  const pages = await Promise.all(
    keys.keys
      .map(k => k.name)
      .filter(isPageKey)
      .map(id => env.WIKI_DB.get(id))
  );

  return pages.filter(Boolean).map(p => JSON.parse(p));
}

function findBySlug(pages, slug) {
  return pages.find(p => p.slug === slug);
}

// =========================
// API
// =========================
export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/([^/]+)$/);

  // =========================
  // LIST
  // =========================
  if (pathname === "/api/pages" && request.method === "GET") {
    const pages = await getAllPages(env);
    return Response.json(pages);
  }

  // =========================
  // GET (ID OR SLUG)
  // =========================
  if (match && request.method === "GET") {
    const key = match[1];

    const raw = await env.WIKI_DB.get(key);

    if (raw) {
      return Response.json(JSON.parse(raw));
    }

    // fallback: slug scan
    const pages = await getAllPages(env);
    const page = findBySlug(pages, key);

    if (!page) return new Response("Not found", { status: 404 });

    return Response.json(page);
  }

  // =========================
  // SAVE (ID ONLY)
  // =========================
  if (match && request.method === "POST") {
    const id = match[1];
    const body = await request.json();

    const isNew = id === "new";

    const realId = isNew
      ? "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : id;

    const raw = await env.WIKI_DB.get(realId);
    const existing = raw ? JSON.parse(raw) : null;

    const slug = normalizeSlug(
      body.slug || existing?.slug || body.title
    );

    const page = {
      id: realId,
      slug,
      title: body.title || slug,
      content: body.content || "",
      updatedAt: Date.now()
    };

    await env.WIKI_DB.put(realId, JSON.stringify(page));

    return Response.json(page);
  }

  // =========================
  // DELETE
  // =========================
  if (match && request.method === "DELETE") {
    const id = match[1];

    const raw = await env.WIKI_DB.get(id);

    if (!raw) return new Response("Not found", { status: 404 });

    await env.WIKI_DB.delete(id);

    return new Response("deleted");
  }
}
