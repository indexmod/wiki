import { layout } from "../core/layout.js";
import { editorView } from "../../views/editor.js";

export async function editorRoute(env) {
  return layout(env, {
    title: "Editor",
    content: editorView(),
    layout: "editor"
  });
}
