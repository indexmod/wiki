// FILE: modules/index.js

export async function indexRouter(request, env) {
  const url = new URL(request.url);

  // =========================
  // ONLY ROOT
  // =========================
  if (url.pathname !== "/") {
    return null; // важно: не перехватываем всё подряд
  }

  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IndexMod</title>
<link rel="icon" href="/favicon.svg">
</head>

<body style="margin:0; font-family: Georgia, serif; padding:60px;">
  <div style="position:fixed; top:20px; right:20px;">
    <a href="/editor.html">new</a>
  </div>

  <main id="list"></main>

  <script>
    async function load() {
      const res = await fetch("/api/pages");
      const pages = await res.json();

      const list = document.getElementById("list");

      list.innerHTML = pages
        .sort((a,b) => (a.title||"").localeCompare(b.title||""))
        .map(p => {
          return \`
            <div style="font-size:25px; margin:10px 0;">
              <a href="/\${p.slug}">
                \${p.title || p.slug}
              </a>
            </div>
          \`;
        })
        .join("");
    }

    load();
  </script>
</body>
</html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}
