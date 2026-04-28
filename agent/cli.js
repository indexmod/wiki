const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3";

/* =========================
   HARD LOCK REPO ROOT
========================= */

const REPO_ROOT = path.resolve(
  process.env.REPO_ROOT || path.join(process.env.HOME, "Desktop/wiki")
);

if (!REPO_ROOT.includes("Desktop/wiki")) {
  console.log("💥 BLOCKED: invalid repo root");
  process.exit(1);
}

const MAX_FILES = 80;
const MAX_CHARS = 6000;

/* =========================
   STRICT SKIP SYSTEM
========================= */

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  ".Trash",
  "Library",
  "System",
  "Volumes",
  "Applications",
  ".DS_Store",
  ".cache",
  "tmp"
]);

const ALLOWED_EXT = new Set([
  ".js",
  ".json",
  ".md",
  ".html",
  ".css"
]);

/* =========================
   SAFE SNAPSHOT
========================= */

function gitSnapshot() {
  try {
    if (!fs.existsSync(path.join(REPO_ROOT, ".git"))) {
      console.log("⚠️ no git repo in Wiki");
      return;
    }

    const status = execSync("git status --porcelain", {
      cwd: REPO_ROOT
    }).toString().trim();

    if (!status) return;

    console.log("📸 snapshot...");
    execSync("git add .", { cwd: REPO_ROOT });
    execSync(`git commit -m "agent snapshot"`, { cwd: REPO_ROOT });

    console.log("✅ snapshot ok");
  } catch (e) {
    console.log("⚠️ git error:", e.message);
  }
}

/* =========================
   SAFE WALK (ROOT LOCKED)
========================= */

function walk(dir, files = []) {
  if (files.length >= MAX_FILES) return files;

  let list;
  try {
    list = fs.readdirSync(dir);
  } catch {
    return files;
  }

  for (const f of list) {
    const full = path.join(dir, f);

    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(f)) continue;
      if (!full.startsWith(REPO_ROOT)) continue;

      walk(full, files);
    } else {
      if (!full.startsWith(REPO_ROOT)) continue;

      const ext = path.extname(full);
      if (ALLOWED_EXT.has(ext)) {
        files.push(full);
      }
    }

    if (files.length >= MAX_FILES) break;
  }

  return files;
}

/* =========================
   CONTEXT BUILDER
========================= */

function buildContext(files) {
  return files.map(f => {
    let c = "";

    try {
      c = fs.readFileSync(f, "utf8");
    } catch {
      return "";
    }

    if (c.length > MAX_CHARS) {
      c = c.slice(0, MAX_CHARS);
    }

    return `\n=== FILE: ${f.replace(REPO_ROOT, "")} ===\n${c}`;
  }).join("\n");
}

/* =========================
   AI ENGINE (STRICT PATCH ONLY)
========================= */

async function ask(prompt, context) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: {
        temperature: 0
      },
      messages: [
        {
          role: "system",
          content: `
ТЫ — ЛОКАЛЬНЫЙ АГЕНТ РЕПОЗИТОРИЯ WIKI.

ЖЁСТКИЕ ПРАВИЛА:
- работаешь ТОЛЬКО с этим репо
- не выдумываешь файлы
- не используешь внешние данные
- не пишешь объяснений

ОТВЕТ ТОЛЬКО В ФОРМАТЕ:

=== FILE: path ===
FULL FILE CONTENT
`
        },
        {
          role: "user",
          content: `${context}\n\nTASK:\n${prompt}`
        }
      ]
    })
  });

  const data = await res.json();
  return data.message?.content || "";
}

/* =========================
   APPLY PATCH
========================= */

function applyPatch(text) {
  const matches = [...text.matchAll(/=== FILE: (.+?) ===\n([\s\S]*?)(?=\n=== FILE:|$)/g)];

  if (!matches.length) {
    console.log("❌ no patch found");
    return;
  }

  for (const m of matches) {
    const fileRel = m[1].trim();
    const content = m[2].trim();

    const file = path.join(REPO_ROOT, fileRel);

    if (!file.startsWith(REPO_ROOT)) {
      console.log("🚫 blocked write outside repo:", file);
      continue;
    }

    console.log("✏️", file);
    fs.writeFileSync(file, content, "utf8");
  }

  console.log("✅ applied");
}

/* =========================
   MAIN
========================= */

(async () => {
  const prompt = process.argv.slice(2).join(" ");

  if (!prompt) {
    console.log('usage: node cli.js "task"');
    process.exit(0);
  }

  console.log("📦 scanning Wiki repo ONLY:", REPO_ROOT);

  const files = walk(REPO_ROOT);
  const context = buildContext(files);

  console.log("📄 files:", files.length);
  console.log("🧠 wiki agent active");

  const result = await ask(prompt, context);

  console.log("\n--- OUTPUT ---\n");
  console.log(result);

  gitSnapshot();

  console.log("\n🚀 applying...");
  applyPatch(result);
})();
