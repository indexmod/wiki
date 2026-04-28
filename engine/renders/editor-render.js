export function renderEditor() {
  return `
    <div class="editor-wrap">

      <div class="editor-toolbar">
        <button class="ui-link">Save</button>
      </div>

      <div
        id="editor"
        class="editor-content"
        contenteditable="true"
      >
# Write here...
      </div>

    </div>
  `;
}
