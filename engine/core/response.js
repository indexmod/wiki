// ===============================
// ENGINE: CORE
// FILE: response.js
// PURPOSE: safe HTTP response layer for Workers
// ===============================

export function htmlResponse(html) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

export function errorResponse(err, layer = "ENGINE") {
  return new Response(
    `
<!doctype html>
<html>
<head><meta charset="utf-8"><title>${layer} ERROR</title></head>
<body style="font-family:monospace;padding:20px;">
<h1>${layer} FAILED</h1>
<pre>${err?.stack || err?.message || err}</pre>
</body>
</html>
    `,
    {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    }
  );
}
