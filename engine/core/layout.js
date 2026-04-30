// =========================================================
// CORE: LAYOUT (SINGLE ENTRY POINT)
// =========================================================

export async function layout(env, { title, content, layout = "page" }) {

  const res = await env.ASSETS.fetch(
    new Request(new URL("/layouts/base.html", "http://internal"))
  );

  const html = await res.text();

  return html
    .replace("{{title}}", title || "")
    .replace("{{content}}", content || "")
    .replace("{{layout}}", layout)
    .replace("{{styles}}", `<link rel="stylesheet" href="/styles/${layout}.css">`)
    .replace("{{nav}}", layout === "index"
      ? `<a href="/editor">+ New</a>`
      : `<a href="/">← Index</a>`
    );
}
