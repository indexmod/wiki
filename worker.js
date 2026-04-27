// FILE: worker.js (OBSIDIAN MODE STABLE)

function path(slug) {
  return `pages/${slug}.md`;
}

// =========================
// FRONTMATTER PARSER
// =========================
function parse(md = "") {
  const match = String(md).match(/^---([\s\S]*?)---\n?/);

  if (!match) {
    return { meta: {}, body: md };
  }

  const meta = {};

  match[1]
    .split("\n")
    .forEach(line => {
      const i = line.indexOf(":");
      if (i === -1) return;

      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();

      if (k) meta[k] = v;
    });

  return {
    meta,
    body: md.slice(match[0].length).trim()
  };
}

// =========================
// MARKDOWN BUILDER
// =========================
function build(meta, body) {
  return `---
title: ${meta.title || ""}
slug: ${meta.slug || ""}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

// =========================
// SLUGIFY
// =========================
function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// WORKER
// =========================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    try {

      // =========================
      // TEST
      // =========================
      if (pathname === "/__test") {
        return new Response("OK");
      }

      // =========================
      // INDEX
      // =========================
      if (pathname === "/api/pages") {
        const list = await env.PAGES.list();

        const pages = [];

        for (const obj of list.objects || []) {
          if (!obj?.key) continue;

          const slug = obj.key
            .replace("pages/", "")
            .replace(".md", "");

          if (!slug || slug === "undefined") continue;

          pages.push({
            slug,
            title: slug
          });
        }

        return Response.json(pages);
      }

      // =========================
      // GET PAGE
      // =========================
      if (pathname.startsWith("/api/page/") && req.method === "GET") {
        const slug = pathname.split("/").pop();

        if (!slug) {
          return new Response("bad slug", { status: 400 });
        }

        const obj = await env.PAGES.get(path(slug));

        if (!obj) {
          return new Response("not found", { status: 404 });
        }

        const md = await obj.text();
        const { meta, body } = parse(md);

        return Response.json({
          slug,
          title: meta.title || slug,
          content: body
        });
      }

      // =========================
      // SAVE PAGE
      // =========================
      if (pathname.startsWith("/api/page/") && req.method === "POST") {
        const urlSlug = pathname.split("/").pop();

        let data = {};
        try {
          data = await req.json();
        } catch {}

        const slug = slugify(
          data.slug || data.title || urlSlug || "page"
        );

        if (!slug) {
          return new Response("invalid slug", { status: 400 });
        }

        const md = build(
          {
            title: data.title,
            slug
          },
          data.content || ""
        );

        await env.PAGES.put(path(slug), md);

        return Response.json({
          slug,
          title: data.title || slug
        });
      }

      // =========================
      // ROUTER (/slug)
      // =========================
      if (
        !pathname.startsWith("/api") &&
        !pathname.startsWith("/__") &&
        !pathname.includes(".")
      ) {
        const slug = pathname.slice(1);

        if (!slug) {
          return env.ASSETS.fetch(req);
        }

        const obj = await env.PAGES.get(path(slug));

        if (!obj) {
          return env.ASSETS.fetch(req);
        }

        const md = await obj.text();
        const { meta, body } = parse(md);

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

  <a href="/editor.html?slug=${slug}"
     style="position:fixed;top:20px;right:20px;">
    edit
  </a>
</body>
</html>
        `, {
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      }

      // =========================
      // FALLBACK
      // =========================
      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response(
        "WORKER ERROR: " + (err?.message || err),
        { status: 500 }
      );
    }
  }
};
