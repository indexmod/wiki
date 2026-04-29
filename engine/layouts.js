export async function layout(env, name) {
  const url = new URL(`/layouts/${name}.html`, "https://internal");
  const res = await env.ASSETS.fetch(new Request(url));

  if (!res.ok) throw new Error(`layout missing: ${name}`);

  return await res.text();
}
