// =========================================================
// VIEW: EDITOR
// ROLE: simple markdown editor
// =========================================================

export function editorView() {
  return `
<div class="editor">
  <input id="title" placeholder="Title">
  <textarea id="content" placeholder="Markdown..."></textarea>
  <button onclick="save()">Save</button>

  <script>
    async function save() {
      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;

      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });

      location.href = '/';
    }
  </script>
</div>
`;
}
