export function renderEditor() {
  return `
    <div class="editor">

      <div class="editor-toolbar">
        <button class="editor-save">Save</button>
      </div>

      <div id="editor" class="editor-content" contenteditable="true">
# Write here...
      </div>

    </div>
  `;
}
