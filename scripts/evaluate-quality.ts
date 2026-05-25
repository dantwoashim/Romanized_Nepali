import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { transliterateRomanized } from "../src/core/transliteration/transliterateRomanized";

interface RomanizedFixture {
  category: string;
  input: string;
  expected: string;
}

interface QualityReport {
  generatedAt: string;
  romanized: {
    fixtureCount: number;
    precisionAt1: number;
    precisionAt5: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
  };
  suggestions: {
    checkedSingleTokenFixtures: number;
    hitRateAt5: number;
  };
}

const root = process.cwd();
const fixturePath = join(root, "src/data/fixtures/romanized-fixtures.json");
const wordlistPath = join(root, "src/data/wordlists/ne-seed.tsv");
const outputPath = process.argv.includes("--write") ? join(root, "reports/quality-report.json") : undefined;
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8")) as RomanizedFixture[];
const suggestions = readWordlist(wordlistPath);
const latencies: number[] = [];
let exactTop1 = 0;
let exactTop5 = 0;
let suggestionChecks = 0;
let suggestionHits = 0;

for (const fixture of fixtures) {
  const started = performance.now();
  const result = transliterateRomanized(fixture.input);
  latencies.push(performance.now() - started);

  const expected = normalizeNepaliText(fixture.expected);
  if (result.normalizedOutput === expected) exactTop1 += 1;
  if (result.candidates.slice(0, 5).some((candidate) => candidate.normalizedText === expected)) exactTop5 += 1;

  if (/^[A-Za-z]+$/.test(fixture.input)) {
    suggestionChecks += 1;
    if (suggestionsForPrefix(fixture.input, suggestions, 5).some((suggestion) => suggestion.normalizedWord === expected)) {
      suggestionHits += 1;
    }
  }
}

const sortedLatencies = [...latencies].sort((a, b) => a - b);
const report: QualityReport = {
  generatedAt: new Date().toISOString(),
  romanized: {
    fixtureCount: fixtures.length,
    precisionAt1: exactTop1 / fixtures.length,
    precisionAt5: exactTop5 / fixtures.length,
    averageLatencyMs: latencies.reduce((sum, value) => sum + value, 0) / latencies.length,
    p95LatencyMs: sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] ?? 0
  },
  suggestions: {
    checkedSingleTokenFixtures: suggestionChecks,
    hitRateAt5: suggestionChecks === 0 ? 0 : suggestionHits / suggestionChecks
  }
};

console.log(JSON.stringify(report, null, 2));

if (outputPath) {
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${outputPath}`);
}

interface SuggestionRow {
  word: string;
  normalizedWord: string;
  romanized: string;
  frequency: number;
}

function readWordlist(path: string): SuggestionRow[] {
  const [, ...rows] = readFileSync(path, "utf8").trim().split(/\n/);
  return rows.map((row) => {
    const [word, romanized, frequency] = row.split("\t");
    return {
      word,
      normalizedWord: normalizeNepaliText(word),
      romanized,
      frequency: Number(frequency)
    };
  });
}

function suggestionsForPrefix(prefix: string, rows: SuggestionRow[], limit: number) {
  const normalizedPrefix = prefix.toLowerCase();
  return rows
    .filter((row) => row.romanized.toLowerCase().startsWith(normalizedPrefix))
    .sort((a, b) => b.frequency - a.frequency || a.normalizedWord.localeCompare(b.normalizedWord))
    .slice(0, limit);
}
