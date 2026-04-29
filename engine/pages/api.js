// ===============================
// ENGINE: PAGE
// FILE: api.js
// PURPOSE: page data loader (R2 / DB layer)
// ===============================

export async function getPage(env, slug) {
  try {
    // пример: R2 storage
    const obj = await env.PAGES.get(slug);

    if (!obj) return null;

    return await obj.json();

  } catch (e) {
    console.log("[PAGE API ERROR]", e);
    return null;
  }
}
