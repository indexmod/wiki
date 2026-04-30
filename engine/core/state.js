export async function getPage(env, slug) {
  const raw = await env.PAGES.get(slug);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return {
      title: slug,
      content: raw
    };
  }
}

/* ================= PAGES ================= */

export async function getPages(env) {
  const list = await env.PAGES.list();

  const pages = (list?.keys || [])
    .map(k => k.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return pages;
}

/* ================= TOPICS (REAL VERSION v1) ================= */
/*
   Сейчас:
   - один namespace (default)
   - но структура уже готова под расширение
*/

export async function getTopics(env) {
  const pages = await getPages(env);

  return [
    {
      name: "all",
      pages
    }
  ];
}
