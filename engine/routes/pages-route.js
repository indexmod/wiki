import { getPage } from "./state.js";
import { renderMarkdown } from "./markdown.js";

export async function pageRoute(env, slug) {
  const page = await getPage(env, slug);

  if (!page) return "<h1>Not found</h1>";

  return `
    <article>
      <h1>${page.title}</h1>
      ${renderMarkdown(page.content)}
    </article>
  `;
}
