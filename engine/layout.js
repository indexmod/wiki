// =========================================================
// CORE LAYOUT ENGINE
// ROLE: single HTML shell injector
// =========================================================

export async function layout(env, { title, content, layout = "page", nav = "" }) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/base.html")
  );

  const html = await res.text();

  return html
    .replace("{{title}}", title || "")
    .replace("{{content}}", content || "")
    .replace("{{layout}}", layout)
    .replace("{{nav}}", nav);
}
