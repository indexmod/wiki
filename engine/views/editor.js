// =========================================================
// VIEW: EDITOR
// ROLE: minimal editor UI shell (no logic)
// =========================================================

export function viewEditor(page = {}) {
  return `
<div class="editor">

  <h1>Editor</h1>

  <input
    id="title"
    value="${page.title || ""}"
    placeholder="Title"
  />

  <textarea id="content">${page.content || ""}</textarea>

  <button id="saveBtn">Save</button>

</div>
`;
}
