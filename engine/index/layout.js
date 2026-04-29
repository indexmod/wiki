// ===============================
// ENGINE: INDEX
// FILE: layout.js
// PURPOSE: index html shell loader
// ===============================

export async function layout(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/base.html")
  );

  return await res.text();
}
