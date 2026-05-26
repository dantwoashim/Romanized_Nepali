import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildAliasCollisionReport } from "../src/engine/romanized/aliasGraph";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const reportPath = join(root, "bench/reports/romanized-alias-collision-report.json");

export function runRomanizedAliasCollisionReport() {
  const report = buildAliasCollisionReport();
  assertNonEmptySuite("romanized alias collision variants", report.variantCount);
  return report;
}

if (process.env.LEKH_SCRIPT === "alias-collisions") {
  const report = runRomanizedAliasCollisionReport();
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    ...report,
    collisions: report.collisions.slice(0, 20),
    truncatedCollisionCount: Math.max(0, report.collisions.length - 20),
    fullReportPath: "bench/reports/romanized-alias-collision-report.json"
  }, null, 2));
}
