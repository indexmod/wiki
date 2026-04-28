import { ai } from "./ai.js";
import { getRepoContext } from "./context.js";

const mode = process.argv[2];
const input = process.argv.slice(3).join(" ");

if (!mode) {
  console.log(`
Usage:
node agent/run.js scan
node agent/run.js ask "question"
`);
  process.exit(1);
}

/**
 * ================= CONTEXT PIPELINE =================
 */
function prepareContext(raw) {
  let ctx = String(raw || "");

  // защита от мусора
  ctx = ctx.replace(/\0/g, "");

  // ограничение размера
  const MAX = 8000;
  if (ctx.length > MAX) {
    console.warn("⚠️ Context truncated:", ctx.length, "→", MAX);
    ctx = ctx.slice(0, MAX);
  }

  return ctx;
}

/**
 * ================= SCAN MODE =================
 */
if (mode === "scan") {
  const raw = getRepoContext();
  const ctx = prepareContext(raw);

  const prompt = `
You are my eyes in the repository.

Return ONLY:
1. File tree summary
2. Main modules
3. System architecture overview

NO CODE CHANGES.

CODEBASE:
${ctx}
`;

  const result = await ai(prompt);

  console.log("\n=== SCAN OUTPUT ===\n");
  console.log(result);

  process.exit(0);
}

/**
 * ================= ASK MODE =================
 */
if (mode === "ask") {
  const raw = getRepoContext();
  const ctx = prepareContext(raw);

  const prompt = `
YOU ARE NOT DESCRIBING THE CODE.

You are reviewing it like a senior engineer in a code review.

For each part:
- identify a problem (if any)
- explain why it is bad
- suggest a concrete improvement
- prefer simplification over abstraction

If everything is fine, say: "no issues found"

CODEBASE:
${ctx}
`;

const result = await ai(prompt);

  const result = await ai(prompt);

  console.log("\n=== ANSWER ===\n");
  console.log(result);

  process.exit(0);
}

console.log("Unknown mode:", mode);
