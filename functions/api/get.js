export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  const data = await env.WIKI_DB.get(slug);

  return new Response(data || "{}");
}
