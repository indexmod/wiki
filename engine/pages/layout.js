// ===============================
// ENGINE: PAGE
// FILE: layout.js
// PURPOSE: page html shell loader
// ===============================

export async function layout(env) {
  const url = new URL("/layouts/page.html", "https://internal");

  const res = await env.ASSETS.fetch(new Request(url));

  if (!res.ok) {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>PAGE ENGINE - LAYOUT ERROR</title>
</head>
<body>
  <h1>PAGE ENGINE: layout missing</h1>
</body>
</html>`;
  }

  return await res.text();
}
