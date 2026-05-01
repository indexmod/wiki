// =========================================================
// WORKER — MINIMAL WIKI ENGINE (STABLE v2)
// =========================================================


// ================= IMPORTS =================

// DATA LAYER (R2)
import { getAllPages, savePage, findBySlug } from "./state.js";

// HTML SHELL
import { renderHTML } from "./render.js";

// MARKDOWN → HTML
import { toHTML } from "./markdownn.js";

// NAVIGATION
import { getNav } from "./actions.js";


// =========================================================
// RESPONSE HELPER
// =========================================================

function html(body) {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}


// =========================================================
// MAIN ROUTER
// =========================================================

export default {
  async fetch(req, env) {

    const url = new URL(req.url);
    const path = url.pathname;


    // =====================================================
    // INDEX (/)
    // =====================================================
    if (path === "/") {

      const pages = await getAllPages(env);

      return html(renderHTML({
        title: "Index",
        nav: getNav("/"),

        content: pages.length
          ? pages
              .map(p => `<a href="/${p.slug}">${p.title}</a>`)
              .join("<br>")
          : `<p>No pages yet</p>`
      }));
    }


    // =====================================================
    // EDITOR (/editor)
    // =====================================================
    if (path === "/editor") {

      // ================= SAVE =================
      if (req.method === "POST") {

        const form = await req.formData();

        const title = form.get("title") || "Untitled";
        let slug = form.get("slug");
        const content = form.get("content") || "";

        // -------- slug sanitize --------
        if (!slug) {
          return new Response("Slug required", { status: 400 });
        }

        slug = slug
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");

        // -------- SAVE --------
        await savePage(env, {
          title,
          slug,
          content
        });

        // -------- REDIRECT --------
        return Response.redirect(`${url.origin}/${slug}`, 302);
      }


      // ================= FORM =================
      return html(renderHTML({
        title: "Editor",
        nav: getNav(path),

        content: `
          <form method="POST">
            <input name="title" placeholder="Title"><br><br>
            <input name="slug" placeholder="Slug" required><br><br>
            <textarea name="content" placeholder="Markdown..."></textarea><br><br>
            <button type="submit">Save</button>
          </form>
        `
      }));
    }


    // =====================================================
    // STATIC ASSETS (ВАЖНО)
    // =====================================================
    // чтобы стили реально работали
    if (path.startsWith("/styles") || path.startsWith("/favicon")) {
      return env.ASSETS.fetch(req);
    }


    // =====================================================
    // PAGE (/slug)
    // =====================================================

    const slug = path.replace(/^\/+/, "");

    const page = await findBySlug(env, slug);

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
