import fs from "fs";

/**
 * Применение изменений ТОЛЬКО после подтверждения
 */
export function applyPatch(patch) {
  console.log("\n⚠️ APPLYING PATCH...\n");

  for (const change of patch.changes) {
    fs.writeFileSync(change.file, change.content, "utf-8");
    console.log("✔ updated:", change.file);
  }

  console.log("\n✅ DONE");
}
