import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildApprovedAliasVariants } from "../src/engine/romanized/aliasFactory";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const reportPath = join(root, "bench/reports/romanized-alias-factory-report.json");

export function runRomanizedAliasFactoryReport() {
  const variants = buildApprovedAliasVariants();
  assertNonEmptySuite("romanized alias factory", variants.length);
  const reviewed = variants.filter((variant) => !variant.source.includes("dictionary-ne"));
  const imported = variants.filter((variant) => variant.source.includes("dictionary-ne"));
  const byReason = variants.reduce<Record<string, number>>((acc, variant) => {
    acc[variant.reason] = (acc[variant.reason] ?? 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    variantCount: variants.length,
    aliasCount: new Set(variants.map((variant) => variant.alias)).size,
    outputCount: new Set(variants.map((variant) => variant.word)).size,
    reviewedOrManualVariantCount: reviewed.length,
    importedUnreviewedVariantCount: imported.length,
    byReason,
    samples: variants.slice(0, 30)
  };
}

if (process.env.LEKH_SCRIPT === "alias-romanized") {
  const report = runRomanizedAliasFactoryReport();
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
