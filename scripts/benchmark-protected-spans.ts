import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convertPreeti, convertRomanized, type ConversionResult, type EngineMode } from "../src/engine";

interface ProtectedFixture {
  id: string;
  mode: EngineMode;
  category: string;
  severity: "P0" | "P1" | "P2";
  input: string;
  expectedProtectedSpans: string[];
  notes: string;
}

interface CaseReport {
  id: string;
  mode: EngineMode;
  category: string;
  severity: ProtectedFixture["severity"];
  passed: boolean;
  failureCategory?: "protected-span-failure" | "missing-placeholder" | "altered-span-list" | "english-corruption";
  missingSpanList: string[];
  alteredSpanList: string[];
  corruptedSpanList: string[];
  output?: string;
  error?: string;
}

const root = process.cwd();
const fixtureFiles = [
  join(root, "benchmarks/protected-spans/romanized-mixed-admin.jsonl"),
  join(root, "benchmarks/protected-spans/preeti-mixed-admin.jsonl")
];

const fixtures = fixtureFiles.flatMap(readJsonl);
const cases = fixtures.map(runCase);
const failed = cases.filter((item) => !item.passed);
const summary = {
  generatedAt: new Date().toISOString(),
  totalCases: cases.length,
  passedProtectedPreservation: cases.length - failed.length,
  failedProtectedPreservation: failed.length,
  corruptedSpanList: unique(failed.flatMap((item) => item.corruptedSpanList)),
  missingSpanList: unique(failed.flatMap((item) => item.missingSpanList)),
  alteredSpanList: unique(failed.flatMap((item) => item.alteredSpanList)),
  modeCounts: countBy(cases, (item) => item.mode),
  failureCategories: countBy(failed, (item) => item.failureCategory ?? "protected-span-failure"),
  cases
};

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(join(root, "reports/protected-span-report.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));

if (failed.length > 0) {
  process.exit(1);
}

function runCase(fixture: ProtectedFixture): CaseReport {
  try {
    const result = convertForMode(fixture);
    const extracted = result.protectedSpans.map((span) => span.original);
    const missingSpanList = fixture.expectedProtectedSpans.filter((span) => !extracted.includes(span));
    const corruptedSpanList = fixture.expectedProtectedSpans.filter((span) => !result.output.includes(span));
    const alteredSpanList = fixture.expectedProtectedSpans.filter((span) => {
      if (result.output.includes(span)) return false;
      return extracted.some((extractedSpan) => extractedSpan.toLowerCase() === span.toLowerCase());
    });
    const passed = missingSpanList.length === 0 && corruptedSpanList.length === 0 && alteredSpanList.length === 0;

    return {
      id: fixture.id,
      mode: fixture.mode,
      category: fixture.category,
      severity: fixture.severity,
      passed,
      failureCategory: passed ? undefined : missingSpanList.length > 0 ? "protected-span-failure" : "english-corruption",
      missingSpanList,
      alteredSpanList,
      corruptedSpanList,
      output: result.output
    };
  } catch (error) {
    return {
      id: fixture.id,
      mode: fixture.mode,
      category: fixture.category,
      severity: fixture.severity,
      passed: false,
      failureCategory: "missing-placeholder",
      missingSpanList: fixture.expectedProtectedSpans,
      alteredSpanList: [],
      corruptedSpanList: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function convertForMode(fixture: ProtectedFixture): ConversionResult {
  if (fixture.mode.startsWith("preeti")) return convertPreeti(fixture.input, { mode: fixture.mode, benchmark: true });
  return convertRomanized(fixture.input, { mode: fixture.mode, benchmark: true });
}

function readJsonl(file: string): ProtectedFixture[] {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as ProtectedFixture;
      } catch (error) {
        throw new Error(`${file}:${index + 1}: invalid JSONL fixture: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
