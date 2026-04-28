export async function layout(env, name) {
  try {
    const res = await env.ASSETS.fetch(
      new Request(new URL(`/layouts/${name}.html`, "http://internal"))
    );

    if (!res.ok) {
      throw new Error(`layout not found: ${name}`);
    }

    return await res.text();

  } catch (e) {
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
