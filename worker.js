function encodePath(id) {
  return `pages/${id}.md`;
}

function safeParse(md = "") {
  const match = md.match(/^---([\s\S]*?)---/);
  if (!match) return { meta: {}, body: md };

  const metaRaw = match[1] || "";
  const body = md.slice(match[0].length).trim();

  const meta = {};
  metaRaw.split("\n").forEach(line => {
    const parts = line.split(":");
    if (!parts[0]) return;
    meta[parts[0].trim()] = (parts.slice(1).join(":") || "").trim();
  });

  return { meta, body };
}

function build(meta, body) {
  return `---
id: ${meta.id || ""}
slug: ${meta.slug || ""}
title: ${meta.title || ""}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname || "/";

    try {

      // ================= TEST =================
      if (path === "/__test") {
        return new Response("OK");
      }

      // ================= LIST =================
      if (path === "/api/pages") {
        const list = await env.PAGES.list();

        const objects = list?.objects || [];

        const pages = [];

        for (const obj of objects) {
          if (!obj?.key) continue;

          const file = await env.PAGES.get(obj.key);
          if (!file) continue;

          const { meta } = safeParse(file);

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
        const id = path.split("/").pop() || "";

        const file = await env.PAGES.get(encodePath(id));

        if (!file) {
          return new Response("not found", { status: 404 });
        }

        const { meta, body } = safeParse(file);

        return Response.json({
          id: meta.id,
          slug: meta.slug,
          title: meta.title,
          content: body
        });
      }

      // ================= SAVE =================
      if (path.startsWith("/api/page/") && req.method === "POST") {
        const id = path.split("/").pop() || crypto.randomUUID();

        let body = {};
        try {
          body = await req.json();
        } catch {}

        const slug = slugify(body.slug || body.title || id);

        const md = build(
          {
            id,
            slug,
            title: body.title || slug
          },
          body.content || ""
        );

        await env.PAGES.put(encodePath(id), md);

        return Response.json({
          id,
          slug,
          title: body.title || slug,
          content: body.content || ""
        });
      }

      // ================= ROUTER =================
      if (
        !path.startsWith("/api") &&
        !path.startsWith("/__") &&
        !path.includes(".")
      ) {
        const slug = path.slice(1);

        const list = await env.PAGES.list();
        const objects = list?.objects || [];

        for (const obj of objects) {
          if (!obj?.key) continue;

          const file = await env.PAGES.get(obj.key);
          if (!file) continue;

          const { meta, body } = safeParse(file);

          if (meta.slug === slug) {
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
        }

        return env.ASSETS.fetch(req);
      }

      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response("WORKER ERROR: " + err?.message, { status: 500 });
    }
  }
};
