import { getTopics } from "../core/state.js";

export async function indexRoute(env) {
  const topics = await getTopics(env);

  return `
    <div class="index-wrap">

      ${topics.map(t => `
        <section class="topic">
          <h2 class="topic-title">${t.title}</h2>

          <div class="topic-list">
            ${t.pages.map(p => `
              <a class="index-item" href="/${p.slug}">
                ${p.title}
              </a>
            `).join("")}
          </div>

        </section>
      `).join("")}

    </div>
  `;
}
