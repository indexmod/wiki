<!-- FILE: seo.js -->

export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  // =========================
  // 1. FIND BY SLUG (resolve layer)
  // =========================
  const keys = await env.WIKI_DB.list();

  let page = null;

  for (const k of keys.keys) {
    const raw = await env.WIKI_DB.get(k.name);
    if (!raw) continue;

    try {
      const p = JSON.parse(raw);

      if (p.slug === slug) {
        page = p;
        break;
      }
    } catch {}
  }

  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  // =========================
  // 2. SAFE FIELDS
  // =========================
  const title = page.title || slug;
  const description = (page.content || "").slice(0, 140);
  const content = page.html || "";

  const canonical = `https://${url.host}/${page.slug}`;

  // =========================
  // 3. SEO HTML (clean)
  // =========================
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>${title}</title>

  <meta name="description" content="${escapeHtml(description)}">

  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg">

  <!-- OpenGraph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
</head>

<body style="font-family: Georgia; padding:60px; max-width:900px;">
  <h1>${title}</h1>
  <article>${content}</article>

  <p>
    <a href="/editor.html?slug=${page.slug}">Edit</a>
  </p>
</body>
</html>
`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}

// =========================
// HTML ESCAPE (важно для SEO безопасности)
// =========================
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
