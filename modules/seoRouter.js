function encode(id) {
  return `pages/${id}.md`;
}

async function readText(obj) {
  if (!obj) return null;
  return await obj.text();
}

function parse(md) {
  const m = md.match(/^---([\s\S]*?)---/);
  if (!m) return { meta: {}, body: md };

  const meta = {};
  m[1].split("\n").forEach(l => {
    const [k, ...v] = l.split(":");
    if (k) meta[k.trim()] = v.join(":").trim();
  });

  return {
    meta,
    body: md.slice(m[0].length).trim()
  };
}

function build(meta, body) {
  return `---
id: ${meta.id}
slug: ${meta.slug}
title: ${meta.title}
updatedAt: ${Date.now()}
---

${body || ""}`;
}

async function getIndex(env) {
  const file = await env.PAGES.get("index/index.json");
  if (!file) return {};
  return JSON.parse(await file.text());
}

async function saveIndex(env, index) {
  await env.PAGES.put("index/index.json", JSON.stringify(index));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    // ===================== TEST
    if (path === "/__test") {
      return new Response("OK");
    }

    // ===================== INDEX LIST (FAST)
    if (path === "/api/pages") {
      const index = await getIndex(env);

      const pages = Object.entries(index).map(([slug, id]) => ({
        slug,
        id
      }));

      return Response.json(pages);
    }

    // ===================== GET PAGE (FAST O(1))
    if (path.startsWith("/api/page/") && req.method === "GET") {
      const slug = path.split("/").pop();

      const index = await getIndex(env);
      const id = index[slug];

      if (!id) return new Response("not found", { status: 404 });

      const file = await env.PAGES.get(encode(id));
      if (!file) return new Response("not found", { status: 404 });

      const text = await file.text();
      const { meta, body } = parse(text);

      return Response.json({
        ...meta,
        content: body
      });
    }

    // ===================== SAVE PAGE (UPDATE INDEX)
    if (path.startsWith("/api/page/") && req.method === "POST") {
      const body = await req.json();

      const id = body.id || crypto.randomUUID();
      const slug = (body.slug || body.title || id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const md = build(
        {
          id,
          slug,
          title: body.title
        },
        body.content
      );

      await env.PAGES.put(encode(id), md);

      const index = await getIndex(env);
      index[slug] = id;
      await saveIndex(env, index);

      return Response.json({ id, slug });
    }

    // ===================== SLUG ROUTER (PUBLIC)
    if (
      !path.startsWith("/api") &&
      !path.startsWith("/__") &&
      !path.includes(".")
    ) {
      const slug = path.slice(1);

      const index = await getIndex(env);
      const id = index[slug];

      if (!id) return env.ASSETS.fetch(req);

      const file = await env.PAGES.get(encode(id));
      if (!file) return env.ASSETS.fetch(req);

      const text = await file.text();
      const { meta, body } = parse(text);

      return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${meta.title}</title>
</head>
<body style="font-family:Georgia;max-width:800px;margin:60px auto;">
  <h1>${meta.title}</h1>
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

    return env.ASSETS.fetch(req);
  }
};
