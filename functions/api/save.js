export async function onRequestPost({ request, env }) {
  const body = await request.json();

  await env.WIKI_DB.put(body.key, body.value);

  return new Response("saved");
}
