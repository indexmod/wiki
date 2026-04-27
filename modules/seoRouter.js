export async function seoRouter(req, env) {
  const url = new URL(req.url);
  const slug = url.pathname.slice(1);

  const file = await env.PAGES.get(`pages/${slug}.md`);

  if (!file) return new Response("not found", { status: 404 });

  const match = file.match(/^---([\s\S]*?)---/);
  const metaRaw = match?.[1] || "";
  const content = file.replace(match?.[0] || "", "").trim();

  const meta = Object.fromEntries(
    metaRaw.split("\n").map(l => l.split(":").map(s => s.trim())).filter(Boolean)
  );

  return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${meta.title || slug}</title>
</head>
<body style="font-family:Georgia;max-width:800px;margin:60px auto;">
  <h1>${meta.title || slug}</h1>
  <article>${content}</article>

  <a href="/editor.html?slug=${slug}">edit</a>
</body>
</html>
  `, {
    headers: {"Content-Type":"text/html"}
  });
}
