// FILE: modules/pages.js

// =========================
// HELPERS
// =========================
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
// PAGES API (ID = CORE, SLUG = VIEW)
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
    const key = match[1];

    // ID first
    let raw = await env.WIKI_DB.get(key);

    // fallback slug
    if (!raw) {
      const id = await env.WIKI_DB.get("slug:" + key);
      if (id) raw = await env.WIKI_DB.get(id);
    }

    if (!raw) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE
  // =========================
  if (match && request.method === "POST") {
    const key = match[1];
    const body = await request.json();

    const isNew = key === "new";

    let id;

    if (isNew) {
      id = "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    } else {
      id = (await env.WIKI_DB.get("slug:" + key)) || key;
    }

    const raw = await env.WIKI_DB.get(id);
    const existing = raw ? JSON.parse(raw) : null;

    const slug = normalizeSlug(
      body.slug || existing?.slug || body.title
    );

    // удалить старый slug если изменился
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
    const key = match[1];

    const id = (await env.WIKI_DB.get("slug:" + key)) || key;
    const raw = await env.WIKI_DB.get(id);

    if (!raw) return new Response("Not found", { status: 404 });

    const page = JSON.parse(raw);

    await env.WIKI_DB.delete(id);
    await env.WIKI_DB.delete("slug:" + page.slug);

    return new Response("deleted");
  }
}
