export async function onRequest({ env }) {
  const list = await env.WIKI_DB.list();

  const pages = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.WIKI_DB.get(k.name);
      const doc = raw ? JSON.parse(raw) : {};

      return {
        slug: k.name,
        title: doc.title || "untitled",
        content: doc.content || ""
      };
    })
  );

  return Response.json(pages);
}
