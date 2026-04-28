// FILE: worker.js (INDEXMOD LAYOUT ENGINE v1.5 STABLE INDEX FIX)

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

// ================= LAYOUT =================
async function layout(env, name) {
  try {
    const res = await env.ASSETS.fetch(
      new Request(new URL(`/layouts/${name}.html`, "http://internal"))
    );

    if (!res.ok) throw new Error("missing layout");

    return await res.text();
  } catch {
    return `
<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia;padding:40px">
  <h1>Layout missing: ${name}</h1>
</body>
</html>`;
  }
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

      // ================= EDITOR ROUTING =================
      if (path === "/editor.html") {
        return Response.redirect(new URL("/editor", req.url), 301);
      }

      if (path === "/editor/") {
        return Response.redirect(new URL("/editor", req.url), 301);
      }

      if (path === "/editor") {
        const tpl = await layout(env, "editor");

        return new Response(tpl, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache"
          }
        });
      }

      // ================= API LIST =================
      if (path === "/api/pages") {
        const list = await env.PAGES.list();
        const pages = [];

        for (const obj of list.objects || []) {
          const raw = await env.PAGES.get(obj.key);
          const md = await read(raw);
          const { meta } = parse(md);

          const slug =
            meta.slug ||
            obj.key.replace("pages/", "").replace(".md", "");

          if (slug === "index") continue;

          pages.push({
            slug,
            title: meta.title || slug
          });
        }

        return Response.json(pages);
      }

      // ================= GET PAGE =================
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

      // ================= SAVE PAGE =================
      if (path.startsWith("/api/page/") && req.method === "POST") {
        const slugRaw = path.split("/").pop();

        let data = {};
        try { data = await req.json(); } catch {}

        const slug = String(data.slug || data.title || slugRaw || "page")
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

        return Response.json({
          slug,
          title: data.title || slug
        });
      }

      // ================= PAGE ROUTING =================
      if (
        !path.startsWith("/api") &&
        !path.startsWith("/__") &&
        !path.includes(".") &&
        path !== "/editor"
      ) {
        const slug = path === "/" ? "index" : path.slice(1);

        // ================= INDEX AS LIST =================
        if (slug === "index") {
          const list = await env.PAGES.list();
          const pages = [];

          for (const obj of list.objects || []) {
            const raw = await env.PAGES.get(obj.key);
            const md = await read(raw);
            const { meta } = parse(md);

            const pageSlug =
              meta.slug ||
              obj.key.replace("pages/", "").replace(".md", "");

            if (pageSlug === "index") continue;

            pages.push({
              slug: pageSlug,
              title: meta.title || pageSlug
            });
          }

          const tpl = await layout(env, "index");

          const items = pages
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(p => `
              <div class="index-item">
                <a href="/${p.slug}">${p.title}</a>
              </div>
            `)
            .join("");

          const html = tpl.replaceAll(
            "{{content}}",
            `<div class="index-grid">${items}</div>`
          );

          return new Response(html, {
            headers: {
              "Content-Type": "text/html; charset=utf-8"
            }
          });
        }

        // ================= NORMAL PAGE =================
        const raw = await env.PAGES.get(file(slug));
        if (!raw) return env.ASSETS.fetch(req);

        const md = await read(raw);
        const { meta, body } = parse(md);

        const tpl = await layout(env, "page");

        const html = tpl
          .replaceAll("{{title}}", meta.title || slug)
          .replaceAll("{{slug}}", slug)
          .replaceAll("{{content}}", render(body));

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      }

      return env.ASSETS.fetch(req);

    } catch (err) {
      return new Response("WORKER ERROR: " + (err?.message || err), {
        status: 500
      });
    }
  }
};
