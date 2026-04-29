// ===============================
// ENGINE: INDEX
// FILE: render.js
// PURPOSE: render index page UI
// ===============================

import { getIndexPages } from "./api.js";

export async function renderIndex(env) {
  const pages = await getIndexPages(env);

  return `
    <div class="index-header">
      <h1>INDEX ENGINE ACTIVE</h1>
      <img src="/logo.png" class="logo" />
      <a href="/editor" class="ui-link">OPEN EDITOR</a>
    </div>

    <div class="index-list">
      ${pages.length
        ? pages
            .map(
              (p) => `
                <a class="page-link" href="/${p.slug}">
                  ${p.title || p.slug}
                </a>
              `
            )
            .join("")
        : `<p class="muted">No pages found in PAGES bucket</p>`}
    </div>
  `;
}
