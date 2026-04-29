// ===============================
// ENGINE: PAGES
// FILE: layout.js
// PURPOSE: page html shell loader
// ===============================

export async function layout(env) {
  try {

    // ===============================
    // SAFE ASSET FETCH (FIXED)
    // ===============================
    const res = await env.ASSETS.fetch(
      new Request("https://internal/layouts/page.html")
    );

    // ===============================
    // VALIDATION
    // ===============================
    if (!res || !res.ok) {
      throw new Error("PAGE LAYOUT NOT FOUND");
    }

    const html = await res.text();

    // ===============================
    // CONTRACT CHECK (CRITICAL)
    // ===============================
    if (!html || !html.includes("{{content}}")) {
      throw new Error("PAGE LAYOUT CONTRACT BROKEN");
    }

    return html;

  } catch (err) {
    console.log("[PAGES LAYOUT ERROR]", err);

    // ===============================
    // SAFE FALLBACK (UI SAFE)
    // ===============================
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Page Engine</title>
  <link rel="stylesheet" href="/styles/base.css">
</head>

<body class="layout-page">

<header class="site-header">
  <a href="/" class="ui-link">Index</a>
</header>

<main style="padding:40px;">
  <h1 style="font-family: Georgia;">Page Engine Error</h1>
  <pre>${err?.message || err}</pre>
</main>

</body>
</html>`;
  }
}
