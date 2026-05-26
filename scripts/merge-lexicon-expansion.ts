import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";

interface GeneratedEntry {
  word: string;
  romanizations: string[];
  domains: string[];
  frequency?: number;
  source: string;
  license: string;
  reviewStatus: string;
}

interface SeedRow {
  word: string;
  romanized: string;
  frequency: number;
  domain: string;
  source: string;
}

const root = process.cwd();
const generatedPath = join(root, "data/lexicon/generated/hunspell-ranked-nepali.jsonl");
const seedPath = join(root, "src/data/wordlists/ne-seed.tsv");
const reportPath = join(root, "data/lexicon/generated/lexicon-merge-report.json");
const runtimeCapPath = join(root, "data/lexicon/generated/hunspell-runtime-cap.tsv");
const runtimeCap = 5000;

if (!existsSync(generatedPath)) {
  throw new Error(`Missing generated Hunspell artifact: ${generatedPath}. Run npm run lexicon:rank-hunspell first.`);
}

const seedRows = readSeedRows(readFileSync(seedPath, "utf8"));
const generatedRows = readGeneratedRows(readFileSync(generatedPath, "utf8"));
const seedByWord = new Map(seedRows.map((row) => [normalizeNepaliText(row.word), row]));
const cleanGenerated = generatedRows.filter((row) => isCleanGenerated(row));
const newRecallRows = cleanGenerated.filter((row) => !seedByWord.has(normalizeNepaliText(row.word)));
const cappedRows = newRecallRows.slice(0, runtimeCap);

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(
  runtimeCapPath,
  [
    "word\tromanized\tfrequency\tdomain\tsource\treviewStatus\tlicense",
    ...cappedRows.map((row) => [
      row.word,
      row.romanizations[0] ?? "",
      row.frequency ?? 1,
      row.domains[0] ?? "common",
      row.source,
      row.reviewStatus,
      row.license
    ].join("\t"))
  ].join("\n") + "\n"
);
writeFileSync(
  reportPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    seedRows: seedRows.length,
    generatedRows: generatedRows.length,
    cleanGeneratedRows: cleanGenerated.length,
    alreadyCoveredBySeed: cleanGenerated.length - newRecallRows.length,
    newRecallRows: newRecallRows.length,
    runtimeCapRows: cappedRows.length,
    policy: "No blind seed overwrite. Curated TSV remains authoritative; generated/imported-unreviewed rows are kept as separate artifacts for review or future lazy loading.",
    generatedPath,
    runtimeCapPath
  }, null, 2)}\n`
);

console.log(
  [
    `Read ${generatedRows.length} generated Hunspell rows.`,
    `Clean rows: ${cleanGenerated.length}.`,
    `Already covered by seed: ${cleanGenerated.length - newRecallRows.length}.`,
    `New recall rows available for review: ${newRecallRows.length}.`,
    `Wrote capped review artifact to ${runtimeCapPath}.`,
    `Wrote merge report to ${reportPath}.`,
    "Seed wordlist was not modified."
  ].join("\n")
);

function readSeedRows(raw: string): SeedRow[] {
  const [header, ...lines] = raw.trim().split(/\r?\n/);
  if (header !== "word\tromanized\tfrequency\tdomain\tsource") {
    throw new Error(`Unexpected seed header: ${header}`);
  }
  return lines.map((line) => {
    const [word, romanized, frequencyRaw, domain, source] = line.split("\t");
    return { word, romanized, frequency: Number(frequencyRaw), domain, source };
  });
}

function readGeneratedRows(raw: string): GeneratedEntry[] {
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as GeneratedEntry);
}

function isCleanGenerated(row: GeneratedEntry): boolean {
  const normalized = normalizeNepaliText(row.word ?? "");
  return (
    /^[\u0900-\u097F]{2,40}$/.test(normalized) &&
    Array.isArray(row.romanizations) &&
    /^[a-z][a-z0-9-]{1,48}$/.test(row.romanizations[0] ?? "") &&
    row.license === "LGPL-2.1" &&
    row.reviewStatus === "imported-unreviewed"
  );
}
