// ===============================
// ENGINE: EDITOR
// FILE: render.js
// PURPOSE: markdown editor UI (isolated fragment)
// ===============================

export function renderEditor() {
  return `
<!-- ===============================
     EDITOR ENGINE UI
     =============================== -->

<link rel="stylesheet" href="/styles/editor.css">

<div class="editor-wrap" data-engine="editor">

  <div class="editor-toolbar">
    <button class="ui-link">SAVE (EDITOR ENGINE)</button>
  </div>

  <div
    id="editor"
    class="editor-content"
    contenteditable="true"
  >
# EDITOR ENGINE ACTIVE

Write markdown here...
  </div>

</div>

<!-- EDITOR ENGINE END -->
`;
}
