// =========================================================
// PARSER — FRONTMATTER + MARKDOWN
// =========================================================
// задача:
// - разделить frontmatter и тело
// - превратить meta в объект
// - вернуть чистую структуру страницы
// =========================================================

export function parseMD(raw = "") {

  // =====================================================
  // 1. ПРОВЕРКА: есть ли frontmatter
  // =====================================================
  // ожидаем формат:
  //
  // ---
  // key: value
  // ---
  // content
  //

  if (!raw.startsWith("---")) {
    return {
      id: null,
      title: "Untitled",
      slug: "",
      content: raw.trim()
    };
  }

  // =====================================================
  // 2. РАЗДЕЛЯЕМ НА ЧАСТИ
  // =====================================================

  const parts = raw.split("---");

  // parts:
  // [ "", "\nmeta\n", "\ncontent" ]

  if (parts.length < 3) {
    return {
      id: null,
      title: "Untitled",
      slug: "",
      content: raw.trim()
    };
  }

  const metaBlock = parts[1];
  const body = parts.slice(2).join("---");
  // важно: чтобы не ломалось если --- есть в тексте

  // =====================================================
  // 3. ПАРСИНГ META
  // =====================================================

  const meta = {};

  metaBlock.split("\n").forEach(line => {

    const clean = line.trim();
    if (!clean) return;

    // делим только по ПЕРВОМУ :
    const idx = clean.indexOf(":");
    if (idx === -1) return;

    const key = clean.slice(0, idx).trim();
    const value = clean.slice(idx + 1).trim();

    meta[key] = value;
  });

  // =====================================================
  // 4. ВОЗВРАЩАЕМ СТРУКТУРУ
  // =====================================================

  return {
    id: meta.id || null,
    title: meta.title || "Untitled",
    slug: meta.slug || "",
    content: body.trim()
  };
}
