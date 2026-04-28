// context.js

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// лимиты безопасности
const MAX_FILE_SIZE = 20_000;   // символов на файл
const MAX_TOTAL_SIZE = 120_000; // общий лимит контекста
const ALLOWED_EXT = /\.(js|html|css|md)$/;

// игнор папок
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".wrangler",
  "dist",
  "build"
]);

/**
 * Безопасное чтение файла
 */
function safeRead(file) {
  try {
    let content = fs.readFileSync(file, "utf-8");

    // обрезаем слишком большие файлы
    if (content.length > MAX_FILE_SIZE) {
      content = content.slice(0, MAX_FILE_SIZE);
      content += "\n/* truncated */";
    }

    return content;
  } catch (e) {
    return "";
  }
}

/**
 * Recursively read project files (SAFE)
 */
export function getRepoContext() {
  const files = [];
  let totalSize = 0;

  function walk(dir) {
    let list;

    try {
      list = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of list) {
      const full = path.join(dir, file);

      // игнор системных папок
      if (IGNORE_DIRS.has(file) || file.startsWith(".")) continue;

      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(full);
        continue;
      }

      // фильтр по расширению
      if (!ALLOWED_EXT.test(file)) continue;

      const content = safeRead(full);

      const chunk = `\n\nFILE: ${full}\n\n${content}`;

      totalSize += chunk.length;

      // стоп если превысили лимит
      if (totalSize > MAX_TOTAL_SIZE) {
        files.push("\n\n/* CONTEXT TRUNCATED */");
        return;
      }

      files.push(chunk);
    }
  }

  walk(ROOT);

  return files.join("\n");
}
