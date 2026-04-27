// FILE: worker.js (OBSIDIAN MODE)

function filePath(slug) {
  return `pages/${slug}.md`;
}

function safeText(v) {
  return typeof v === "string" ? v : "";
}

// =========================
// PARSER (FRONTMATTER OPTIONAL)
// =========================
function parse(md = "") {
  const match = md.match(/^---([\s\S]*?)---/);

  if (!match) {
    return { meta: {}, body: md };
  }

  const metaRaw = match[1] || "";
  const body = md.slice(match[0].length).trim();

  const meta = {};
  metaRaw.split("\n").forEach(line => {
    const i = line.indexOf(":");
    if (i === -1) return;

    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();

    if (k) meta[k] = v;
  });

  return { meta, body };
}

// =========================
// BUILD MARKDOWN
// =========================
function build({ title = "", slug = "" }, body = "") {
  return `---
title: ${title}
slug: ${slug}
updatedAt: ${Date.now()}
---

${body}`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // =========================
    // HEALTH CHECK
    // =========================
    if (path === "/__test") {
      return new Response("OK");
    }

    // =========================
    // LIST FILES (INDEX PAGE)
    // =========================
    if (path === "/api/pages") {
      const list = await env.PAGES.list();

      const pages = [];

      for (const obj of list.objects || []) {
        const file = await env.PAGES.get(obj.key);
        if (!file) continue;

        const { meta } = parse(file);

        const slug = obj.key
          .replace("pages/", "")
          .replace(".md", "");

        pages.push({
          slug,
          title: meta.title || slug
        });
      }

      return Response.json(pages);
    }

    // =========================
    // GET PAGE BY SLUG
    // =========================
    if (path.startsWith("/api/page/") && req.method === "GET") {
      const slug = path.split("/").pop();

      const file = await env.PAGES.get(filePath(slug));

      if (!file) {
        return new Response("not found", { status: 404 });
      }

      const { meta, body } = parse(file);

      return Response.json({
        slug,
        title: meta.title || slug,
        content: body
      });
    }

    // =========================
    // SAVE PAGE
    // =========================
    if (path.startsWith("/api/page/") && req.method === "POST") {
      const slug = path.split("/").pop();

      let data = {};
      try {
        data = await req.json();
      } catch {}

      const finalSlug =
        (data.slug || data.title || slug || "page")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const md = build(
        {
          title: safeText(data.title),
          slug: finalSlug
        },
        safeText(data.content)
      );

      await env.PAGES.put(filePath(finalSlug), md);

      return Response.json({
        slug: finalSlug,
        title: data.title,
        content: data.content
      });
    }

    // =========================
    // PAGE ROUTING (/mars)
    // =========================
    if (
      !path.startsWith("/api") &&
      !path.startsWith("/__") &&
      !path.includes(".")
    ) {
      const slug = path.slice(1);

      const file = await env.PAGES.get(filePath(slug));

      if (!file) {
        return env.ASSETS.fetch(req);
      }

      const { meta, body } = parse(file);

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
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // =========================
    // STATIC
    // =========================
    return env.ASSETS.fetch(req);
  }
};
