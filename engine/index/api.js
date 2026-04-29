// ===============================
// ENGINE: INDEX
// FILE: api.js
// PURPOSE: list normalized slugs from R2
// ===============================

export async function listPages(env) {
  try {
    const res = await env.PAGES.list();

    if (!res || !res.objects) return [];

    return res.objects.map(obj => {
      let key = obj.key;

      // убрать папку
      key = key.replace(/^pages\//, "");

      // убрать расширение
      key = key.replace(/\.md$/, "");

      return key;
    });

  } catch (e) {
    console.log("[INDEX API ERROR]", e);
    return [];
  }
}
