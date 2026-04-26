/**
 * IndexMod Slug Core
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
// CLEAN SLUG BASE
// =========================
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/["'«»()]/g, "")
    .replace(/[^a-z0-9а-яё\s-]/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// PERSON DETECTION (safer)
// =========================
function isPerson(text) {
  const words = text.trim().split(/\s+/);

  // только 2-3 слова (очень мягкое правило)
  return words.length === 2 || words.length === 3;
}

// =========================
// SMART SLUG (FINAL)
// =========================
function smartSlug(text) {
  if (!text) return "";

  const clean = text.trim();

  // -------------------------
  // PERSON CASE
  // -------------------------
  if (isPerson(clean)) {
    const parts = clean.split(/\s+/);

    const transliterated = parts.map(p => translit(p));

    // фамилия-имя (reversed)
    return transliterated.reverse().join("-");
  }

  // -------------------------
  // NORMAL CASE
  // -------------------------
  const transliterated = translit(clean);

  return slugify(transliterated);
}
