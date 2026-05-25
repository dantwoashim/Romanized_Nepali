import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSpellHintsWithHunspell } from "../src/core/dictionary/spellHints";
import { suggestWords } from "../src/core/dictionary/suggestWords";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { transliterateRomanized } from "../src/core/transliteration/transliterateRomanized";

interface RomanizedCase {
  category: string;
  input: string;
  expected: string;
  type?: string;
  source?: string;
  id?: string;
}

interface BucketStats {
  fixtureCount: number;
  top1: number;
  top3: number;
  top5: number;
  mrr: number;
}

export interface RomanizedBenchmarkReport {
  generatedAt: string;
  fixtureCount: number;
  byType: Record<string, BucketStats>;
  top1: number;
  top3: number;
  top5: number;
  meanReciprocalRank: number;
  phraseAccuracy: number;
  nameAccuracy: number;
  mixedEnglishCorruptionRate: number;
  oovRecoveryRate: number;
  suggestionHitAt5: number;
  remainingFailures: Array<{ id: string; category: string; expected: string; actual: string }>;
}

const root = process.cwd();

export async function runRomanizedBenchmark(): Promise<RomanizedBenchmarkReport> {
  const cases = loadRomanizedCases();
  const failures: RomanizedBenchmarkReport["remainingFailures"] = [];
  const buckets = new Map<string, { total: number; top1: number; top3: number; top5: number; rr: number }>();
  let top1 = 0;
  let top3 = 0;
  let top5 = 0;
  let rr = 0;
  let phraseTotal = 0;
  let phraseHit = 0;
  let nameTotal = 0;
  let nameHit = 0;
  let mixedTotal = 0;
  let mixedCorrupt = 0;
  let oovTotal = 0;
  let oovRecovered = 0;
  let suggestionChecks = 0;
  let suggestionHits = 0;

  for (const item of cases) {
    const result = transliterateRomanized(item.input);
    const expected = normalizeNepaliText(item.expected);
    const actual = result.normalizedOutput;
    const rank = result.candidates.findIndex((candidate) => candidate.normalizedText === expected) + 1;
    const type = item.type ?? "generated";
    const bucket = buckets.get(type) ?? { total: 0, top1: 0, top3: 0, top5: 0, rr: 0 };

    bucket.total += 1;
    if (actual === expected) {
      top1 += 1;
      bucket.top1 += 1;
    } else {
      failures.push({ id: item.id ?? item.input, category: item.category, expected, actual });
    }
    if (rank > 0 && rank <= 3) {
      top3 += 1;
      bucket.top3 += 1;
    }
    if (rank > 0 && rank <= 5) {
      top5 += 1;
      bucket.top5 += 1;
    }
    if (rank > 0) {
      rr += 1 / rank;
      bucket.rr += 1 / rank;
    }

    if (/phrase|postposition|government|office|legal|education/.test(item.category)) {
      phraseTotal += 1;
      if (actual === expected) phraseHit += 1;
    }
    if (/name|names/.test(item.category)) {
      nameTotal += 1;
      if (actual === expected) nameHit += 1;
    }
    if (/mixed/i.test(item.category) || /[A-Z]{2,}|report|file|form|field|X-ray/.test(item.input)) {
      mixedTotal += 1;
      if (!preservesEnglishTokens(item.input, actual)) mixedCorrupt += 1;
    }
    if (item.type === "manual" && result.trace.some((trace) => trace.rule === "preserve-unknown")) {
      oovTotal += 1;
      if (rank > 0 && rank <= 5) oovRecovered += 1;
    }
    if (/^[A-Za-z]+$/.test(item.input)) {
      suggestionChecks += 1;
      if (suggestWords(item.input, 5).some((suggestion) => suggestion.normalizedWord === expected)) suggestionHits += 1;
    }

    buckets.set(type, bucket);
  }

  await getSpellHintsWithHunspell("नेपाल सरकार झझझझ");

  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: cases.length,
    byType: Object.fromEntries(
      Array.from(buckets.entries()).map(([type, bucket]) => [
        type,
        {
          fixtureCount: bucket.total,
          top1: bucket.top1 / bucket.total,
          top3: bucket.top3 / bucket.total,
          top5: bucket.top5 / bucket.total,
          mrr: bucket.rr / bucket.total
        }
      ])
    ),
    top1: top1 / cases.length,
    top3: top3 / cases.length,
    top5: top5 / cases.length,
    meanReciprocalRank: rr / cases.length,
    phraseAccuracy: phraseTotal === 0 ? 1 : phraseHit / phraseTotal,
    nameAccuracy: nameTotal === 0 ? 1 : nameHit / nameTotal,
    mixedEnglishCorruptionRate: mixedTotal === 0 ? 0 : mixedCorrupt / mixedTotal,
    oovRecoveryRate: oovTotal === 0 ? 1 : oovRecovered / oovTotal,
    suggestionHitAt5: suggestionChecks === 0 ? 1 : suggestionHits / suggestionChecks,
    remainingFailures: failures.slice(0, 20)
  };
}

function loadRomanizedCases(): RomanizedCase[] {
  const generated = JSON.parse(readFileSync(join(root, "src/data/fixtures/romanized-fixtures.json"), "utf8")) as RomanizedCase[];
  const manual = JSON.parse(readFileSync(join(root, "benchmarks/romanized/manual-high-value.json"), "utf8")) as RomanizedCase[];
  const competitor = JSON.parse(readFileSync(join(root, "benchmarks/romanized/competitor-probes.json"), "utf8")) as RomanizedCase[];
  const userSubmitted = JSON.parse(readFileSync(join(root, "benchmarks/romanized/user-submitted.json"), "utf8")) as RomanizedCase[];
  return [
    ...generated.map((item) => ({ ...item, type: "generated" })),
    ...manual,
    ...competitor,
    ...userSubmitted
  ];
}

function preservesEnglishTokens(input: string, output: string): boolean {
  const tokens = input.match(/\b(?:[A-Z]{2,}|X-ray|x-ray|PDF|NID|URL|Excel|Word|file|form|field|report|office|system|data)\b/g) ?? [];
  return tokens.every((token) => output.includes(token));
}

if (process.argv[1]?.endsWith("benchmark-romanized.ts")) {
  const report = await runRomanizedBenchmark();
  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes("--write")) {
    mkdirSync(join(root, "reports"), { recursive: true });
    writeFileSync(join(root, "reports/romanized-benchmark.json"), `${JSON.stringify(report, null, 2)}\n`);
  }
}
