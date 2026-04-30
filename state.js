export async function getPage(env, slug) {
  const raw = await env.PAGES.get(slug);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return { title: slug, content: raw };
  }
}

export async function getPages(env) {
  const list = await env.PAGES.list();
  return (list.keys || []).map(k => k.name).sort();
}
