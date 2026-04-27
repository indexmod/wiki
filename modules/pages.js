export async function pagesAPI(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/api\/page\/(.+)$/);

  // LIST
  if (pathname === "/api/pages" && request.method === "GET") {
    const keys = await env.WIKI_DB.list();

    const pages = await Promise.all(
      keys.keys.map(async (k) => {
        const value = await env.WIKI_DB.get(k.name);
        if (!value) return null;

        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
    );

    return Response.json(pages.filter(Boolean));
  }

  // GET
  if (match && request.method === "GET") {
    const slug = match[1];
    const value = await env.WIKI_DB.get(slug);

    if (!value) return new Response("Not found", { status: 404 });

    return Response.json(JSON.parse(value));
  }

  // SAVE
  if (match && request.method === "POST") {
    const slug = match[1];
    const body = await request.json();

    // 🔥 VERY IMPORTANT: markdown → html
    const html = body.content
      .replace(/\n/g, "<br>")
      .replace(/## (.*)/g, "<h2>$1</h2>");

    const page = {
      slug,
      title: body.title || slug,
      content: body.content || "",
      html,
      updatedAt: Date.now()
    };

    await env.WIKI_DB.put(slug, JSON.stringify(page));

    return Response.json(page);
  }

  // DELETE
  if (match && request.method === "DELETE") {
    const slug = match[1];
    await env.WIKI_DB.delete(slug);
    return new Response("deleted");
  }
}
