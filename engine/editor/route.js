import { editorLayout } from "./layout.js";
import { renderEditor } from "./render.js";

export async function editorRoute(env) {
  const tpl = await editorLayout(env);
  const content = renderEditor();

  return tpl
    .replaceAll("{{title}}", "Editor")
    .replaceAll("{{nav}}", `<a href="/">Back</a>`)
    .replaceAll("{{content}}", content);
}
