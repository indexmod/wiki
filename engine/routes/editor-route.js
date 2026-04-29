import * as LAYOUTS from "../layouts.js";
import { renderEditor } from "../renders/editor-render.js";

export async function editorRoute(env) {
  const tpl = await LAYOUTS.layout(env, "editor");

  const content = renderEditor();

  return tpl
    .replaceAll("{{title}}", "Editor")
    .replaceAll("{{layout}}", "editor")
    .replaceAll("{{nav}}", `<a href="/" class="ui-link">Back</a>`)
    .replaceAll("{{content}}", content);
}
