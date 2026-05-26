import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runPreetiBenchmark } from "./benchmark-preeti";
import { runRomanizedBenchmark } from "./benchmark-romanized";
import { mergeFailureSummaries } from "./lib/benchmarkTaxonomy";

const root = process.cwd();
const preeti = runPreetiBenchmark();
const romanized = await runRomanizedBenchmark();
const summary = {
  generatedAt: new Date().toISOString(),
  preeti,
  romanized,
  topFailureCategories: mergeFailureSummaries([preeti.topFailureCategories, romanized.topFailureCategories])
};

console.log(JSON.stringify(summary, null, 2));

if (process.argv.includes("--write")) {
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/benchmark-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
}
