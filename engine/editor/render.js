// ===============================
// ENGINE: EDITOR
// FILE: render.js
// PURPOSE: markdown editor UI
// ===============================

export function renderEditor() {
  return `
<!-- EDITOR ENGINE START -->

<div class="editor-wrap">

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
