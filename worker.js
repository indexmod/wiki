// FILE: worker.js (CLEAN OBSIDIAN MODE)

function file(slug) {
  return `pages/${slug}.md`;
}

function safe(md = "") {
  const m = String(md).match(/^---([\s\S]*?)---\n?/);
  if (!m) return { meta: {}, body: md };

  const meta = {};
  m[1].split("\n").forEach(l => {
    const i = l.indexOf(":");
    if (i === -1) return;
    meta[l.slice(0,i).trim()] = l.slice(i+1).trim();
  });

  return {
    meta,
    body: md.slice(m[0].length).trim()
  };
}

function build(meta, body) {
  return `---
title: ${meta.title || ""}
slug: ${meta.slug || ""}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

function slugify(s="") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // ================= INDEX =================
    if (path === "/api/pages") {
      const list = await env.PAGES.list();

      const pages = [];

      for (const obj of list.objects || []) {
        const slug = obj.key
          .replace("pages/","")
          .replace(".md","");

        if (!slug) continue;

        pages.push({ slug, title: slug });
      }

      return Response.json(pages);
    }

    // ================= GET PAGE =================
    if (path.startsWith("/api/page/") && req.method === "GET") {
      const slug = path.split("/").pop();

      const file = await env.PAGES.get(file(slug));

      if (!file) return new Response("not found", { status: 404 });

      const { meta, body } = safe(file);

      return Response.json({
        slug,
        title: meta.title || slug,
        content: body
      });
    }

    // ================= SAVE =================
    if (path.startsWith("/api/page/") && req.method === "POST") {
      const urlSlug = path.split("/").pop();

      let body = {};
      try { body = await req.json(); } catch {}

      const slug = slugify(body.slug || body.title || urlSlug);

      const md = build(
        { title: body.title, slug },
        body.content
      );

      await env.PAGES.put(file(slug), md);

      return Response.json({ slug });
    }

    // ================= ROUTE =================
    if (!path.startsWith("/api") && !path.includes(".")) {
      const slug = path.slice(1);

      const fileContent = await env.PAGES.get(file(slug));

      if (!fileContent) return env.ASSETS.fetch(req);

      const { meta, body } = safe(fileContent);

      return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${meta.title || slug}</title>
</head>
<body style="font-family:Georgia;max-width:800px;margin:60px auto;">
  <h1>${meta.title || slug}</h1>
  <article>${body}</article>

  <a href="/editor.html?slug=${slug}" style="position:fixed;top:20px;right:20px;">
    edit
  </a>
</body>
</html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    }

    return env.ASSETS.fetch(req);
  }
};
