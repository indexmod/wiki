// FILE: worker.js (INDEXMOD CLEAN STABLE)

function file(slug) {
  return `pages/${slug}.md`;
}

// =========================
// SAFE READ
// =========================
async function read(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (obj.text) return await obj.text();
  return String(obj);
}

// =========================
// FRONTMATTER
// =========================
function parse(md = "") {
  md = String(md);

  const match = md.match(/^---([\s\S]*?)---\n?/);

  if (!match) return { meta: {}, body: md };

  const meta = {};

  match[1].split("\n").forEach(line => {
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
// BUILD MD
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
// MINIMAL MARKDOWN RENDER
// =========================
function render(md = "") {
  let html = String(md);

  html = html.replace(/^### (.*)$/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gim, "<h1>$1</h1>");

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    `<a href="$2" target="_blank">$1</a>`
  );

  html = html.replace(/^\* (.*)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");

  html = html.replace(/\n{2,}/g, "</p><p>");
  html = `<p>${html}</p>`;

  return html;
}

// =========================
// WORKER
// =========================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {

      // ================= TEST =================
      if (path === "/__test") {
        return new Response("OK");
      }

      // ================= INDEX =================
      if (path === "/api/pages") {
        const list = await env.PAGES.list();

        const pages = [];

        for (const obj of list.objects || []) {
          if (!obj?.key) continue;

          const raw = await env.PAGES.get(obj.key);
          const md = await read(raw);

          const { meta } = parse(md);

          const slug = meta.slug ||
            obj.key.replace("pages/", "").replace(".md", "");

          if (!slug) continue;

          pages.push({
            slug,
            title: meta.title || slug
          });
        }

        return Response.json(pages);
      }

      // ================= GET =================
      if (path.startsWith("/api/page/") && req.method === "GET") {
        const slug = path.split("/").pop();

        const raw = await env.PAGES.get(file(slug));
        if (!raw) return new Response("not found", { status: 404 });

        const md = await read(raw);
        const { meta, body } = parse(md);

        return Response.json({
          slug,
          title: meta.title || slug,
          content: body
        });
      }

      // ================= SAVE =================
      if (path.startsWith("/api/page/") && req.method === "POST") {
        const urlSlug = path.split("/").pop();

        let data = {};
        try { data = await req.json(); } catch {}

        const slug = slugify(
          data.slug || data.title || urlSlug || "page"
        );

        const md = build(
          { title: data.title, slug },
          data.content
        );

        await env.PAGES.put(file(slug), md);

        return Response.json({
          slug,
          title: data.title || slug
        });
      }

      // ================= PAGE =================
      if (
        !path.startsWith("/api") &&
        !path.startsWith("/__") &&
        !path.includes(".")
      ) {
        const slug = path.slice(1);

        if (!slug) return env.ASSETS.fetch(req);

        const raw = await env.PAGES.get(file(slug));
        if (!raw) return env.ASSETS.fetch(req);

        const md = await read(raw);
        const { meta, body } = parse(md);

        return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${meta.title || slug}</title>
<link rel="icon" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.svg">
</head>
<body style="font-family:Georgia;max-width:800px;margin:60px auto;line-height:1.6;">

  <h1>${meta.title || slug}</h1>

  <article>${render(body)}</article>

  <a href="/editor.html?slug=${slug}"
     style="position:fixed;top:20px;right:20px;">
    edit
  </a>

</body>
</html>
        `, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      // ================= STATIC =================
      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response(
        "WORKER ERROR: " + (err?.message || err),
        { status: 500 }
      );
    }
  }
};
