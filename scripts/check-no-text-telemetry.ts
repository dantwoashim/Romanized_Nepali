import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const srcDir = join(root, "src");
const forbiddenKeys = [
  "text",
  "input",
  "output",
  "convertedText",
  "query",
  "keystroke",
  "clipboard",
  "content",
  "token",
  "spellToken",
  "dictionaryQuery"
];

const sendCallPattern = /\b(sendSafeEvent|trackEvent|analytics\.track|gtag)\s*\(\s*\{([\s\S]*?)\}\s*\)/g;

const files = collectFiles(srcDir).filter((file) => /\.(ts|tsx)$/.test(file));
const violations: string[] = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  let match: RegExpExecArray | null;
  while ((match = sendCallPattern.exec(source))) {
    const payloadBody = match[2];
    for (const key of forbiddenKeys) {
      const keyPattern = new RegExp(`(^|[^A-Za-z0-9_])${key}\\s*:`, "m");
      if (keyPattern.test(payloadBody)) {
        violations.push(`${file}: event payload contains forbidden key "${key}"`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("No text telemetry payloads found.");

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? collectFiles(path) : [path];
  });
}
