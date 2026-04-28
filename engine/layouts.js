export async function layout(env, name) {
  try {
    const res = await env.ASSETS.fetch(
      new Request(new URL(`/layouts/${name}.html`, "http://internal"))
    );

    return await res.text();
  } catch {
    return `<h1>missing layout: ${name}</h1>`;
  }
}
