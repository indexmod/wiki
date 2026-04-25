async function loadIndex() {
  const res = await fetch("/api/pages");

  if (!res.ok) {
    document.getElementById("list").innerText = "Failed to load pages";
    return;
  }

  const pages = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  pages.forEach((page) => {
    const row = document.createElement("div");
    row.style.margin = "6px 0";

    // VIEW link
    const view = document.createElement("a");
    view.href = `/view.html?slug=${page.slug}`;
    view.textContent = page.title || page.slug;

    // EDIT link
    const edit = document.createElement("a");
    edit.href = `/editor.html?slug=${page.slug}`;
    edit.textContent = " [edit]";
    edit.style.marginLeft = "10px";

    row.appendChild(view);
    row.appendChild(edit);

    list.appendChild(row);
  });
}

// ----------------------
// NEW PAGE
// ----------------------
function initNewPage() {
  const btn = document.getElementById("newPage");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const title = prompt("Page title?");
    if (!title) return;

    const slug = title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    window.location.href = `/editor.html?slug=${slug}`;
  });
}

// ----------------------
// INIT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  initNewPage();
  loadIndex();
});
