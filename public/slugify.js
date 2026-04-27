<!-- FILE: slugify.js -->

/**
 * IndexMod Slug Core (PERMALINK EDITABLE VERSION)
 * slug = suggestion only, NOT identity
 * ID must be used for uniqueness (outside this file)
 */

// =========================
// CLEAN SLUG (SUGGESTION ENGINE)
// =========================
function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/["'«»()]/g, "")
    .replace(/[^a-z0-9а-яё\s-]/gi, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// SMART SLUG (just wrapper)
// =========================
// ⚠️ теперь НЕ “умный”, а просто генератор предложения
function smartSlug(text = "") {
  if (!text) return "";

  return slugify(text);
}

// =========================
// AUTO TITLE (UI helper only)
// =========================
function autoTitle(slug = "") {
  if (!slug) return "";

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
