export async function editorRoute(env) {
  try {
    const tpl = await layout(env, "editor");

    console.log("[EDITOR LAYOUT]", tpl);

    const content = renderEditor?.() ?? "<p>NO RENDER</p>";

    return tpl
      .replaceAll("{{title}}", "Editor")
      .replaceAll("{{layout}}", "editor")
      .replaceAll("{{nav}}", `<a href="/" class="ui-link">Back</a>`)
      .replaceAll("{{content}}", content);

  } catch (e) {
    console.log("[EDITOR CRASH]", e);

    return new Response("EDITOR ERROR: " + e.stack, { status: 500 });
  }
}
