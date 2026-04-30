import { getPages } from "../state.js";
import { layout } from "../layout.js";

export async function editorRoute(env) {
  return layout(env, {
    title: "Editor",
    content: `
      <div class="editor">
        <h1>Editor</h1>
        <p>Editor engine placeholder</p>
      </div>
    `,
    layout: "editor"
  });
}
