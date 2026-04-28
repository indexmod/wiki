export async function handleRoute(req, env, path) {

  // ================= INDEX =================
  if (path === "/" || path === "/index") {

    const pages = (await listPages(env))
      .filter(p => p.slug !== "index");

    const tpl = await layout(env, "index");

    const html = tpl
      .replaceAll("{{title}}", "IndexMod")
      .replaceAll("{{content}}", renderIndex(pages));

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }

  // ================= PAGE =================
  if (!path.startsWith("/api") && !path.includes(".")) {

    const slug = path.slice(1);

    const page = await getPage(env, slug);
    if (!page) return null;

    const tpl = await layout(env, "page");

    const html = tpl
      .replaceAll("{{title}}", page.title)
      .replaceAll("{{slug}}", page.slug)
      .replaceAll("{{content}}", render(page.content));

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }

  return null;
}
