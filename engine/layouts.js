export async function layout(env, name) {
  const res = await env.ASSETS.fetch(`/layouts/${name}.html`);
  return await res.text();
}
