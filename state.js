// =========================================================
// STATE — DATA LAYER (R2)
// =========================================================

import { parseMD } from "./parser.js";


// ================= GET ALL =================
export async function getAllPages(env) {
  const list = await env.PAGES.list();

  const pages = [];

  for (const key of list.objects || list.keys || []) {
    const name = key.name;

    const raw = await env.PAGES.get(name);
    if (!raw) continue;

    const parsed = parseMD(raw);

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


// ================= SAVE =================
export async function savePage(env, { title, slug, content }) {

  const id = crypto.randomUUID();

  const md = `---
id: ${id}
title: ${title}
slug: ${slug}
---

${content}
`;

  // сохраняем по id (а не slug!)
  await env.PAGES.put(id, md);

  return { id, slug };
}
