// FILE: modules/seo.js

export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  const id = await env.WIKI_DB.get("slug:" + slug);
  if (!id) return new Response("Not found", { status: 404 });

  const raw = await env.WIKI_DB.get(id);
  if (!raw) return new Response("Not found", { status: 404 });

  const page = JSON.parse(raw);

  const title = page.title || slug;
  const content = page.html || page.content || "";

  return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link rel="canonical" href="https://${url.host}/${slug}">
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
}
