export async function editorRoute(env) {
  let tpl;

  try {
    tpl = await layout(env, "editor");
  } catch (e) {
    return new Response("LAYOUT ERROR: " + e.message, { status: 500 });
  }

  if (!tpl) {
    return new Response("EMPTY LAYOUT", { status: 500 });
  }

  const content = renderEditor();

  return tpl
    .replaceAll("{{title}}", "Editor")
    .replaceAll("{{layout}}", "editor")
    .replaceAll("{{nav}}", `<a href="/" class="ui-link">Back</a>`)
    .replaceAll("{{content}}", content);
}
