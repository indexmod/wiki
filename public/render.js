export function renderHTML(base, { title, content, nav }) {
  return base
    .replace("{{title}}", title || "")
    .replace("{{content}}", content || "")
    .replace("{{nav}}", nav || "");
}
