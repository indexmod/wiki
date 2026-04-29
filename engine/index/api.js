// ===============================
// ENGINE: INDEX
// FILE: api.js
// PURPOSE: load page list from R2
// ===============================

export async function getIndexPages(env) {
  try {
    const list = await env.PAGES.list();

    const pages = await Promise.all(
      list.keys.map(async (k) => {
        try {
          const obj = await env.PAGES.get(k.name);
          return obj ? await obj.json() : null;
        } catch {
          return null;
        }
      })
    );

    return pages.filter(Boolean);

  } catch (e) {
    console.log("[INDEX API ERROR]", e);
    return [];
  }
}
