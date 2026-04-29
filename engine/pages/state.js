// ===============================
// ENGINE: PAGES
// FILE: state.js
// PURPOSE: page data loader (R2 / DB layer)
// ===============================


/* ===============================
   SLUG NORMALIZATION
=============================== */

function normalizeSlug(slug) {
  if (!slug) return null;

  return slug
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\.md$/g, "")        // убираем markdown хвост
    .replace(/\s+/g, "-")         // пробелы → дефис
    .replace(/[^a-z0-9\-]/g, ""); // только безопасные символы
}


/* ===============================
   GET PAGE (READ)
=============================== */

export async function getPage(env, slug) {
  try {
    const key = normalizeSlug(slug);
    if (!key) return null;

    const obj = await env.PAGES.get(key);

    if (!obj) return null;

    let data;

    try {
      data = await obj.json();
    } catch (e) {
      console.log("[PAGE PARSE ERROR]", e);
      return null;
    }

    // ===============================
    // CONTRACT NORMALIZATION
    // ===============================
    return {
      slug: key,
      title: data?.title || key,
      content: data?.content || "",

      createdAt: data?.createdAt || null,
      updatedAt: data?.updatedAt || null
    };

  } catch (e) {
    console.log("[GET PAGE ERROR]", e);
    return null;
  }
}


/* ===============================
   SAVE PAGE (WRITE)
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
      title: data?.title ?? existing?.title ?? key,
      content: data?.content ?? existing?.content ?? "",

      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    await env.PAGES.put(key, JSON.stringify(payload), {
      httpMetadata: {
        contentType: "application/json"
      }
    });

    return {
      ok: true,
      data: payload
    };

  } catch (e) {
    console.log("[SAVE PAGE ERROR]", e);

    return {
      ok: false,
      error: e.message
    };
  }
}
