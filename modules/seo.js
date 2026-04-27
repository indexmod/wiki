// FILE: modules/seo.js (ZERO-INDEX CLEAN VERSION)

function isPageKey(key) {
  return key.startsWith("p_");
}

export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  // =========================
  // LOAD ALL PAGES (NO INDEX MODE)
  // =========================
  const keys = await env.WIKI_DB.list();

  const pagesRaw = await Promise.all(
    keys.keys
      .map(k => k.name)
      .filter(isPageKey)
      .map(id => env.WIKI_DB.get(id))
  );

  const pages = pagesRaw
    .filter(Boolean)
    .map(p => JSON.parse(p));

  // =========================
  // FIND BY SLUG
  // =========================
  const page = pages.find(p => p.slug === slug);

  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  // =========================
  // RENDER PAGE
  // =========================
  return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${page.title}</title>
<link rel="canonical" href="https://${url.host}/${page.slug}">
</head>

<body style="font-family: Georgia; padding:60px; max-width:900px; margin:auto;">
  <h1>${page.title}</h1>
  <article>${page.content || page.html || ""}</article>

  <p>
    <!-- FIXED: new editor model -->
    <a href="/${page.slug}?edit=1">Edit</a>
  </p>
</body>
</html>
  `, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
