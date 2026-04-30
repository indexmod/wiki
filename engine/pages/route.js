import { renderMarkdown } from "../core/markdown.js";
import { getPage } from "../state.js";
import { layout } from "./layout.js";

export async function pageRoute(env, slug) {
  const page = await getPage(env, slug);

  if (!page) {
    return layout(env, {
      title: "Not Found",
      content: "<h1>404</h1><p>Page not found</p>",
      layout: "page"
    });
  }

  return layout(env, {
    title: page.title,
    content: renderMarkdown(page.content),
    layout: "page"
  });
}
