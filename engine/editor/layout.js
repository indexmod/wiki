export async function editorLayout(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/editor.html")
  );

  if (!res.ok) {
    throw new Error("EDITOR_LAYOUT_MISSING");
  }

  return await res.text();
}
