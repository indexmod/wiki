export async function onRequest({ request, env, params }) {
  const slug = params.slug;

  if (request.method === "GET") {
    const raw = await env.WIKI_DB.get(slug);
    if (!raw) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(raw, {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST") {
    const data = await request.json();

    await env.WIKI_DB.put(
      slug,
      JSON.stringify({
        title: data.title,
        content: data.content,
        updated: Date.now()
      })
    );

    return new Response("ok");
  }

  return new Response("Method Not Allowed", { status: 405 });
}
