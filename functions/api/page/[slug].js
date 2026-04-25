export async function onRequestGet({ params, env }) {
  const data = await env.WIKI_DB.get(params.slug);

  if (!data) return new Response("Not found", { status: 404 });

  return new Response(data);
}
