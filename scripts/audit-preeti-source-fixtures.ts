import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "../src/core/preeti/convertPreetiToUnicode";
import {
  classifyPreetiSourceAuditFixture,
  type PreetiSourceAuditFixture,
  type PreetiSourceAuditStatus
} from "../src/engine/legacy/sourceAudit";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const fixturePath = join(root, "bench/fixtures/preeti/source-audit/manual-hard.jsonl");
const reportPath = join(root, "bench/reports/preeti-source-audit-report.json");

export interface PreetiSourceAuditReport {
  generatedAt: string;
  fixtureCount: number;
  includeInConversionBenchmarkCount: number;
  includeInProofreadBenchmarkCount: number;
  byStatus: Record<PreetiSourceAuditStatus, number>;
  converterBugCount: number;
  sourceTypoOrAmbiguousCount: number;
  expectedOutputBugCount: number;
  cases: Array<{
    id: string;
    status: PreetiSourceAuditStatus;
    category: string;
    expectedUnicode: string;
    observedCurrent: string;
    currentMatchesExpected: boolean;
    includeInConversionBenchmark: boolean;
    includeInProofreadBenchmark: boolean;
    notes: string;
  }>;
}

export function runPreetiSourceAudit(): PreetiSourceAuditReport {
  const fixtures = readJsonl<PreetiSourceAuditFixture>(fixturePath);
  assertNonEmptySuite("preeti source-audit", fixtures.length);

  const byStatus = Object.fromEntries(
    ["converter-bug", "source-text-typo", "expected-output-bug", "style-normalization", "proofread-correction", "ambiguous-legacy-encoding", "verified-gold"]
      .map((status) => [status, 0])
  ) as Record<PreetiSourceAuditStatus, number>;

  let includeInConversionBenchmarkCount = 0;
  let includeInProofreadBenchmarkCount = 0;

  const cases = fixtures.map((fixture) => {
    const decision = classifyPreetiSourceAuditFixture(fixture);
    const observedCurrent = normalizeNepaliText(convertPreetiToUnicode(fixture.preetiInput).normalizedOutput);
    const expectedUnicode = normalizeNepaliText(fixture.expectedUnicode);
    byStatus[fixture.status] += 1;
    if (decision.includeInConversionBenchmark) includeInConversionBenchmarkCount += 1;
    if (decision.includeInProofreadBenchmark) includeInProofreadBenchmarkCount += 1;
    return {
      id: fixture.id,
      status: fixture.status,
      category: fixture.category,
      expectedUnicode,
      observedCurrent,
      currentMatchesExpected: observedCurrent === expectedUnicode,
      includeInConversionBenchmark: decision.includeInConversionBenchmark,
      includeInProofreadBenchmark: decision.includeInProofreadBenchmark,
      notes: fixture.notes
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: fixtures.length,
    includeInConversionBenchmarkCount,
    includeInProofreadBenchmarkCount,
    byStatus,
    converterBugCount: byStatus["converter-bug"],
    sourceTypoOrAmbiguousCount: byStatus["source-text-typo"] + byStatus["ambiguous-legacy-encoding"],
    expectedOutputBugCount: byStatus["expected-output-bug"],
    cases
  };
}

function readJsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

if (process.env.LEKH_SCRIPT === "audit-preeti-source") {
  const report = runPreetiSourceAudit();
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
