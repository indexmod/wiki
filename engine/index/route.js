import { getPages } from "../core/state.js";
import { layout } from "../core/layout.js";
import { indexView } from "../../views/index.js";

export async function indexRoute(env) {
  const pages = await getPages(env);

  return layout(env, {
    title: "Index",
    content: indexView(pages),
    layout: "index"
  });
}
