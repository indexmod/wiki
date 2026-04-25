export async function onRequest({ env }) {
  const list = await env.WIKI_DB.list();

  const pages = list.keys.map((k) => ({
    slug: k.name,
    title: k.name,
  }));

  return new Response(JSON.stringify(pages), {
    headers: { "Content-Type": "application/json" },
  });
}
