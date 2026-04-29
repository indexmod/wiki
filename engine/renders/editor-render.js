export function renderEditor() {
  return `
    <div class="editor-wrap">

      <div class="editor-toolbar">
        <button class="ui-link" id="saveBtn">Save</button>
      </div>

      <div
        id="editor"
        class="editor-content"
        contenteditable="true"
        spellcheck="false"
      ></div>

    </div>

    <script>
      const el = document.getElementById("editor");

      // стартовый текст (без риска HTML/парсинга)
      el.innerText = "# Write here...";
    </script>
  `;
}
