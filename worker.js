function encodePath(id) {
  return `pages/${id}.md`;
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
// MARKDOWN BUILDER
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

// =========================
function normalizeSlug(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================
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
    // DEBUG LIST RAW
    // =========================
    if (path === "/__list") {
      return Response.json(await env.PAGES.list());
    }

    // =========================
    // LIST PAGES
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
    // GET PAGE (BY ID)
    // =========================
    if (req.method === "GET" && path.startsWith("/api/page/")) {
      const id = path.split("/").pop();

      const file = await env.PAGES.get(encodePath(id));

      if (!file) return new Response("not found", { status: 404 });

      const { meta, body } = parseFrontmatter(file);

      return Response.json({
        id: meta.id,
        slug: meta.slug,
        title: meta.title,
        content: body
      });
    }

    // =========================
    // SAVE PAGE (BY ID)
    // =========================
    if (req.method === "POST" && path.startsWith("/api/page/")) {
      const idFromUrl = path.split("/").pop();

      let body = {};
      try {
        body = await req.json();
      } catch {}

      const id = body.id || idFromUrl || crypto.randomUUID();

      const slug = normalizeSlug(body.slug || body.title || id);

      const md = buildMarkdown(
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

    // =========================
    // SLUG ROUTER (PUBLIC PAGE)
    // =========================
    if (
      req.method === "GET" &&
      !path.startsWith("/api") &&
      !path.startsWith("/__") &&
      !path.includes(".")
    ) {
      const slug = path.slice(1);

      const list = await env.PAGES.list();

      for (const obj of list.objects) {
        const file = await env.PAGES.get(obj.key);
        if (!file) continue;

        const { meta, body } = parseFrontmatter(file);

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

    // =========================
    // FALLBACK STATIC
    // =========================
    return env.ASSETS.fetch(req);
  }
};
