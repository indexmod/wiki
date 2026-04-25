export async function onRequestPost({ request, env }) {
  const { slug, title, content } = await request.json();

  const page = {
    title,
    content,
    updated: Date.now()
  };

  await env.WIKI_DB.put(slug, JSON.stringify(page));

  return new Response("saved");
}
