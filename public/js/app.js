const list = document.getElementById("list");

async function load() {
  const res = await fetch("/api/pages");
  const pages = await res.json();

  list.innerHTML = pages.map(p => `
    <div>
      <a href="/view.html?slug=${p.slug}">
        ${p.title}
      </a>
    </div>
  `).join("");
}

load();
