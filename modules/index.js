// FILE: modules/seo.js

export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  // slug → id
  const id = await env.WIKI_DB.get("slug:" + slug);

  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const raw = await env.WIKI_DB.get(id);

  if (!raw) {
    return new Response("Not found", { status: 404 });
  }

  const page = JSON.parse(raw);

  const title = page.title || slug;
  const content = page.html || page.content || "";

  const canonical = `https://${url.host}/${slug}`;

  return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link rel="canonical" href="${canonical}">
</head>

<body style="font-family: Georgia; padding:60px; max-width:900px;">
  <h1>${title}</h1>
  <article>${content}</article>

  <p>
    <a href="/editor.html?id=${page.id}">Edit</a>
  </p>
</body>
</html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}// FILE: modules/pages.js

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
