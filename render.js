// =========================================================
// RENDER — HTML SHELL
// =========================================================
// задача:
// - собрать финальную HTML страницу
// - ничего не знать про data/storage
// - быть максимально тупым и стабильным
// =========================================================

export function renderHTML({
  title = "Untitled",
  content = "",
  nav = ""
}) {

  // защита от undefined / null
  const safeTitle = String(title);
  const safeContent = String(content);
  const safeNav = String(nav);

  return `
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>

  <!-- базовые стили -->
  <link rel="stylesheet" href="/styles/base.css">
</head>

<body>

  <!-- ================= HEADER ================= -->
  <header class="site-header">
    <nav class="site-nav">
      ${safeNav}
    </nav>
  </header>

  <!-- ================= MAIN ================= -->
  <main class="site-main">
    ${safeContent}
  </main>

  <!-- ================= FOOTER ================= -->
  <footer class="site-footer">
    <small>IndexMod</small>
  </footer>

</body>
</html>
`;
}
