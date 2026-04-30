// =========================================================
// CORE: RESPONSE HELPERS
// =========================================================

export function htmlResponse(html) {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

export function errorResponse(err) {
  return new Response(String(err), { status: 500 });
}
