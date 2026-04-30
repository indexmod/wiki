export function indexView(pages) {
  return `
<div class="index-wrap">
  ${pages.map(p => `
    <a class="index-item" href="/${p.name}">
      ${p.name}
    </a>
  `).join("")}
</div>
`;
}
import { getTopics } from "../core/state.js";

export async function indexRoute(env) {
  const topics = await getTopics(env);

  return `
    <div class="index">

      ${topics.map(t => `
        <section class="topic">
          <h2>${t.name}</h2>

          <div class="topic-list">
            ${t.pages.map(p => `
              <a href="/${p}">${p}</a>
            `).join("")}
          </div>
        </section>
      `).join("")}

    </div>
  `;
}
