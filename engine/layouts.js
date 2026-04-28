export async function layout(env, name) {
  try {
    const res = await env.ASSETS.fetch(`/layouts/${name}.html`);

    if (!res.ok) {
      throw new Error(`layout missing: ${name}`);
    }

    return await res.text();

  } catch (e) {
    console.log("[LAYOUT ERROR]", e);

    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Layout error</title>
<link rel="stylesheet" href="/styles/base.css">
</head>
<body>
<main>
<h1>Missing layout: ${name}</h1>
</main>
</body>
</html>`;
  }
}
