import fs from "fs";
import path from "path";

function processDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      let content = fs.readFileSync(fullPath, "utf8");
      let changed = false;

      // 1. Remove mode: "insensitive"
      if (content.includes('mode: "insensitive"')) {
        content = content.replace(/,\s*mode:\s*"insensitive"/g, "");
        content = content.replace(/mode:\s*"insensitive",?\s*/g, "");
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, "utf8");
        console.log("Updated:", fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, "..", "src"));
console.log("Finished removing mode: insensitive");
