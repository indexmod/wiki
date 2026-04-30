// =========================================================
// ENGINE STATE
// ROLE: unified data access layer (R2)
// =========================================================

export async function getPage(env, slug) {
  const raw = await env.PAGES.get(slug);
  return raw ? JSON.parse(raw) : null;
}

export async function getPages(env) {
  const list = await env.PAGES.list();
  return list.keys.map(k => k.name);
}
