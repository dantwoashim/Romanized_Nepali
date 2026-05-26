import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyProofread } from "../src/engine/proofread";

interface ProofreadCase {
  id: string;
  input: string;
  expected: string;
  category: string;
  severity: "P0" | "P1" | "P2";
  autoFix: boolean;
}

interface ProofreadFailure {
  id: string;
  category: string;
  severity: string;
  input: string;
  expected: string;
  actual: string;
}

const root = process.cwd();

export function runProofreadBenchmark() {
  const cases = [
    ...readJsonl(join(root, "bench/fixtures/proofread/manual/proofread-manual.jsonl")),
    ...readJsonl(join(root, "bench/fixtures/proofread/hostile/proofread-hostile.jsonl"))
  ];
  const failures: ProofreadFailure[] = [];
  let autoFixCases = 0;
  let autoFixExact = 0;
  let hintsGenerated = 0;
  let appliedCount = 0;

  for (const item of cases) {
    const result = applyProofread(item.input, { autoFix: item.autoFix });
    hintsGenerated += result.hints.length;
    appliedCount += result.applied.length;
    if (item.autoFix) autoFixCases += 1;
    if (item.autoFix && result.output === item.expected) autoFixExact += 1;
    if (result.output !== item.expected) {
      failures.push({
        id: item.id,
        category: item.category,
        severity: item.severity,
        input: item.input,
        expected: item.expected,
        actual: result.output
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: cases.length,
    autoFixCases,
    exactMatch: cases.length - failures.length,
    exactMatchRate: cases.length === 0 ? 1 : (cases.length - failures.length) / cases.length,
    autoFixPrecisionProxy: autoFixCases === 0 ? 1 : autoFixExact / autoFixCases,
    hintsGenerated,
    appliedCount,
    topFailureCategories: summarizeFailures(failures),
    failures
  };
}

function readJsonl(path: string): ProofreadCase[] {
  return readFileSync(path, "utf8")
    .split(/\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as ProofreadCase);
}

function summarizeFailures(failures: ProofreadFailure[]) {
  const byCategory = new Map<string, { category: string; count: number; severity: Record<string, number> }>();
  for (const failure of failures) {
    const entry = byCategory.get(failure.category) ?? { category: failure.category, count: 0, severity: { P0: 0, P1: 0, P2: 0 } };
    entry.count += 1;
    entry.severity[failure.severity] = (entry.severity[failure.severity] ?? 0) + 1;
    byCategory.set(failure.category, entry);
  }
  return [...byCategory.values()].sort((a, b) => b.count - a.count);
}

if (process.env.LEKH_BENCHMARK_IMPORT !== "1") {
  const report = runProofreadBenchmark();
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/proofread-benchmark.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (report.failures.length > 0) process.exitCode = 1;
}
