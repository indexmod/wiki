import { getPage } from "../core/state.js";
import { renderMarkdown } from "../core/markdown.js";
import { layout } from "../core/layout.js";
import { pageView } from "../../views/page.js";

export async function pageRoute(env, slug) {
  const page = await getPage(env, slug);

  if (!page) {
    return layout(env, {
      title: "404",
      content: "<h1>Not found</h1>",
      layout: "page"
    });
  }

  return layout(env, {
    title: page.title,
    content: pageView(
      page.title,
      renderMarkdown(page.content)
    ),
    layout: "page"
  });
}
