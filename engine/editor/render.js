// =========================================================
// ENGINE STATE: EDITOR RENDER
// STATUS:
// ✔ supports new page + edit mode
// ✔ page-aware content injection
// ✔ no duplicated UI controls
// ✔ clean UI fragment (no layout responsibility)
// ✔ future-ready for save system
//
// NOTES:
// - page = null → new page mode
// - page exists → edit mode
// - MUST NOT include layout or routing logic
// =========================================================


function escapeHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


// ===============================
// RENDER EDITOR
// ===============================
export function renderEditor(page = null) {

  const isEditMode = !!page;

  const title = isEditMode
    ? page.title || "Untitled page"
    : "New page";

  const content = isEditMode
    ? page.content || ""
    : "# New page\n\nStart writing...";

  return `
<!-- ===============================
     EDITOR ENGINE UI
     STATE: ${isEditMode ? "EDIT MODE" : "NEW PAGE"}
     =============================== -->

<div class="editor-wrap" data-mode="${isEditMode ? "edit" : "new"}">

  <!-- ================= TOOLBAR ================= -->
  <div class="editor-toolbar">

    <span class="editor-title">
      ${escapeHtml(title)}
    </span>

    <div class="editor-actions">
      <button class="ui-link">Save</button>
      <a href="/" class="ui-link">Exit</a>
    </div>

  </div>

  <!-- ================= EDITABLE AREA ================= -->
  <div
    id="editor"
    class="editor-content"
    contenteditable="true"
    spellcheck="false"
  >${escapeHtml(content)}</div>

</div>

<!-- ===============================
     EDITOR ENGINE END
     =============================== -->
`;
}
