import fs from "fs";

/**
 * Показывает разницу (без применения)
 */
export function showDiff(patch) {
  console.log("\n=== AI PROPOSED CHANGES ===\n");

  for (const change of patch.changes) {
    let old = "";

    if (fs.existsSync(change.file)) {
      old = fs.readFileSync(change.file, "utf-8");
    }

    console.log(`\n📄 FILE: ${change.file}`);
    console.log("──────────── OLD ────────────");
    console.log(old.slice(0, 500));

    console.log("──────────── NEW ────────────");
    console.log(change.content.slice(0, 500));
  }
}
