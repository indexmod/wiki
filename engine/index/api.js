// ===============================
// ENGINE: INDEX
// FILE: api.js
// PURPOSE: list pages from R2 bucket
// ===============================

export async function listPages(env) {
  try {
    const res = await env.PAGES.list();

    if (!res || !res.objects) {
      return [];
    }

    return res.objects.map(obj => obj.key);

  } catch (e) {
    console.log("[INDEX API ERROR]", e);
    return [];
  }
}
