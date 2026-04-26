/**
 * IndexMod Slug Core
 * единая система идентификации
 */

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

// transliteration (RU → EN)
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

// detect person (very simple heuristic)
function isPerson(text) {
  return text.trim().split(/\s+/).length === 2;
}

// SMART slug (main entry point)
function smartSlug(text) {
  if (!text) return "";

  if (isPerson(text)) {
    return text
      .trim()
      .split(/\s+/)
      .map(translit)
      .reverse()
      .join("-");
  }

  return slugify(text);
}
