import { getPages } from "./core/state.js";

export async function indexRoute(env) {
  const pages = await getPages(env);

  return `
    <div class="index-wrap">
      ${pages.map(p => `
        <a href="/${p.name}">
          ${p.name}
        </a>
      `).join("")}
    </div>
  `;
}
