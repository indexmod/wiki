export function parseMD(raw = "") {
  const match = raw.match(/---([\s\S]*?)---([\s\S]*)/);

  if (!match) {
    return {
      id: null,
      title: "Untitled",
      slug: "",
      content: raw
    };
  }

  const meta = match[1];
  const body = match[2];

  const obj = {};

  meta.split("\n").forEach(line => {
    const [k, ...rest] = line.split(":");
    if (!k) return;
    obj[k.trim()] = rest.join(":").trim();
  });

  return {
    id: obj.id || null,
    title: obj.title || "Untitled",
    slug: obj.slug || "",
    content: body.trim()
  };
}
