// IndexMod AI Layer (local Ollama client)
// Single safe AI core

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3";

/**
 * ЕДИНАЯ ТОЧКА ВЫЗОВА LLM
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
            "You are a precise coding assistant. Return only the answer. No commentary."
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

  return (data?.message?.content || "").trim();
}
