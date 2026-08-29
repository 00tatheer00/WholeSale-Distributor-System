import fs from "fs";
import path from "path";

const filesToFix = [
  "src/server/services/supplier.service.ts",
  "src/server/services/sales.service.ts",
  "src/server/services/purchase.service.ts",
  "src/server/services/payment.service.ts",
  "src/server/services/expense.service.ts",
  "src/server/services/distributor.service.ts",
  "src/server/services/customer.service.ts",
  "src/server/actions/settings.actions.ts",
];

for (const relPath of filesToFix) {
  const fullPath = path.join(__dirname, "..", relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf8");

  // Fix: oldValues: { ... } -> oldValues: JSON.stringify({ ... })
  // Fix: newValues: { ... } -> newValues: JSON.stringify({ ... })
  // Fix: newValues: parsed.data -> newValues: JSON.stringify(parsed.data)
  
  // We can do structured replaces on audit log blocks
  content = content.replace(/oldValues:\s*(\{[\s\S]*?\})(,\s*\n\s*(?:newValues|userId|ipAddress|userAgent|createdAt))/g, (match, p1, p2) => {
    if (p1.startsWith("JSON.stringify")) return match;
    return `oldValues: JSON.stringify(${p1})${p2}`;
  });

  content = content.replace(/newValues:\s*(\{[\s\S]*?\})(,\s*\n\s*(?:userId|ipAddress|userAgent|createdAt|\}))/g, (match, p1, p2) => {
    if (p1.startsWith("JSON.stringify")) return match;
    return `newValues: JSON.stringify(${p1})${p2}`;
  });

  content = content.replace(/newValues:\s*parsed\.data,/g, 'newValues: JSON.stringify(parsed.data),');
  content = content.replace(/newValues:\s*\{ status \},/g, 'newValues: JSON.stringify({ status }),');
  content = content.replace(/newValues:\s*\{ isActive \},/g, 'newValues: JSON.stringify({ isActive }),');

  fs.writeFileSync(fullPath, content, "utf8");
  console.log("Processed audit JSON strings in:", relPath);
}

console.log("Finished wrapping audit payloads.");
