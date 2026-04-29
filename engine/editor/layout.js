// ===============================
// ENGINE: EDITOR
// FILE: layout.js
// PURPOSE: editor html shell loader (uses BASE LAYOUT)
// ===============================

export async function layout(env) {
  const url = new URL("/layouts/base.html", "https://internal");

  const res = await env.ASSETS.fetch(new Request(url));

  if (!res.ok) {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>EDITOR ENGINE - LAYOUT ERROR</title>
</head>
<body>
  <h1>EDITOR ENGINE: base layout missing</h1>
</body>
</html>`;
  }

  return await res.text();
}
