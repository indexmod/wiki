/// FILE: modules/seo.js

export async function seoRouter(request, env) {
  const url = new URL(request.url);
  const slug = url.pathname.slice(1);

  // =========================
  // 1. RESOLVE SLUG → ID (INDEX LAYER)
  // =========================
  const id = await env.WIKI_DB.get("slug:" + slug);

  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  // =========================
  // 2. LOAD BY ID (SOURCE OF TRUTH)
  // =========================
  const raw = await env.WIKI_DB.get(id);

  if (!raw) {
    return new Response("Not found", { status: 404 });
  }

  const page = JSON.parse(raw);

  // =========================
  // 3. SAFE FIELDS
  // =========================
  const title = escapeHtml(page.title || slug);
  const description = escapeHtml((page.content || "").slice(0, 140));
  const content = page.html || "";

  // canonical MUST be stable slug (but fallback-safe)
  const canonicalSlug = page.slug || slug;
  const canonical = `https://${url.host}/${canonicalSlug}`;

  // =========================
  // 4. SEO HTML
  // =========================
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>${title}</title>

  <meta name="description" content="${description}">

  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg">

  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
</head>

<body style="font-family: Georgia; padding:60px; max-width:900px;">
  <h1>${title}</h1>
  <article>${content}</article>

  <p>
    <a href="/editor.html?id=${page.id}">Edit</a>
  </p>
</body>
</html>
`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}

// =========================
// HTML ESCAPE (CRITICAL FIX)
// =========================
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
