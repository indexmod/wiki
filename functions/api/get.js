export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  const value = await env.WIKI_DB.get(key);

  return new Response(value || "");
}
