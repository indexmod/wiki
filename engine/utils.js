export function file(slug) {
  return `pages/${slug}.md`;
}

export async function read(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (obj.text) return await obj.text();
  return String(obj);
}
