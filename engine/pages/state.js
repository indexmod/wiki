// ===============================
// ENGINE: PAGES
// FILE: state.js
// PURPOSE: page data loader (R2 / DB layer)
// ===============================


export function getPage(env, slug) {
  return env.PAGES.get(slug);
}
