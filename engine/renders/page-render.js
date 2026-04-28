import { render } from "../render.js";

export function renderPage(page) {
  return `
    <article class="page">
      <h1 class="page-title">${page.title}</h1>
      <div class="page-content">
        ${render(page.content || "")}
      </div>
    </article>
  `;
}
