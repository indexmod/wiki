export async function layout(env, name) {
  const url = new URL(`/layouts/${name}.html`, "https://example.com");

  const res = await env.ASSETS.fetch(new Request(url));

  if (!res.ok) {
    return `<h1>Missing layout: ${name}</h1>`;
  }

  return await res.text();
}
