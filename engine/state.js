// =========================================================
// ENGINE STATE
// ROLE: unified data access layer (R2)
// =========================================================

export async function getPage(env, slug) {
  const raw = await env.PAGES.get(slug);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return {
      title: "Untitled",
      content: raw
    };
  }
}

export async function getPages(env) {
  const list = await env.PAGES.list();
  return list?.keys || [];
}
