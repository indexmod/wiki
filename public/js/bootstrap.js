import { markdownToHTML } from "./core/schema.js";

let currentSlug = null;
let isEdit = false;

const editor = document.getElementById("editor");
const list = document.getElementById("allList");

// --------------------
// LOAD INDEX
// --------------------
async function loadIndex() {
  const res = await fetch("/api/pages");
  const pages = await res.json();

  list.innerHTML = "";

  pages.forEach((p) => {
    const el = document.createElement("div");
    el.textContent = p.title || p.slug;

    el.onclick = () => openPage(p.slug);

    list.appendChild(el);
  });

  const btn = document.createElement("button");
  btn.textContent = "+ new page";
  btn.onclick = createPage;

  list.appendChild(btn);
}

// --------------------
// OPEN PAGE (VIEW)
// --------------------
async function openPage(slug) {
  const res = await fetch(`/api/page/${slug}`);
  const page = await res.json();

  currentSlug = slug;
  isEdit = false;

  editor.value = page.content || "";

  renderView();
}

// --------------------
// VIEW MODE
// --------------------
function renderView() {
  const html = markdownToHTML(editor.value);

  editor.style.display = "none";

  let view = document.getElementById("view");

  if (!view) {
    view = document.createElement("div");
    view.id = "view";
    document.body.appendChild(view);
  }

  view.innerHTML = html;
  view.style.display = "block";
}

// --------------------
// EDIT MODE
// --------------------
function editMode() {
  isEdit = true;

  const view = document.getElementById("view");
  if (view) view.style.display = "none";

  editor.style.display = "block";
}

// --------------------
// SAVE
// --------------------
async function save() {
  await fetch(`/api/page/${currentSlug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: currentSlug,
      content: editor.value,
    }),
  });

  renderView();
}

// --------------------
// CREATE PAGE
// --------------------
async function createPage() {
  const slug = prompt("slug?");
  if (!slug) return;

  currentSlug = slug;

  editor.value = "# New page\n";

  await save();
  await loadIndex();
  openPage(slug);
}

// --------------------
// EVENTS
// --------------------
document.getElementById("editBtn").onclick = editMode;
document.getElementById("saveBtn").onclick = save;

// --------------------
// INIT
// --------------------
export function bootstrap() {
  loadIndex();
}
