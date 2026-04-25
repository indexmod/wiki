export async function onRequest({ params, env }) {
  const raw = await env.WIKI_DB.get(params.slug);

  if (!raw) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(raw, {
    headers: { "Content-Type": "application/json" },
  });
}
