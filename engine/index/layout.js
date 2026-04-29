// ===============================
// ENGINE: INDEX
// FILE: layout.js
// PURPOSE: index html shell loader
// ===============================

export async function layout(env) {
  const url = new URL("/layouts/index.html", "https://internal");

  const res = await env.ASSETS.fetch(new Request(url));

  if (!res.ok) {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>INDEX ENGINE - LAYOUT ERROR</title>
</head>
<body>
  <h1>INDEX ENGINE: layout missing</h1>
</body>
</html>`;
  }

  return await res.text();
}
