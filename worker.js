// FILE: worker.js (R2 FILE-FIRST WIKI + DEBUG MODE)

function encodePath(slug) {
  return `pages/${slug}.md`;
}

function parseFrontmatter(md) {
  const match = md.match(/^---([\s\S]*?)---/);
  if (!match) return { meta: {}, body: md };

  const metaRaw = match[1];
  const body = md.slice(match[0].length).trim();

  const meta = {};
  metaRaw.split("\n").forEach(line => {
    const [k, ...v] = line.split(":");
    if (!k) return;
    meta[k.trim()] = v.join(":").trim();
  });

  return { meta, body };
}

function buildMarkdown(meta, body) {
  return `---
id: ${meta.id || ""}
slug: ${meta.slug || ""}
title: ${meta.title || ""}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // =========================
    // 🧪 TEST ROUTE (CHECK WORKER)
    // =========================
    if (path === "/__test") {
      return new Response("WORKER OK");
    }

    // =========================
    // 🧪 LIST RAW FILES (DEBUG R2)
    // =========================
    if (path === "/__list") {
      const list = await env.PAGES.list();
      return Response.json(list);
    }

    // =========================
    // GET PAGE BY SLUG
    // =========================
    if (req.method === "GET" && path.startsWith("/api/page/")) {
      const slug = path.split("/").pop();

      const file = await env.PAGES.get(encodePath(slug));

      if (!file) {
        return new Response("not found", { status: 404 });
      }

      const { meta, body } = parseFrontmatter(file);

      return Response.json({
        ...meta,
        content: body
      });
    }

    // =========================
    // SAVE PAGE
    // =========================
    if (req.method === "POST" && path.startsWith("/api/page/")) {
      const slug = path.split("/").pop();
      const body = await req.json();

      const id = body.id || crypto.randomUUID();

      const md = buildMarkdown(
        {
          id,
          slug,
          title: body.title
        },
        body.content
      );

      await env.PAGES.put(encodePath(slug), md);

      return Response.json({
        id,
        slug,
        title: body.title,
        content: body.content
      });
    }

    // =========================
    // INDEX
    // =========================
    if (req.method === "GET" && path === "/api/pages") {
      const list = await env.PAGES.list();

      const pages = await Promise.all(
        list.objects.map(async obj => {
          const file = await env.PAGES.get(obj.key);
          if (!file) return null;

          const { meta } = parseFrontmatter(file);

          return {
            id: meta.id,
            slug: meta.slug,
            title: meta.title
          };
        })
      );

      return Response.json(pages.filter(Boolean));
    }

    return new Response("404");
  }
};
