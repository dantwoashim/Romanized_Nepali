import { readFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { convertPreetiToUnicode } from "../src/core/preeti/convertPreetiToUnicode";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";

interface PreetiFixture {
  name: string;
  category: string;
  input: string;
  expected: string;
  source: string;
}

const root = process.cwd();
const fixturePath = join(root, "src/data/fixtures/preeti-fixtures.json");
const heldOutFixturePath = join(root, "src/data/fixtures/preeti-heldout-fixtures.json");
const userSubmittedFixturePath = join(root, "src/data/fixtures/preeti-user-submitted-fixtures.json");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8")) as PreetiFixture[];
const heldOutFixtures = JSON.parse(readFileSync(heldOutFixturePath, "utf8")) as PreetiFixture[];
const userSubmittedFixtures = JSON.parse(readFileSync(userSubmittedFixturePath, "utf8")) as PreetiFixture[];

let exact = 0;
let wordExact = 0;
let totalCharDistance = 0;
let totalExpectedChars = 0;
let totalWordDistance = 0;
let totalExpectedWords = 0;
let totalWarnings = 0;
const latencies: number[] = [];
const byCategory = new Map<string, { total: number; exact: number }>();
const bySource = new Map<string, number>();

for (const fixture of [...fixtures, ...heldOutFixtures, ...userSubmittedFixtures]) {
  const started = performance.now();
  const result = convertPreetiToUnicode(fixture.input);
  latencies.push(performance.now() - started);

  const actual = result.normalizedOutput;
  const expected = normalizeNepaliText(fixture.expected);
  const distance = levenshtein(actual, expected);
  totalCharDistance += distance;
  totalExpectedChars += expected.length;
  const actualWords = tokenizeWords(actual);
  const expectedWords = tokenizeWords(expected);
  totalWordDistance += levenshteinArray(actualWords, expectedWords);
  totalExpectedWords += expectedWords.length;
  totalWarnings += result.warnings.length;
  bySource.set(fixture.source, (bySource.get(fixture.source) ?? 0) + 1);

  const category = byCategory.get(fixture.category) ?? { total: 0, exact: 0 };
  category.total += 1;
  if (actual === expected) {
    exact += 1;
    category.exact += 1;
  }
  if (actual.split(/\s+/).join(" ") === expected.split(/\s+/).join(" ")) wordExact += 1;
  byCategory.set(fixture.category, category);
}

const sortedLatencies = [...latencies].sort((a, b) => a - b);
const report = {
  generatedAt: new Date().toISOString(),
  fixtureCount: fixtures.length + heldOutFixtures.length + userSubmittedFixtures.length,
  fixtureTypes: {
    manual: fixtures.filter((fixture) => fixture.source === "manual-audited-preeti").length,
    generated: fixtures.filter((fixture) => fixture.source === "dictionary-ne@2.0.0-roundtrip").length,
    heldOut: heldOutFixtures.length,
    userSubmitted: userSubmittedFixtures.length
  },
  exactMatchRate: exact / (fixtures.length + heldOutFixtures.length + userSubmittedFixtures.length),
  whitespaceInsensitiveWordMatchRate: wordExact / (fixtures.length + heldOutFixtures.length + userSubmittedFixtures.length),
  characterErrorRate: totalExpectedChars === 0 ? 0 : totalCharDistance / totalExpectedChars,
  wordErrorRate: totalExpectedWords === 0 ? 0 : totalWordDistance / totalExpectedWords,
  warningRatePerFixture: totalWarnings / fixtures.length,
  averageLatencyMs: average(latencies),
  p95LatencyMs: sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] ?? 0,
  categories: Object.fromEntries(
    Array.from(byCategory.entries()).map(([category, value]) => [
      category,
      {
        fixtureCount: value.total,
        exactMatchRate: value.exact / value.total
      }
    ])
  ),
  sources: Object.fromEntries(Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]))
};

console.log(JSON.stringify(report, null, 2));

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function levenshtein(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= b.length; column += 1) rows[0][column] = column;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + cost);
    }
  }

  return rows[a.length][b.length];
}

function tokenizeWords(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

function levenshteinArray(a: string[], b: string[]): number {
  const rows = Array.from({ length: a.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= b.length; column += 1) rows[0][column] = column;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + cost);
    }
  }

  return rows[a.length][b.length];
}
