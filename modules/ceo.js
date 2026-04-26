export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  const value = await env.WIKI_DB.get(slug);

  if (!value) {
    return new Response("Not found", { status: 404 });
  }

  const page = JSON.parse(value);

  const html = `
<!doctype html>
<html>
<head>
  <title>${page.title}</title>
  <meta name="description" content="${(page.content || "").slice(0, 160)}">
  <meta property="og:title" content="${page.title}">
</head>
<body>
  <h1>${page.title}</h1>
  <div>${page.content}</div>
</body>
</html>
`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
