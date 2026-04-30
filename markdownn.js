export function toHTML(md = "") {
  return md
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
    .replace(/\n/g, "<br>");
}
