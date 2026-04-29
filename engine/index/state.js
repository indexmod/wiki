// ===============================
// ENGINE: INDEX
// FILE: state.js (или прямо в render)
// PURPOSE: group pages A–Z
// ===============================

export function groupPages(pages = []) {
  const map = {};

  for (const p of pages) {
    const letter = (p[0] || "#").toUpperCase();

    if (!map[letter]) map[letter] = [];
    map[letter].push(p);
  }

  return Object.keys(map)
    .sort()
    .map(letter => ({
      letter,
      items: map[letter].sort()
    }));
}
