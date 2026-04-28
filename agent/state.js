import fs from "fs";

const STATE_DIR = "./agent/snapshots";

/**
 * Создаёт snapshot текущего состояния
 */
export function createSnapshot(name, files) {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }

  const snapshot = {
    name,
    createdAt: new Date().toISOString(),
    files
  };

  const path = `${STATE_DIR}/${name}.json`;
  fs.writeFileSync(path, JSON.stringify(snapshot, null, 2));

  console.log("📸 Snapshot created:", path);
  return path;
}
