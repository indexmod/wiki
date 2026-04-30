import { layout } from "./layout.js";
import { getPages } from "./state.js";
import { indexView } from "../../views/index.js";

export async function indexRoute(env) {
  const pages = await getPages(env);

  const content = indexView(pages);

  return layout(env, {
    title: "Index",
    content,
    layout: "index"
  });
}
