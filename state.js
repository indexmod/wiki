// =========================================================
// STATE — DATA LAYER (R2)
// =========================================================

import { parseMD } from "./parser.js";


// =========================================================
// GET ALL PAGES (FIXED)
// =========================================================

export async function getAllPages(env) {
  const list = await env.PAGES.list();

  const pages = [];

  for (const obj of list.keys || []) {

    const filename = obj.name; // rosa.md

    const raw = await env.PAGES.get(filename);
    if (!raw) continue;

    const text = await raw.text();

    const parsed = parseMD(text);

    pages.push({
      id: parsed.id,
      title: parsed.title,
      slug: parsed.slug,
      content: parsed.content
    });
  }

  return pages;
}

// ================= FIND BY SLUG =================
export async function findBySlug(env, slug) {
  const pages = await getAllPages(env);
  return pages.find(p => p.slug === slug);
}


/// =========================================================
// SAVE PAGE (FIXED)
// =========================================================

export async function savePage(env, { title, slug, content }) {

  // стабильный id
  const id = crypto.randomUUID();

  // нормализуем slug
  const cleanSlug = slug
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const md = `---
id: ${id}
title: ${title}
slug: ${cleanSlug}
---

${content}
`;

  // 🔥 КЛЮЧ = SLUG (а не id)
  await env.PAGES.put(`${cleanSlug}.md`, md);

  return { id, slug: cleanSlug };
}
