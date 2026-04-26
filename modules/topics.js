export async function topicsAPI(request, env) {
  if (request.method === "GET") {
    const text = await env.WIKI_DB.get("__topics__") || "";
    return new Response(text);
  }

  if (request.method === "POST") {
    const text = await request.text();
    await env.WIKI_DB.put("__topics__", text);
    return new Response("ok");
  }

  return new Response("Method not allowed", { status: 405 });
}
