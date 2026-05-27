import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mergeFailureSummaries } from "./lib/benchmarkTaxonomy";

const root = process.cwd();
process.env.LEKH_BENCHMARK_IMPORT = "1";
const [{ runPreetiBenchmark }, { runRomanizedBenchmark }, { runMixedSpanMutationBenchmark }] = await Promise.all([
  import("./benchmark-preeti"),
  import("./benchmark-romanized"),
  import("./benchmark-mixed-span-mutations")
]);
const preeti = runPreetiBenchmark();
const romanized = await runRomanizedBenchmark();
const mixedSpanMutations = runMixedSpanMutationBenchmark();
const summary = {
  generatedAt: new Date().toISOString(),
  preeti,
  romanized,
  mixedSpanMutations,
  topFailureCategories: mergeFailureSummaries([preeti.topFailureCategories, romanized.topFailureCategories])
};

console.log(JSON.stringify(summary, null, 2));

if (process.argv.includes("--write")) {
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/benchmark-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
}
