// =========================================================
// ENGINE STATE: EDITOR STATE LAYER
// STATUS:
// ✔ R2 save/load implemented
// ✔ unified page schema
// ✔ safe serialization
// ✔ overwrite-ready model (CMS style)
// ✔ editor → pages sync layer
//
// NOTES:
// - This is the ONLY write layer for pages
// - key = normalized slug
// - data = { title, content, updatedAt }
// =========================================================


// ===============================
// NORMALIZE SLUG (must match all engines)
// ===============================
function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") return null;

  return slug
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/g, "");
}


// ===============================
// SERIALIZE PAGE
// ===============================
function serializePage(data = {}) {
  return {
    title: data.title || "Untitled page",
    content: data.content || "",
    updatedAt: Date.now()
  };
}


// ===============================
// SAVE PAGE (WRITE TO R2)
// ===============================
export async function savePage(env, slug, data) {
  try {

    const key = normalizeSlug(slug);

    if (!key) {
      return { ok: false, error: "INVALID_SLUG" };
    }

    const payload = serializePage(data);

    await env.PAGES.put(
      key,
      JSON.stringify(payload, null, 2)
    );

    return {
      ok: true,
      slug: key,
      updatedAt: payload.updatedAt
    };

  } catch (e) {
    console.log("[EDITOR SAVE ERROR]", e);

    return {
      ok: false,
      error: e?.message || "SAVE_FAILED"
    };
  }
}


// ===============================
// LOAD PAGE (READ FROM R2)
// ===============================
export async function loadPage(env, slug) {
  try {

    const key = normalizeSlug(slug);

    if (!key) return null;

    const obj = await env.PAGES.get(key);

    if (!obj) return null;

    try {
      return await obj.json();
    } catch (e) {
      console.log("[EDITOR LOAD PARSE ERROR]", e);
      return null;
    }

  } catch (e) {
    console.log("[EDITOR LOAD ERROR]", e);
    return null;
  }
}
