import { file, read, parse } from "./utils.js";

export async function listPages(env) {
  const list = await env.PAGES.list();
  const pages = [];

  for (const obj of list.objects || []) {
    const raw = await env.PAGES.get(obj.key);
    const md = await read(raw);
    const { meta } = parse(md);

    const slug =
      meta.slug ||
      obj.key.replace("pages/", "").replace(".md", "");

    pages.push({
      slug,
      title: meta.title || slug
    });
  }

  return pages;
}

export async function getPage(env, slug) {
  const raw = await env.PAGES.get(file(slug));
  if (!raw) return null;

  const md = await read(raw);
  const { meta, body } = parse(md);

  return {
    slug,
    title: meta.title || slug,
    content: body
  };
}

export async function savePage(env, slugRaw, data) {
  const slug = String(data.slug || data.title || slugRaw || "page")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const md = `---
title: ${data.title || ""}
slug: ${slug}
updatedAt: ${Date.now()}
---

${data.content || ""}`;

  await env.PAGES.put(file(slug), md);

  return { slug, title: data.title || slug };
}
