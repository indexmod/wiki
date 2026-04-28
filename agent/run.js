// run.js

import {
  summarizePage,
  extractTitle,
  extractDescription,
  classifyTopic,
  suggestEdit
} from "./ai.js";

/**
 * ================= SAFETY CONFIG =================
 */

// лимит длины входа (защита от перегруза модели)
const MAX_INPUT = 4000;

// режим "только вывод, без побочных действий"
// (на будущее — сейчас у нас и так нет записи в файлы)
const SAFE_MODE = true;

/**
 * ================= INPUT =================
 */

const mode = process.argv[2];
let input = process.argv.slice(3).join(" ");

// защита от пустого ввода
if (!mode || !input) {
  console.log(`
Usage:
node agent/run.js [mode] "text"

Modes:
  summarize
  title
  desc
  tag
  improve
`);
  process.exit(1);
}

/**
 * ================= INPUT SANITIZE =================
 */

// приводим к строке
input = String(input);

// убираем бинарный мусор / null bytes
input = input.replace(/\0/g, "");

// ограничиваем длину (очень важно)
if (input.length > MAX_INPUT) {
  console.warn("⚠️ Input too long, truncated");
  input = input.slice(0, MAX_INPUT);
}

/**
 * ================= MODE SWITCH =================
 */

let fn;

switch (mode) {
  case "summarize":
    fn = summarizePage;
    break;

  case "title":
    fn = extractTitle;
    break;

  case "desc":
    fn = extractDescription;
    break;

  case "tag":
    fn = classifyTopic;
    break;

  case "improve":
    fn = suggestEdit;
    break;

  default:
    console.error("❌ Unknown mode:", mode);
    process.exit(1);
}

/**
 * ================= EXECUTION =================
 */

let result = "";

try {
  result = await fn(input);
} catch (err) {
  console.error("❌ AI ERROR:", err.message || err);
  process.exit(1);
}

/**
 * ================= OUTPUT SANITIZE =================
 */

// защита от undefined/null
result = String(result || "").trim();

// убираем случайные “болтливые” хвосты (часто у LLM)
result = result.replace(/^(Here is|Sure|Of course).*?\n/i, "");

// ограничиваем длину вывода (чтобы не раздувал)
if (result.length > 2000) {
  console.warn("⚠️ Output truncated");
  result = result.slice(0, 2000);
}

/**
 * ================= FINAL OUTPUT =================
 */

console.log("\n=== AI OUTPUT ===\n");
console.log(result);

/**
 * ================= SAFE GUARD =================
 */

// на будущее: если появится запись в файлы
if (!SAFE_MODE) {
  console.warn("⚠️ SAFE MODE DISABLED — be careful");
}
