// ===============================
// ENGINE: PAGES
// FILE: api.js
// PURPOSE: page data loader (R2 / DB layer)
// ===============================

export async function getPage(env, slug) {
  try {
    // ===============================
    // BASIC SANITIZATION (IMPORTANT)
    // ===============================
    if (!slug || typeof slug !== "string") return null;

    // убираем случайные слэши
    const cleanSlug = slug.replace(/^\/+|\/+$/g, "");

    // ===============================
    // LOAD FROM R2
    // ===============================
    const obj = await env.PAGES.get(cleanSlug);

    if (!obj) return null;

    // ===============================
    // SAFE JSON PARSE
    // ===============================
    try {
      return await obj.json();
    } catch (parseErr) {
      console.log("[PAGE API JSON ERROR]", parseErr);
      return null;
    }

  } catch (e) {
    console.log("[PAGE API ERROR]", e);
    return null;
  }
}
