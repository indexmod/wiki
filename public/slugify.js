/**
 * IndexMod Slug Core (STABLE VERSION)
 * единая система идентификации
 */

// =========================
// TRANSLIT (RU → EN)
// =========================
function translit(str) {
  const map = {
    а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e",
    ж:"zh", з:"z", и:"i", й:"y", к:"k", л:"l", м:"m",
    н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u",
    ф:"f", х:"h", ц:"ts", ч:"ch", ш:"sh", щ:"shch",
    ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya"
  };

  return str
    .toLowerCase()
    .split("")
    .map(c => map[c] ?? c)
    .join("");
}

// =========================
// CLEAN SLUG
// =========================
function slugify(text) {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/["'«»()]/g, "")
    .replace(/[^a-z0-9а-яё\s-]/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// PERSON DETECTION (SAFE)
// =========================
// ⚠️ НИКАКИХ "2-3 слова" — это ломало систему
function isPerson(text) {
  const words = text.trim().split(/\s+/);

  // строго 2 слова
  if (words.length !== 2) return false;

  // оба слова должны начинаться с заглавной
  return words.every(w => /^[A-ZА-ЯЁ]/.test(w));
}

// =========================
// SMART SLUG (FINAL)
// =========================
function smartSlug(text) {
  if (!text) return "";

  const clean = text.trim();

  // -------------------------
  // PERSON CASE (Иван Иванов → ivanov-ivan)
  // -------------------------
  if (isPerson(clean)) {
    return clean
      .split(/\s+/)
      .map(translit)
      .reverse()
      .join("-");
  }

  // -------------------------
  // NORMAL CASE (ВСЁ ОСТАЛЬНОЕ)
  // -------------------------
  return slugify(translit(clean));
}

// =========================
// AUTO TITLE (simple helper)
// =========================
function autoTitle(slug) {
  if (!slug) return "";

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
