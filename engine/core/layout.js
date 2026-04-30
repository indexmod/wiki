export function layout(env, { title, content }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>

<link rel="stylesheet" href="/styles/base.css">
<link rel="stylesheet" href="/styles/index.css">

</head>

<body>

<header class="site-header">
  <a href="/">
    <img src="/logo.png" class="logo">
  </a>

  <nav class="site-nav">
    <a href="/editor">Editor</a>
  </nav>
</header>

<main class="site-main">
  ${content}
</main>

<footer class="site-footer">
  <a href="https://mod.indexmod.press">
    Chat at Mod
  </a>
</footer>

</body>
</html>`;
}
