import { parseMD } from "./parser.js";

// ================= GET ALL =================
export async function getAllPages(env) {
  const list = await env.PAGES.list();

  const pages = [];

  for (const item of list.keys || []) {
    const raw = await env.PAGES.get(item.name);
    if (!raw) continue;

    const text = await raw.text();
    const parsed = parseMD(text);

    pages.push(parsed);
  }

  return pages;
}


// ================= FIND BY SLUG (FIXED) =================
export async function findBySlug(env, slug) {
  const raw = await env.PAGES.get(`${slug}.md`);
  if (!raw) return null;

  const text = await raw.text();
  return parseMD(text);
}


// ================= SAVE (CRITICAL RULE) =================
export async function savePage(env, { title, slug, content }) {

  const id = crypto.randomUUID();

  const md = `---
id: ${id}
title: ${title}
slug: ${slug}
---

${content}
`;

  // ❗ ВСЕГДА КЛЮЧ = SLUG
  await env.PAGES.put(`${slug}.md`, md);

  return { id, slug };
}
