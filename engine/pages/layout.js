// ===============================
// ENGINE: PAGES
// FILE: layout.js
// PURPOSE: page html shell loader
// ===============================

export async function layout(env) {
  try {
    const url = new URL("/layouts/page.html", "https://internal");

    const res = await env.ASSETS.fetch(new Request(url));

    // ===============================
    // HARD FAIL SAFE CHECK
    // ===============================
    if (!res || !res.ok) {
      return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>PAGE ENGINE - LAYOUT ERROR</title>
  <link rel="stylesheet" href="/styles/base.css">
</head>
<body>
  <h1>PAGE ENGINE: layout missing</h1>
</body>
</html>`;
    }

    return await res.text();

  } catch (err) {
    // ===============================
    // CATCH RUNTIME FAIL (1101 PREVENTION)
    // ===============================
    console.log("[PAGES LAYOUT ERROR]", err);

    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>PAGE ENGINE - CRASH</title>
</head>
<body>
  <h1>PAGE ENGINE CRASH</h1>
  <pre>${err?.message || err}</pre>
</body>
</html>`;
  }
}
