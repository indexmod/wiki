export async function editorLayout(env) {
  const res = await env.ASSETS.fetch(
    new Request("https://internal/layouts/editor.html")
  );

  if (!res.ok) {
    throw new Error("editor layout missing");
  }

  return await res.text();
}
