export function render(md = "") {
  let html = String(md);

  // заголовки
  html = html.replace(/^### (.*)$/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gim, "<h1>$1</h1>");

  // ссылки
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    `<a href="$2">$1</a>`
  );

  // списки
  html = html.replace(/^\* (.*)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");

  // абзацы
  html = html.split("\n\n").map(p => `<p>${p}</p>`).join("");

  return html;
}
