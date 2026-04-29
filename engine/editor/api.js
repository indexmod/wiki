// ===============================
// ENGINE: EDITOR
// FILE: api.js
// PURPOSE: editor data operations (save/load)
// ===============================

export async function savePage(env, slug, data) {
  try {
    await env.PAGES.put(slug, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    console.log("[EDITOR SAVE ERROR]", e);
    return { ok: false, error: e.message };
  }
}

export async function loadPage(env, slug) {
  try {
    const obj = await env.PAGES.get(slug);
    if (!obj) return null;

    return await obj.json();
  } catch (e) {
    console.log("[EDITOR LOAD ERROR]", e);
    return null;
  }
}
