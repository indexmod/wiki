import fs from "fs";
import path from "path";

const ROOT = path.resolve("./");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".DS_Store"
]);

const EXT = [".js", ".ts"];

// ================= FILE CHECK =================

function isCodeFile(file) {
  return EXT.some(ext => file.endsWith(ext));
}

// ================= IMPORT PARSER =================

function extractImports(code) {
  const imports = [];

  const lines = code.split("\n");

  for (const line of lines) {
    let m;

    // ES modules
    m = line.match(/import .* from ['"](.*)['"]/);
    if (m) imports.push(m[1]);

    // require
    m = line.match(/require\(['"](.*)['"]\)/);
    if (m) imports.push(m[1]);
  }

  return imports;
}

// ================= WALK =================

function walk(dir, files) {
  let list;

  try {
    list = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const file of list) {
    const full = path.join(dir, file);

    if (IGNORE_DIRS.has(file)) continue;

    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walk(full, files);
      continue;
    }

    if (!isCodeFile(file)) continue;

    let content = "";
    try {
      content = fs.readFileSync(full, "utf-8");
    } catch {}

    files.push({
      path: full,
      content,
      imports: extractImports(content)
    });
  }
}

// ================= LAYER DETECTOR =================

function detectLayer(filePath) {
  if (filePath.includes("worker") || filePath.includes("run")) return "CORE";
  if (filePath.includes("context") || filePath.includes("state")) return "DATA";
  if (filePath.includes("diff") || filePath.includes("patch")) return "TOOLS";
  if (filePath.includes("public") || filePath.includes("layout") || filePath.includes("style")) return "UI";

  return "UNKNOWN";
}

// ================= ANALYSIS ENGINE =================

function analyze(files) {
  const graph = {};
  const layerMap = {};

  for (const f of files) {
    const layer = detectLayer(f.path);

    layerMap[f.path] = layer;
    graph[f.path] = f.imports;
  }

  const violations = [];

  for (const [file, deps] of Object.entries(graph)) {
    const layer = layerMap[file];

    for (const dep of deps) {
      const depFile = Object.keys(layerMap).find(f => f.includes(dep));

      if (!depFile) continue;

      const depLayer = layerMap[depFile];

      // ❌ UI не должен влиять на CORE
      if (layer === "UI" && depLayer === "CORE") {
        violations.push(`${file} → UI depends on CORE (bad coupling)`);
      }

      // ❌ TOOLS не должны тянуть UI
      if (layer === "TOOLS" && depLayer === "UI") {
        violations.push(`${file} → TOOLS depends on UI (wrong separation)`);
      }

      // ❌ CORE не должен зависеть от UI
      if (layer === "CORE" && depLayer === "UI") {
        violations.push(`${file} → CORE depends on UI (critical violation)`);
      }
    }
  }

  return { graph, layerMap, violations };
}

// ================= FORMAT REPORT =================

function formatReport({ graph, layerMap, violations }) {
  let out = `
===== ARCHITECTURE REVIEW =====

--- LAYERS ---
`;

  for (const [file, layer] of Object.entries(layerMap)) {
    out += `${layer} → ${file}\n`;
  }

  out += `\n--- DEPENDENCIES ---\n`;

  for (const [file, deps] of Object.entries(graph)) {
    out += `\n${file}\n`;

    if (!deps.length) {
      out += "  (no imports)\n";
      continue;
    }

    for (const d of deps) {
      out += `  → ${d}\n`;
    }
  }

  out += `\n--- VIOLATIONS ---\n`;

  if (!violations.length) {
    out += "No architectural violations detected.\n";
  } else {
    for (const v of violations) {
      out += `❌ ${v}\n`;
    }
  }

  return out;
}

// ================= MAIN =================

export function getRepoContext() {
  const files = [];

  walk(ROOT, files);

  const analysis = analyze(files);

  console.log("📦 FILES:", files.length);
  console.log("🧠 ARCH REVIEW GENERATED");

  return formatReport(analysis);
}
