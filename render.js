export function renderHTML({ title, content, nav = "" }) {
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="/styles/base.css">
</head>
<body>

<header>
  ${nav}
</header>

<main>
  ${content}
</main>

</body>
</html>
`;
}
