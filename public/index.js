grid.innerHTML = Object.keys(groups).sort().map(letter => `
  <div>
    <div class="letter">${letter}</div>

    ${groups[letter].map(p => `
      <div class="page">
        ${
          p.exists
            // ✅ SSR route
            ? `<a class="exists" href="/${p.slug}">${p.title}</a>`

            // ✅ передаём title в editor
            : `<a class="missing" href="/editor.html?slug=${p.slug}&title=${encodeURIComponent(p.title)}">${p.title}</a>`
        }
      </div>
    `).join("")}
  </div>
`).join("");
