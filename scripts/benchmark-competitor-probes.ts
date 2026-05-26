import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convert } from "../src/engine";
import type { EngineMode } from "../src/engine/types";

interface CompetitorProbe {
  id: string;
  input: string;
  expected: string;
  category: string;
  severity: "P0" | "P1" | "P2";
  mode: EngineMode;
  competitorOutputs: Record<string, string>;
  allowedUse: "manual-comparison-only";
}

const root = process.cwd();

export function runCompetitorProbeBenchmark() {
  const probes = [
    ...readJsonl(join(root, "bench/fixtures/competitor-probes/romanized-probe-template.jsonl")),
    ...readJsonl(join(root, "bench/fixtures/competitor-probes/preeti-probe-template.jsonl"))
  ];
  const cases = probes.map((probe) => {
    const result = convert(probe.input, { mode: probe.mode });
    const competitorPending = Object.values(probe.competitorOutputs ?? {}).every((value) => !value);
    const protectedFailure = result.protectedSpans.some((span) => !result.normalizedOutput.includes(span.original));
    return {
      id: probe.id,
      mode: probe.mode,
      category: probe.category,
      severity: probe.severity,
      expected: probe.expected,
      lekhOutput: result.normalizedOutput,
      lekhExpectedPassed: result.normalizedOutput === probe.expected,
      protectedFailure,
      competitorStatus: competitorPending ? "pending manual collection" : "manual outputs present"
    };
  });
  const failures = cases.filter((item) => item.protectedFailure);
  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: cases.length,
    lekhExpectedPassCount: cases.filter((item) => item.lekhExpectedPassed).length,
    protectedFailureCount: failures.length,
    competitorCollectionStatus: cases.every((item) => item.competitorStatus === "pending manual collection")
      ? "pending manual collection"
      : "partially collected",
    cases,
    failures
  };
}

function readJsonl(path: string): CompetitorProbe[] {
  return readFileSync(path, "utf8")
    .split(/\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CompetitorProbe);
}

if (process.env.LEKH_BENCHMARK_IMPORT !== "1") {
  const report = runCompetitorProbeBenchmark();
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports/competitor-probe-benchmark.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (report.protectedFailureCount > 0) process.exitCode = 1;
}
