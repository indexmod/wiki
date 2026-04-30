// =========================================================
// WORKER — MINIMAL WIKI ENGINE (ПРОЗРАЧНАЯ ВЕРСИЯ)
// =========================================================

// ================= IMPORTS =================
// вся работа с данными
import { getAllPages, savePage, findBySlug } from "./state.js";

// рендер HTML оболочки
import { renderHTML } from "./render.js";

// markdown → html
import { toHTML } from "./markdownn.js";

// навигация (кнопка New / Save)
import { getNav } from "./actions.js";


// ================= HTML RESPONSE =================
// единая функция ответа
function html(body) {
  return new Response(body, {
    headers: { "content-type": "text/html" }
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
    // INDEX PAGE (/)
    // показывает список всех страниц
    // =====================================================
    if (path === "/") {

      const pages = await getAllPages(env);

      return html(renderHTML({
        title: "Index",
        nav: getNav("/"),

        // список страниц (title → slug)
        content: pages
          .map(p => `<a href="/${p.slug}">${p.title}</a>`)
          .join("<br>")
      }));
    }


    // =====================================================
    // EDITOR (/editor)
    // GET → форма
    // POST → сохранение
    // =====================================================
    if (path === "/editor") {

      // ---------- SAVE ----------
      if (req.method === "POST") {

        const form = await req.formData();

        const title = form.get("title") || "Untitled";
        const slug = form.get("slug");
        const content = form.get("content") || "";

        // защита от пустого slug
        if (!slug) {
          return new Response("Slug required", { status: 400 });
        }

        // сохраняем страницу (с frontmatter)
        await savePage(env, {
          title,
          slug,
          content
        });

        // редирект на страницу
        return Response.redirect(`/${slug}`);
      }

      // ---------- FORM ----------
      return html(renderHTML({
        title: "Editor",
        nav: getNav(path),

        // 👇 ВОТ ТВОЯ ФОРМА
        content: `
          <form method="POST">
            <input name="title" placeholder="Title"><br><br>
            <input name="slug" placeholder="Slug" required><br><br>
            <textarea name="content" placeholder="Markdown..."></textarea><br><br>
            <button>Save</button>
          </form>
        `
      }));
    }


    // =====================================================
    // PAGE (/slug)
    // рендер markdown страницы
    // =====================================================

    // убираем /
    const slug = path.replace(/^\/+/, "");

    // ищем страницу по slug
    const page = await findBySlug(env, slug);

    // если не нашли
    if (!page) {
      return new Response("Not found", { status: 404 });
    }

    // рендер страницы
    return html(renderHTML({
      title: page.title,
      nav: getNav(path),
      content: toHTML(page.content)
    }));
  }
};
