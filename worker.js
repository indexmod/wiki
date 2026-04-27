function encodePath(slug) {
  return `pages/${slug}.md`;
}

// =========================
// FRONTMATTER PARSER
// =========================
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

// =========================
// FRONTMATTER BUILDER
// =========================
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
    // TEST
    // =========================
    if (path === "/__test") {
      return new Response("WORKER OK");
    }

    // =========================
    // DEBUG LIST RAW R2 FILES
    // =========================
    if (path === "/__list") {
      const list = await env.PAGES.list();
      return Response.json(list);
    }

    // =========================
    // API: LIST PAGES
    // =========================
    if (req.method === "GET" && path === "/api/pages") {
      const list = await env.PAGES.list();

      const pages = await Promise.all(
        list.objects.map(async (obj) => {
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

    // =========================
    // API: GET PAGE
    // =========================
    if (req.method === "GET" && path.startsWith("/api/page/")) {
      const slug = path.split("/").pop();

      const file = await env.PAGES.get(encodePath(slug));

      if (!file) {
        return new Response("not found", { status: 404 });
      }

      const { meta, body } = parseFrontmatter(file);

      return Response.json({
        id: meta.id,
        slug: meta.slug,
        title: meta.title,
        content: body
      });
    }

    // =========================
    // API: SAVE PAGE
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
    // 🧠 SLUG ROUTER (ВАЖНОЕ ИСПРАВЛЕНИЕ)
    // =========================
    if (
      req.method === "GET" &&
      !path.startsWith("/api") &&
      !path.startsWith("/__") &&
      !path.includes(".")
    ) {
      const slug = path.slice(1);

      const file = await env.PAGES.get(encodePath(slug));

      // fallback → index.html
      if (!file) {
        return env.ASSETS.fetch(req);
      }

      const { meta, body } = parseFrontmatter(file);

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

  <p>
    <a href="/editor.html?slug=${slug}">edit</a>
  </p>
</body>
</html>
      `, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // =========================
    // FALLBACK → STATIC ASSETS
    // =========================
    return env.ASSETS.fetch(req);
  }
};
