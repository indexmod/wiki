// ===============================
// ENGINE: PAGES
// FILE: api.js
// PURPOSE: page data loader (R2 / DB layer)
// ===============================


/* ===============================
   SHARED SLUG NORMALIZER
   (must match state.js)
=============================== */

function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") return null;

  return slug
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}


/* ===============================
   GET PAGE
=============================== */

export async function getPage(env, slug) {
  try {

    const cleanSlug = normalizeSlug(slug);

    if (!cleanSlug) return null;

    const obj = await env.PAGES.get(cleanSlug);

    if (!obj) return null;

    try {
      const data = await obj.json();

      return {
        slug: cleanSlug,
        title: data?.title || cleanSlug,
        content: data?.content || "",
        createdAt: data?.createdAt || null,
        updatedAt: data?.updatedAt || null
      };

    } catch (parseErr) {
      console.log("[PAGE API JSON ERROR]", parseErr);
      return null;
    }

  } catch (e) {
    console.log("[PAGE API ERROR]", e);
    return null;
  }
}
