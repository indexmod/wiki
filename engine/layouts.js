export async function layout(env, name) {
  try {
    const url = new URL(`/layouts/${name}.html`, "https://internal");

    const res = await env.ASSETS.fetch(new Request(url));

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
<h1>Missing layout: ${name}</h1>
</body>
</html>`;
  }
}
