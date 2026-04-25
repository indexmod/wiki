export function parseDocument(markdown) {
  const lines = markdown.split("\n");

  let title = null;
  let body = [];
  let links = [];

  for (const line of lines) {
    // TITLE (первый текстовый заголовок)
    if (!title && !line.startsWith("#") && line.trim()) {
      title = line.trim();
    }

    // LINKS
    const linkMatch = line.match(/\[(\d+)\]\s*(https?:\/\/\S+)/);
    if (linkMatch) {
      links.push({
        id: linkMatch[1],
        url: linkMatch[2],
      });
    }

    body.push(line);
  }

  return {
    title: title || "untitled",
    body: body.join("\n"),
    links,
    meta: {
      wordCount: markdown.split(/\s+/).length,
      linkCount: links.length,
    },
  };
}

export function toHTML(doc) {
  return `
    <article>
      <h1>${doc.title}</h1>
      <div class="content">
        ${doc.body}
      </div>
    </article>
  `;
}
