export async function onRequestGet({ env }) {
  const list = await env.WIKI_DB.list();

  return new Response(JSON.stringify(list.keys));
}
