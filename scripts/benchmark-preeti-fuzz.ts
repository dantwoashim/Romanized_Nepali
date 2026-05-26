import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convertPreeti } from "../src/engine/legacy";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const reportPath = join(root, "bench/reports/preeti-fuzz-report.json");

const LEGAL_UNICODE = [
  "क",
  "कि",
  "की",
  "कु",
  "कू",
  "के",
  "कै",
  "को",
  "कौ",
  "क्र",
  "प्र",
  "त्र",
  "ज्ञ",
  "क्ष",
  "च्च",
  "दुष्परिणामहरू",
  "लक्ष्यहरू",
  "निर्णय",
  "प्रार्थना",
  "सङ्कल्पित"
];

const ILLEGAL_PREETI = ["☃", "l", "{{", "\\\\", "s\\\\f", "☃☃"];

export function runPreetiFuzzBenchmark() {
  const legalCases = LEGAL_UNICODE.map((expected, index) => ({
    id: `preeti-fuzz-legal-${index + 1}`,
    kind: "legal",
    input: unicodeToPreeti(expected),
    expected
  }));
  const illegalCases = ILLEGAL_PREETI.map((input, index) => ({
    id: `preeti-fuzz-illegal-${index + 1}`,
    kind: "illegal",
    input,
    expected: input
  }));
  const cases = [...legalCases, ...illegalCases];
  assertNonEmptySuite("preeti fuzz", cases.length);

  const results = cases.map((item) => {
    const result = convertPreeti(item.input, { mode: "preeti-strict", legacyDecoder: item.kind === "legal" ? "atom" : "auto" });
    const exact = item.kind === "legal" ? result.normalizedOutput === item.expected : true;
    const unsafe = result.diagnostics.some((diagnostic) => diagnostic.severity === "error" || diagnostic.code.includes("UNKNOWN"));
    return {
      ...item,
      actual: result.normalizedOutput,
      exact,
      unsafe,
      diagnosticCodes: result.diagnostics.map((diagnostic) => diagnostic.code)
    };
  });

  const legal = results.filter((item) => item.kind === "legal");
  const illegal = results.filter((item) => item.kind === "illegal");
  const failures = results.filter((item) => (item.kind === "legal" && !item.exact) || (item.kind === "illegal" && !item.unsafe));
  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: results.length,
    legalCount: legal.length,
    illegalCount: illegal.length,
    legalExactRate: legal.filter((item) => item.exact).length / legal.length,
    illegalUnsafeOrWarnRate: illegal.filter((item) => item.unsafe).length / illegal.length,
    failureCount: failures.length,
    failures
  };
}

if (process.env.LEKH_SCRIPT === "benchmark-preeti-fuzz") {
  const report = runPreetiFuzzBenchmark();
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
