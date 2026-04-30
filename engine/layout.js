// =========================================================
// CORE LAYOUT ENGINE
// ROLE: single HTML shell injector
// =========================================================

export async function layout() {
  return "<h1>LAYOUT HIT</h1>";
}

  const html = await res.text();

  return html
    .replace("{{title}}", title || "")
    .replace("{{content}}", content || "")
    .replace("{{layout}}", layout)
    .replace("{{nav}}", nav);
}
