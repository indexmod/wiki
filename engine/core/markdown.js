// =========================================================
// CORE: MARKDOWN RENDERER
// ROLE: single markdown → HTML transformer
// =========================================================

import { marked } from "marked";

export function renderMarkdown(md = "") {
  return marked.parse(md);
}
