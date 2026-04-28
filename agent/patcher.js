// patcher.js

import fs from "fs";
import path from "path";
import { ai } from "./ai.js";

const ROOT = process.cwd();

/**
 * Ask AI to generate patch
 */
export async function generatePatch(prompt, files) {
  const context = files.map(f => {
    const content = fs.readFileSync(f, "utf-8");
    return `FILE: ${f}\n${content}`;
  }).join("\n\n");

  const res = await ai(`
You are a senior engineer.

Given project files:

${context}

Task:
${prompt}

Return ONLY valid JSON:

{
  "changes": [
    {
      "file": "relative/path.js",
      "content": "FULL updated file content"
    }
  ]
}

Rules:
- no explanations
- no markdown
- only JSON
`);

  return JSON.parse(res);
}
