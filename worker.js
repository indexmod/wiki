// FILE: worker.js (HARDENED R2 WIKI CORE)

function pathOf(slug) {
  return `pages/${slug}.md`;
}

// =========================
// SAFE FRONTMATTER PARSER
// =========================
function parse(md = "") {
  try {
    const text = String(md);

    const match = text.match(/^---([\s\S]*?)---\n?/);
    if (!match) return { meta: {}, body: text };

    const meta = {};
    const raw = match[1] || "";

    raw.split("\n").forEach(line => {
      const i = line.indexOf(":");
      if (i === -1) return;

      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();

      if (k) meta[k] = v;
    });

    const body = text.slice(match[0].length).trim();

    return { meta, body };
  } catch (e) {
    return { meta: {}, body: "" };
  }
}

// =========================
// BUILD MARKDOWN
// =========================
function build(meta = {}, body = "") {
  return `---
id: ${meta.id || ""}
slug: ${meta.slug || ""}
title: ${meta.title || ""}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

// =========================
// SLUG NORMALIZER
// =========================
function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
// FETCH
// =========================
export default {
  async fetch(req, env) {
    try {
      const url = new URL(req.url);
      const path = url.pathname || "/";

      // ================= TEST =================
      if (path === "/__test") {
        return new Response("OK");
      }

      // ================= LIST =================
      if (path === "/api/pages") {
        const list = await env.PAGES.list();

        const pages = [];

        for (const obj of list.objects || []) {
          if (!obj?.key) continue;

          const file = await env.PAGES.get(obj.key);
          if (!file) continue;

          const { meta } = parse(file);

          pages.push({
            id: meta.id || obj.key,
            slug: meta.slug || "",
            title: meta.title || ""
          });
        }

        return Response.json(pages);
      }

      // ================= GET PAGE =================
      if (path.startsWith("/api/page/") && req.method === "GET") {
        const slug = path.split("/").pop() || "";

        const file = await env.PAGES.get(pathOf(slug));

        if (!file) return new Response("not found", { status: 404 });

        const { meta, body } = parse(file);

        return Response.json({
          id: meta.id,
          slug: meta.slug,
          title: meta.title,
          content: body
        });
      }

      // ================= SAVE PAGE =================
      if (path.startsWith("/api/page/") && req.method === "POST") {
        const slugFromUrl = path.split("/").pop() || "";

        let body = {};
        try {
          body = await req.json();
        } catch {
          body = {};
        }

        const slug = slugify(
          body.slug || body.title || slugFromUrl || "page"
        );

        const id = body.id || crypto.randomUUID();

        const md = build(
          {
            id,
            slug,
            title: body.title
          },
          body.content
        );

        await env.PAGES.put(pathOf(slug), md);

        return Response.json({
          id,
          slug,
          title: body.title,
          content: body.content
        });
      }

      // ================= ROUTER (PAGES) =================
      if (
        req.method === "GET" &&
        !path.startsWith("/api") &&
        !path.startsWith("/__") &&
        !path.includes(".")
      ) {
        const slug = path.slice(1);

        const file = await env.PAGES.get(pathOf(slug));

        if (!file) return env.ASSETS.fetch(req);

        const { meta, body } = parse(file);

        return new Response(
`<!doctype html>
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
</html>`,
          {
            headers: {
              "Content-Type": "text/html; charset=utf-8"
            }
          }
        );
      }

      // ================= FALLBACK =================
      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response(
        "WORKER ERROR: " + (err?.message || "unknown"),
        { status: 500 }
      );
    }
  }
};
