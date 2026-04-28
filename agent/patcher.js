import { ai } from "./ai.js";

/**
 * Генерация безопасного patch (НЕ ПИШЕТ В ФАЙЛЫ)
 */
export async function generatePatch(prompt, context) {
  const res = await ai(`
You are a senior software engineer.

You MUST return ONLY valid JSON.

Format:
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
- no text outside JSON
- keep logic minimal and safe

Context:
${context}

Task:
${prompt}
`);

  return JSON.parse(res);
}
