import { parseMD } from "./parser.js";


function uid() {
  return crypto.randomUUID();
}

// ================= SAVE =================

export async function savePage(env, { id, title, slug, content }) {
  if (!id) id = uid();

  const data = `---
id: ${id}
title: ${title}
slug: ${slug}
---

${content}
`;

  await env.PAGES.put(id, data);

  return id;
}

// ================= GET BY ID =================

export async function getPageById(env, id) {
  const raw = await env.PAGES.get(id);
  if (!raw) return null;

  return parseMD(raw);
}

// ================= GET ALL =================

export async function getAllPages(env) {
  const list = await env.PAGES.list();

  const pages = [];

  for (const key of list.keys) {
    const raw = await env.PAGES.get(key.name);
    const parsed = parseMD(raw);

    pages.push(parsed);
  }

  return pages;
}

// ================= FIND BY SLUG =================

export async function findBySlug(env, slug) {
  const pages = await getAllPages(env);
  return pages.find(p => p.slug === slug);
}
