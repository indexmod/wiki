export async function listPages(env) {
  try {
    if (!env?.PAGES) return [];

    const list = await env.PAGES.list();
    const pages = [];

    for (const obj of list.objects || []) {

      if (!obj.key.endsWith(".md")) continue;

      const raw = await env.PAGES.get(obj.key);
      if (!raw) continue;

      const md = await raw.text();

      const match = md.match(/^---([\s\S]*?)---/);

      let meta = {};

      if (match) {
        match[1].split("\n").forEach(line => {
          const i = line.indexOf(":");
          if (i === -1) return;

          const k = line.slice(0, i).trim();
          const v = line.slice(i + 1).trim();

          meta[k] = v;
        });
      }

      const slug =
        meta.slug ||
        obj.key.replace(/^pages\//, "").replace(/\.md$/, "");

      pages.push({
        slug,
        title: meta.title || slug
      });
    }

    return pages;

  } catch (err) {
    console.log("[PAGES ERROR]", err);
    return [];
  }
}

export async function getPage(env, slug) {
  try {
    if (!env?.PAGES) return null;

    const key = `pages/${slug}.md`;

    const raw = await env.PAGES.get(key);
    if (!raw) return null;

    const md = await raw.text();

    const match = md.match(/^---([\s\S]*?)---/);

    let meta = {};
    let content = md;

    if (match) {
      match[1].split("\n").forEach(line => {
        const i = line.indexOf(":");
        if (i === -1) return;

        const k = line.slice(0, i).trim();
        const v = line.slice(i + 1).trim();

        meta[k] = v;
      });

      content = md.replace(match[0], "").trimStart();
    }

    return {
      slug,
      title: meta.title || slug,
      content
    };

  } catch (e) {
    console.log("[GET PAGE ERROR]", e);
    return null;
  }
}
