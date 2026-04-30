import { getPage, getPages } from "./state.js";
import { renderHTML } from "./render.js";
import { toHTML } from "./markdown.js";
import { getNav } from "./actions.js";

async function base(env) {
  const res = await env.ASSETS.fetch("/base.html");
  return await res.text();
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    const baseHTML = await base(env);

    // INDEX
    if (path === "/" || path === "/index") {
      const pages = await getPages(env);

      return new Response(
        renderHTML(baseHTML, {
          title: "Index",
          nav: getNav(path),
          content: pages
            .map(p => `<div><a href="/${p}">${p}</a></div>`)
            .join("")
        }),
        { headers: { "content-type": "text/html" } }
      );
    }

    // EDITOR
    if (path === "/editor") {
      return new Response(
        renderHTML(baseHTML, {
          title: "Editor",
          nav: getNav(path),
          content: `<textarea style="width:100%;height:300px"></textarea>`
        }),
        { headers: { "content-type": "text/html" } }
      );
    }

    // PAGE
    const slug = path.replace(/^\/+|\/+$/g, "");
    const page = await getPage(env, slug);

    if (!page) return new Response("Not found", { status: 404 });

    return new Response(
      renderHTML(baseHTML, {
        title: page.title,
        nav: getNav(path),
        content: toHTML(page.content)
      }),
      { headers: { "content-type": "text/html" } }
    );
  }
};
