import { getPages } from "../state.js";
import { layout } from "./layout.js";

function formatTitle(slug) {
  return slug.replace(/-/g, " ");
}

export async function indexRoute(env) {
  const pages = await getPages(env);

  const html = `
    <div class="index-wrap">
      ${pages.map(p => `
        <a class="index-item" href="/${p.name}">
          ${formatTitle(p.name)}
        </a>
      `).join("")}
    </div>
  `;

  return layout(env, {
    title: "Index",
    content: html,
    layout: "index"
  });
}
