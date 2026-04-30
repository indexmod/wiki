import { getPage } from "../core/state.js";
import { renderMarkdown } from "../core/markdown.js";

function escape(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function pagesRoute(env, slug) {
  const page = await getPage(env, slug);

  if (!page) {
    return `<h1>Not found</h1>`;
  }

  return `
    <article class="page">
      <h1>${escape(page.title)}</h1>
      ${renderMarkdown(page.content)}
    </article>
  `;
}
