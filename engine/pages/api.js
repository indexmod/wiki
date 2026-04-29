// =========================================================
// ENGINE STATE: PAGES API LAYER
// STATUS:
// ✔ single source of truth storage key
// ✔ strict slug normalization
// ✔ unified page schema
// ✔ safe JSON parsing
// ✔ read-layer stability fixed
//
// STORAGE CONTRACT:
// env.PAGES key = "pages/{slug}"
// =========================================================


/* ===============================
   SLUG NORMALIZER (GLOBAL CONTRACT)
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
   PAGE SCHEMA NORMALIZER
=============================== */

function normalizePage(data, slug) {
  const cleanSlug = normalizeSlug(slug);

  return {
    slug: cleanSlug,
    title: data?.title || cleanSlug,
    content: data?.content || "",
    createdAt: data?.createdAt || null,
    updatedAt: data?.updatedAt || null
  };
}


/* ===============================
   GET PAGE (READ)
=============================== */

export async function getPage(env, slug) {
  try {

    const cleanSlug = normalizeSlug(slug);

    if (!cleanSlug) return null;

    // ===============================
    // SINGLE STORAGE CONTRACT
    // ===============================
    const key = `pages/${cleanSlug}`;

    const obj = await env.PAGES.get(key);

    if (!obj) return null;

    try {
      const data = await obj.json();
      return normalizePage(data, cleanSlug);

    } catch (parseErr) {
      console.log("[PAGE API JSON ERROR]", parseErr);
      return null;
    }

  } catch (e) {
    console.log("[PAGE API ERROR]", e);
    return null;
  }
}


/* ===============================
   OPTIONAL: RAW FETCH (DEBUG / ADMIN USE)
=============================== */

export async function getRawPage(env, slug) {
  try {
    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) return null;

    const key = `pages/${cleanSlug}`;
    const obj = await env.PAGES.get(key);

    if (!obj) return null;

    return await obj.text();

  } catch (e) {
    console.log("[PAGE RAW ERROR]", e);
    return null;
  }
}
