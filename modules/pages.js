// FILE: modules/pages.js

function generateId() {
  return "p_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

// =========================
// LIST
// =========================
export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/(.+)$/);

  // =========================
  // LIST ALL PAGES
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
  // GET BY SLUG → RESOLVE ID
  // =========================
  if (match && request.method === "GET") {
    const slug = match[1];

    const id = await env.WIKI_DB.get("slug:" + slug);
    if (!id) return new Response("Not found", { status: 404 });

    const raw = await env.WIKI_DB.get(id);
    if (!raw) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(raw));
  }

  // =========================
  // SAVE (UPSERT)
  // =========================
  if (match && request.method === "POST") {
    const slug = match[1];
    const body = await request.json();

    // 1. проверяем есть ли slug → id
    let id = await env.WIKI_DB.get("slug:" + slug);

    if (!id) {
      id = generateId();
    }

    const page = {
      id,
      slug,
      title: body.title || slug,
      content: body.content || "",
      html: body.content || "",
      updatedAt: Date.now()
    };

    // 2. сохраняем страницу
    await env.WIKI_DB.put(id, JSON.stringify(page));

    // 3. обновляем индекс slug → id
    await env.WIKI_DB.put("slug:" + slug, id);

    return Response.json(page);
  }

  // =========================
  // DELETE
  // =========================
  if (match && request.method === "DELETE") {
    const slug = match[1];

    const id = await env.WIKI_DB.get("slug:" + slug);
    if (!id) return new Response("Not found", { status: 404 });

    await env.WIKI_DB.delete(id);
    await env.WIKI_DB.delete("slug:" + slug);

    return new Response("deleted");
  }
}
