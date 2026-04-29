// ===============================
// ENGINE: EDITOR
// FILE: state.js
// PURPOSE: editor data operations (save/load)
// ===============================

/**
 * Normalize slug to safe key for R2
 */
function normalizeSlug(slug) {
  if (!slug) return null;

  return slug
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/**
 * Load page data from R2
 */
export async function loadPage(env, slug) {
  try {
    const key = normalizeSlug(slug);

    if (!key) return null;

    const obj = await env.PAGES.get(key);

    if (!obj) return null;

    return await obj.json();

  } catch (e) {
    console.log("[EDITOR LOAD ERROR]", e);
    return null;
  }
}

/**
 * Save page data to R2
 * data = { title, content, updatedAt? }
 */
export async function savePage(env, slug, data) {
  try {
    const key = normalizeSlug(slug);

    if (!key) {
      throw new Error("INVALID SLUG");
    }

    const payload = {
      slug: key,
      title: data?.title || "",
      content: data?.content || "",
      updatedAt: Date.now(),
      createdAt: data?.createdAt || Date.now()
    };

    await env.PAGES.put(
      key,
      JSON.stringify(payload),
      {
        httpMetadata: {
          contentType: "application/json"
        }
      }
    );

    return payload;

  } catch (e) {
    console.log("[EDITOR SAVE ERROR]", e);
    throw e;
  }
}

/**
 * Delete page (future use)
 */
export async function deletePage(env, slug) {
  try {
    const key = normalizeSlug(slug);

    if (!key) return false;

    await env.PAGES.delete(key);

    return true;

  } catch (e) {
    console.log("[EDITOR DELETE ERROR]", e);
    return false;
  }
}
