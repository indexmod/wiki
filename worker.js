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
    // DEBUG LIST
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
    // GET PAGE
    // =========================
    if (req.method === "GET" && path.startsWith("/api/page/")) {
      const slug = path.split("/").pop();

      const file = await env.PAGES.get(encodePath(slug));

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
    // SAVE PAGE
    // =========================
    if (req.method === "POST" && path.startsWith("/api/page/")) {
      const slugFromUrl = path.split("/").pop();
      const body = await req.json();

      const slug =
        body.slug ||
        body.title ||
        slugFromUrl ||
        "page";

      const cleanSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const id = body.id || crypto.randomUUID();

      const md = buildMarkdown(
        {
          id,
          slug: cleanSlug,
          title: body.title
        },
        body.content
      );

      await env.PAGES.put(encodePath(cleanSlug), md);

      return Response.json({
        id,
        slug: cleanSlug,
        title: body.title,
        content: body.content
      });
    }

    // =========================
    // SLUG ROUTER (PAGE VIEW)
    // =========================
    if (
      req.method === "GET" &&
      !path.startsWith("/api") &&
      !path.startsWith("/__") &&
      !path.includes(".")
    ) {
      const slug = path.slice(1);

      const file = await env.PAGES.get(encodePath(slug));

      if (!file) return env.ASSETS.fetch(req);

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
    // STATIC FALLBACK
    // =========================
    return env.ASSETS.fetch(req);
  }
};
