// =========================================================
// CORE LAYOUT ENGINE
// =========================================================

export async function layout(env, { title, content, layout = "page", nav = "" }) {

  const res = await env.ASSETS.fetch(
    new Request(new URL("/layouts/base.html", "http://internal"))
  );

  const html = await res.text();

  return html
    .replace("{{title}}", title || "")
    .replace("{{content}}", content || "")
    .replace("{{layout}}", layout)
    .replace("{{nav}}", nav);
}
