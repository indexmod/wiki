export async function listPages(env) {
  const list = await env.PAGES.list();

  const pages = [];

  for (const obj of list.objects || []) {
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
      obj.key.replace("pages/", "").replace(".md", "");

    pages.push({
      slug,
      title: meta.title || slug
    });
  }

  return pages;
}
