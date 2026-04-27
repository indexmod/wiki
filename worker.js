function file(slug) {
  return `pages/${slug}.md`;
}

// ================= SAFE READ =================
async function read(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (obj.text) return await obj.text();
  return String(obj);
}

// ================= FRONTMATTER =================
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

// ================= MARKDOWN =================
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

  return html;
}

// ================= SIMPLE LAYOUT (NO ASSETS DEPENDENCY) =================
function layoutPage(title, content) {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="/styles.css">
</head>

<body class="layout-page">

<header>
  <a href="/" class="logo-wrap">
    <img src="/logo.png" class="logo">
  </a>

  <a class="edit" href="/editor">
    edit
  </a>
</header>

<main class="page">
  <h1>${title}</h1>
  <article>${content}</article>
</main>

</body>
</html>
  `;
}

// ================= WORKER =================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    try {

      // ================= TEST =================
      if (path === "/__test") {
        return new Response("OK");
      }

      // ================= EDITOR (SAFE SIMPLE PAGE) =================
      if (path === "/editor") {
        return new Response(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Editor</title>
<link rel="stylesheet" href="/styles.css">
</head>
<body class="layout-editor">

<header>
  <a href="/" class="logo-wrap">
    <img src="/logo.png" class="logo">
  </a>

  <a class="save" href="#">
    save
  </a>
</header>

<main>
  <textarea style="width:100%;height:70vh;font-size:18px;font-family:Georgia"></textarea>
</main>

</body>
</html>
        `, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      // ================= GET PAGE =================
      if (path.startsWith("/api/page/")) {
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
        const slugRaw = path.split("/").pop();

        let data = {};
        try { data = await req.json(); } catch {}

        const slug = String(data.slug || slugRaw || "page")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const md = `---
title: ${data.title || ""}
slug: ${slug}
updatedAt: ${Date.now()}
---

${data.content || ""}`;

        await env.PAGES.put(file(slug), md);

        return Response.json({ slug });
      }

      // ================= PAGE ROUTE =================
      if (!path.startsWith("/api") && !path.includes(".")) {
        const slug = path === "/" ? "index" : path.slice(1);

        const raw = await env.PAGES.get(file(slug));
        if (!raw) return env.ASSETS.fetch(req);

        const md = await read(raw);
        const { meta, body } = parse(md);

        return new Response(
          layoutPage(meta.title || slug, render(body)),
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }

      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response("WORKER ERROR: " + err.message, {
        status: 500
      });
    }
  }
};
