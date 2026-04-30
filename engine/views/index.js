// =========================================================
// VIEW: INDEX
// ROLE: format pages list into HTML fragment
// =========================================================

export function indexView(content) {
  return `
<section class="index">
  <header class="index-header">
    <h1>Index</h1>
  </header>

  <div class="index-list">
    ${content}
  </div>
</section>
`;
}
