import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const root = process.cwd();
const productionSourceDirs = [join(root, "src")];
const forbiddenImportPatterns = [
  /from\s+["'][^"']*benchmarks\//,
  /import\s*\([^)]*["'][^"']*benchmarks\//,
  /from\s+["'][^"']*fixtures\//,
  /import\s*\([^)]*["'][^"']*fixtures\//,
  /from\s+["'][^"']*\/fixtures\//,
  /import\s*\([^)]*["'][^"']*\/fixtures\//
];

const distForbiddenMarkers = [
  "romanized-hostile-",
  "romanized-held-out-",
  "preeti-heldout-",
  "manual-hostile-domain-matrix-v1",
  "manual-black-box-probe"
];

const violations: string[] = [];

for (const directory of productionSourceDirs) {
  for (const file of collectFiles(directory)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    if (isTestOrStoryFile(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const pattern of forbiddenImportPatterns) {
      if (pattern.test(source)) {
        violations.push(`${relative(root, file)} imports benchmark or fixture data into production source.`);
      }
    }
  }
}

const distDir = join(root, "dist");
if (existsSync(distDir)) {
  for (const file of collectFiles(distDir).filter((path) => /\.(js|html|css)$/.test(path))) {
    const source = readFileSync(file, "utf8");
    for (const marker of distForbiddenMarkers) {
      if (source.includes(marker)) {
        violations.push(`${relative(root, file)} contains benchmark marker "${marker}".`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("No benchmark or probe data found in production runtime.");

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? collectFiles(path) : [path];
  });
}

function isTestOrStoryFile(file: string): boolean {
  const name = basename(file);
  return /\.test\.[tj]sx?$/.test(name) || /\.spec\.[tj]sx?$/.test(name) || /\.stories\.[tj]sx?$/.test(name);
}
