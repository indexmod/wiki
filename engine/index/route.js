import { indexView } from "./view.js";
import { layout } from "../layout.js";

export async function indexRoute(env) {
  const pages = await getPages(env);

  const list = pages.map(p => `<a href="/${p.name}">${p.name}</a>`).join("");

  const html = indexView(list);

  return layout(env, {
    title: "Index",
    content: html,
    layout: "index"
  });
}
