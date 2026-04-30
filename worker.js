import { getPage, getPages } from "./state.js";
import { renderHTML } from "./render.js";
import { toHTML } from "./markdownn.js";
import { getNav } from "./actions.js";

function layout(title, content, nav) {
  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <link rel="stylesheet" href="/styles/base.css">
    </head>
    <body>

      <header>
        <nav>${nav}</nav>
      </header>

      <main>
        ${content}
      </main>

    </body>
    </html>
  `;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // INDEX
    if (path === "/") {
      const pages = await getPages(env);

      return new Response(
        layout(
          "Index",
          pages.map(p => `<a href="/${p}">${p}</a>`).join(""),
          getNav(path)
        ),
        { headers: { "content-type": "text/html" } }
      );
    }

    // PAGE
    const slug = path.replace("/", "");
    const page = await getPage(env, slug);

    if (!page) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(
      layout(
        page.title,
        toHTML(page.content),
        getNav(path)
      ),
      { headers: { "content-type": "text/html" } }
    );
  }
};
