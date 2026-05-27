import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface PendingLayout {
  layoutId?: string;
  status?: string;
  implementationAllowed?: boolean;
  keys?: unknown[];
}

const root = process.cwd();
const pendingFiles = [
  "data/layouts/traditional-ltk-compatible.pending.json",
  "data/layouts/traditional-standard.pending.json"
];
const finalFiles = [
  "data/layouts/traditional-ltk-compatible.json",
  "data/layouts/traditional-standard.json"
];
const fixturePath = "bench/fixtures/traditional-layout/layout-audit.pending.jsonl";
const failures: string[] = [];
const warnings: string[] = [];

for (const file of pendingFiles) {
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    failures.push(`${file} is missing.`);
    continue;
  }
  const layout = JSON.parse(readFileSync(absolute, "utf8")) as PendingLayout;
  if (layout.implementationAllowed !== false) {
    failures.push(`${file} must keep implementationAllowed=false while pending.`);
  }
  if (!Array.isArray(layout.keys) || layout.keys.length !== 0) {
    failures.push(`${file} must not contain production key mappings while pending.`);
  }
  if (!String(layout.status ?? "").includes("pending")) {
    failures.push(`${file} status must clearly remain pending.`);
  }
}

for (const file of finalFiles) {
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    warnings.push(`${file} is not present yet; Traditional physical layout remains pending.`);
  }
}

if (!existsSync(join(root, fixturePath))) {
  failures.push(`${fixturePath} is missing.`);
}

const result = {
  generatedAt: new Date().toISOString(),
  command: "npm run audit:traditional-layout",
  suite: "traditional-layout-audit",
  mode: "pending-scaffold",
  fixtureCount: existsSync(join(root, fixturePath))
    ? readFileSync(join(root, fixturePath), "utf8").split("\n").filter(Boolean).length
    : 0,
  status: failures.length === 0 ? "pass" : "fail",
  implementationAllowed: false,
  warnings,
  failures
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
