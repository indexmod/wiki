async function getPages() {
  const res = await fetch("/api/pages");
  if (!res.ok) throw new Error("Failed to load pages");
  return res.json();
}

async function getPage(slug) {
  const res = await fetch(`/api/page/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

async function savePage(slug, data) {
  const res = await fetch(`/api/page/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// =========================
// UI
// =========================
const listEl = document.getElementById("allList");
const editor = document.getElementById("editor");

let currentSlug = null;

// =========================
// RENDER INDEX
// =========================
async function renderIndex() {
  const pages = await getPages();

  listEl.innerHTML = "";

  pages.forEach((p) => {
    const el = document.createElement("div");
    el.className = "item";
    el.textContent = p.title || p.slug;

    el.onclick = () => openPage(p.slug);

    listEl.appendChild(el);
  });

  // create new button
  const newBtn = document.createElement("div");
  newBtn.className = "item";
  newBtn.textContent = "+ new page";

  newBtn.onclick = createPage;

  listEl.appendChild(newBtn);
}

// =========================
// OPEN PAGE
// =========================
async function openPage(slug) {
  const page = await getPage(slug);

  currentSlug = slug;

  document.querySelector(".main").classList.remove("hidden");
  document.getElementById("allView").classList.add("hidden");

  editor.innerHTML = page?.content || "";
}

// =========================
// CREATE PAGE
// =========================
async function createPage() {
  const slug = prompt("page slug?");
  if (!slug) return;

  const data = {
    title: slug,
    content: "",
  };

  await savePage(slug, data);

  await renderIndex();
  await openPage(slug);
}

// =========================
// AUTO SAVE
// =========================
editor.addEventListener("input", async () => {
  if (!currentSlug) return;

  await savePage(currentSlug, {
    title: currentSlug,
    content: editor.innerHTML,
  });
});

// =========================
// INIT
// =========================
export function bootstrap() {
  renderIndex();
}
