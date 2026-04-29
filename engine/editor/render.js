// ===============================
// ENGINE: EDITOR
// FILE: render.js
// PURPOSE: markdown editor UI (isolated fragment)
// ===============================


export function renderEditor(page = null) {

  const title = page?.title || "";
  const content = page?.content || "";

  return `
<!-- ===============================
     EDITOR ENGINE UI
     =============================== -->

<div class="editor-wrap" data-engine="editor">

  <!-- ================= TOOLBAR ================= -->
  <div class="editor-toolbar">
    <button class="ui-link" data-action="save">
      Save
    </button>

    <button class="ui-link" data-action="edit">
      Edit
    </button>
  </div>

  <!-- ================= TITLE ================= -->
  <div
    id="editor-title"
    class="editor-title"
    contenteditable="true"
    data-field="title"
  >${title || "Title"}</div>

  <!-- ================= CONTENT ================= -->
  <div
    id="editor"
    class="editor-content"
    contenteditable="true"
    data-field="content"
  >${content || "Write markdown here..."}</div>

</div>

<!-- ===============================
     END EDITOR ENGINE
     =============================== -->
`;
}
