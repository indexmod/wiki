import { getPage, getPages, savePage } from "./state.js";
import { renderHTML } from "./render.js";
import { toHTML } from "./markdownn.js";
import { getNav } from "./actions.js";

function html(body) {
  return new Response(body, {
    headers: { "content-type": "text/html" }
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // ================= INDEX =================
    if (path === "/") {
      const pages = await getPages(env);

      return html(renderHTML({
        title: "Index",
        nav: getNav(path),
        content: pages
          .map(p => `<a href="/${p}">${p}</a>`)
          .join("<br>")
      }));
    }

    // ================= EDITOR =================
    if (path === "/editor") {
      if (req.method === "POST") {
        const form = await req.formData();

        const slug = form.get("slug");
        const content = form.get("content");

        await savePage(env, slug, {
          title: slug,
          content
        });

        return Response.redirect(`/${slug}`);
      }

      return html(renderHTML({
        title: "Editor",
        nav: getNav(path),
        content: `
          <form method="POST">
            <input name="slug" placeholder="slug"><br><br>
            <textarea name="content"></textarea><br><br>
            <button>Save</button>
          </form>
        `
      }));
    }

    // ================= PAGE =================
    const slug = path.replace("/", "");
    const page = await getPage(env, slug);

    if (!page) {
      return new Response("Not found", { status: 404 });
    }

    return html(renderHTML({
      title: page.title,
      nav: getNav(path),
      content: toHTML(page.content)
    }));
  }
};
