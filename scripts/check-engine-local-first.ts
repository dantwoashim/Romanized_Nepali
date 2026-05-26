import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const engineDir = join(root, "src/engine");
const forbiddenPatterns = [
  { pattern: /\bfetch\s*\(/, label: "fetch()" },
  { pattern: /\bXMLHttpRequest\b/, label: "XMLHttpRequest" },
  { pattern: /\bWebSocket\b/, label: "WebSocket" },
  { pattern: /from\s+["']node:(?:http|https)["']/, label: "node:http/node:https import" },
  { pattern: /from\s+["'](?:http|https)["']/, label: "http/https import" },
  { pattern: /\b(?:http|https)\.(?:request|get)\s*\(/, label: "http/https request" }
];

const violations: string[] = [];

for (const file of collectFiles(engineDir).filter((path) => /\.(ts|tsx)$/.test(path))) {
  if (/\.test\.[tj]sx?$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(source)) {
      violations.push(`${relative(root, file)} uses forbidden network primitive: ${label}`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Engine local-first check passed: no network primitives found in src/engine.");

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? collectFiles(path) : [path];
  });
}
