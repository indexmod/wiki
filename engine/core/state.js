// =========================================================
// STATE LAYER (CLEAN + PREDICTABLE)
// ROLE: single source of truth for pages/topics
// =========================================================

/* ================= PAGE ================= */

export async function getPage(env, slug) {
  const raw = await env.PAGES.get(slug);

  if (!raw) return null;

  // нормализуем структуру ВСЕГДА одинаково
  try {
    const parsed = JSON.parse(raw);

    return {
      slug,
      title: parsed.title || slug,
      content: parsed.content || ""
    };
  } catch {
    return {
      slug,
      title: slug,
      content: raw
    };
  }
}

/* ================= PAGES LIST ================= */

export async function getPages(env) {
  const list = await env.PAGES.list();

  const pages = (list?.keys || [])
    .map(k => k.name)
    .filter(Boolean);

  // важно: сортировка централизована здесь
  pages.sort((a, b) => a.localeCompare(b));

  // нормализуем формат (НЕ строки наружу)
  return pages.map(slug => ({
    slug,
    title: slug
  }));
}

/* ================= TOPICS LAYER ================= */
/*
   Сейчас: простая группировка
   Позже: можно добавить категории, теги, AI clustering
*/

export async function getTopics(env) {
  const pages = await getPages(env);

  const groups = {};

  for (const p of pages) {
    const first = (p.slug || p.title || "?")
      .charAt(0)
      .toUpperCase();

    if (!groups[first]) groups[first] = [];

    groups[first].push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, pages]) => ({
      id: letter,
      title: letter,
      pages
    }));
}
