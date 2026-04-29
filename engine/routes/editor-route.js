export async function editorRoute(env) {
  return new Response("EDITOR ROUTE OK", {
    headers: { "content-type": "text/plain" }
  });
}
