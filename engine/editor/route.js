import { editorLayout } from "./layout.js";
import { renderEditor } from "./render.js";

export async function editorRoute(env) {
  try {
    const tpl = await editorLayout(env);
    const content = renderEditor();

    return tpl
      .replaceAll("{{title}}", "Editor")
      .replaceAll("{{layout}}", "editor")
      .replaceAll("{{nav}}", `<a href="/" class="ui-link">Back</a>`)
      .replaceAll("{{content}}", content);

  } catch (err) {
    return new Response("EDITOR ERROR: " + err.message, {
      status: 500
    });
  }
}
