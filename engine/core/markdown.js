// ===============================
// ENGINE: CORE
// FILE: markdown.js
// PURPOSE: safe HTTP response layer for Workers
// ===============================

import { marked } from "marked";

export function renderMarkdown(md = "") {
  return marked.parse(md);
}
