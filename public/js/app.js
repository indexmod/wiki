async function load() {
  const res = await fetch("/api/pages");
  const data = await res.json();

  const list = document.getElementById("list");

  list.innerHTML = data.map(p =>
    `<div>
      <a href="/view.html?slug=${p.slug}">
        ${p.title}
      </a>
    </div>`
  ).join("");
}

load();
