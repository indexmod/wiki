import fs from "fs";

const SNAPSHOT = "./agent/snapshots/snapshot-001.json";

/**
 * Rollback system (SAFE RESTORE)
 */
export function rollback() {
  if (!fs.existsSync(SNAPSHOT)) {
    console.log("❌ No snapshot found");
    return;
  }

  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, "utf-8"));

  console.log("📦 Restoring snapshot:", snap.name);

  for (const file of snap.files) {
    console.log("↩️ would restore:", file);
    // ВАЖНО: пока только логируем (без перезаписи!)
  }

  console.log("⚠️ SAFE MODE: no files overwritten yet");
}
