export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  const raw = await env.WIKI_DB.get(slug);

  if (!raw) {
    return new Response("Not found", { status: 404 });
  }

  const page = JSON.parse(raw);

  const title = page.title || slug;
  const content = page.html || page.content || "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>

    <meta name="description" content="${(page.content || "").slice(0, 140)}">

    <link rel="icon" href="/favicon.svg">
  </head>

  <body style="font-family: Georgia; padding:60px; max-width:900px;">
    <h1>${title}</h1>
    <div>${content}</div>

    <p><a href="/editor.html?slug=${slug}">Edit</a></p>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
