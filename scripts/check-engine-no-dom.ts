import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const engineDir = join(root, "src/engine");
const forbiddenPatterns = [
  { pattern: /\bwindow\b/, label: "window" },
  { pattern: /\bdocument\./, label: "document.* DOM access" },
  { pattern: /\bHTMLElement\b/, label: "HTMLElement" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bDOMParser\b/, label: "DOMParser" },
  { pattern: /\bnavigator\b/, label: "navigator" }
];

const violations: string[] = [];

for (const file of collectFiles(engineDir).filter((path) => /\.(ts|tsx)$/.test(path))) {
  if (/\.test\.[tj]sx?$/.test(file)) continue;
  const source = stripCommentsAndStrings(readFileSync(file, "utf8"));
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(source)) {
      violations.push(`${relative(root, file)} uses forbidden DOM/browser hot-path API: ${label}`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Engine no-DOM check passed: no DOM/browser hot-path APIs found in src/engine.");

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? collectFiles(path) : [path];
  });
}

function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/`(?:\\.|[^`])*`/g, "``")
    .replace(/"(?:\\.|[^"])*"/g, "\"\"")
    .replace(/'(?:\\.|[^'])*'/g, "''");
}
