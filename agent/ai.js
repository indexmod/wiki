// ai.js

// IndexMod AI Layer (local Ollama client)
// Safe + deterministic version for automation

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3";

/**
 * Core AI call (safe + strict)
 */
export async function ai(prompt, options = {}) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: options.model || MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a precise assistant. Return only the requested result. No explanations. No extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: false
    })
  });

  if (!res.ok) {
    throw new Error("Ollama request failed: " + res.status);
  }

  const data = await res.json();

  // защита от undefined/null
  return (data?.message?.content || "").trim();
}
