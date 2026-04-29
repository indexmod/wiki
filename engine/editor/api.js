// ===============================
// ENGINE: EDITOR
// FILE: api.js
// PURPOSE: editor data operations (save/load)
// ===============================


/* ===============================
   INTERNAL: SLUG NORMALIZATION
=============================== */

function normalizeSlug(slug) {
  if (!slug) return null;

  return slug
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}


/* ===============================
   LOAD
=============================== */

export async function loadPage(env, slug) {
  try {
    const key = normalizeSlug(slug);
    if (!key) return null;

    const obj = await env.PAGES.get(key);
    if (!obj) return null;

    const data = await obj.json();

    // STABLE CONTRACT
    return {
      slug: key,
      title: data?.title || "",
      content: data?.content || "",
      createdAt: data?.createdAt || Date.now(),
      updatedAt: data?.updatedAt || Date.now()
    };

  } catch (e) {
    console.log("[EDITOR LOAD ERROR]", e);
    return null;
  }
}


/* ===============================
   SAVE
=============================== */

export async function savePage(env, slug, data) {
  try {
    const key = normalizeSlug(slug);
    if (!key) {
      throw new Error("INVALID SLUG");
    }

    const existingRaw = await env.PAGES.get(key);
    let existing = null;

    if (existingRaw) {
      try {
        existing = await existingRaw.json();
      } catch {
        existing = null;
      }
    }

    const payload = {
      slug: key,
      title: data?.title ?? existing?.title ?? "",
      content: data?.content ?? existing?.content ?? "",

      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
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

    return { ok: true, data: payload };

  } catch (e) {
    console.log("[EDITOR SAVE ERROR]", e);
    return { ok: false, error: e.message };
  }
}
