import dictionaryNe from "dictionary-ne";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import type { SuggestionDomain } from "../src/core/types";
import { devanagariToRomanizedAliases } from "./lib/devanagariAlias";

interface WordRow {
  word: string;
  romanized: string;
  frequency: number;
  domain: SuggestionDomain;
  source: string;
}

interface RankedHunspellRow extends WordRow {
  wikipediaFrequency: number;
  dictionaryRank: number;
  frequencyBand: "very-common" | "common" | "medium" | "rare" | "unknown";
  reviewStatus: "imported-unreviewed";
  license: "LGPL-2.1";
  notes: string;
}

const root = process.cwd();
const header = "word\tromanized\tfrequency\tdomain\tsource";
const defaultFrequencyPath = join(root, "data/generated/frequency/nepali-wikipedia-frequency.tsv");
const defaultReviewOutputPath = join(root, "data/lexicon/generated/hunspell-ranked-nepali.tsv");
const defaultJsonlOutputPath = join(root, "data/lexicon/generated/hunspell-ranked-nepali.jsonl");
const defaultProvenanceOutputPath = join(root, "data/lexicon/generated/hunspell-ranked-nepali.provenance.json");
const wordlistPath = join(root, "src/data/wordlists/ne-seed.tsv");
const rankedSource = "dictionary-ne-ranked";
const args = parseArgs(process.argv.slice(2));
const frequencyPath = args.frequency ?? defaultFrequencyPath;
const outputPath = args.output ?? defaultReviewOutputPath;
const jsonlOutputPath = args.jsonl ?? defaultJsonlOutputPath;
const provenanceOutputPath = args.provenance ?? defaultProvenanceOutputPath;
const applyToSeed = args.apply === "true" || process.argv.includes("--apply");
const limit = args.limit ? Number(args.limit) : 36000;

if (!Number.isInteger(limit) || limit < 1) {
  throw new Error("--limit must be a positive integer.");
}

const existingRows = parseWordRows(readFileSync(wordlistPath, "utf8"));
const existingByWord = new Map(existingRows.map((row) => [normalizeNepaliText(row.word), row]));
const frequencyByWord = existsSync(frequencyPath) ? readFrequencyRows(readFileSync(frequencyPath, "utf8")) : new Map<string, number>();
const dictionaryWords = extractDictionaryWords(Buffer.from(dictionaryNe.dic).toString("utf8"));
const rankedRows = rankDictionaryWords(dictionaryWords, frequencyByWord, existingByWord).slice(0, limit);

mkdirSync(dirname(outputPath), { recursive: true });
mkdirSync(dirname(jsonlOutputPath), { recursive: true });
writeFileSync(
  outputPath,
  [
    "word\tromanizations\tdomains\tfrequency\tfrequencyBand\trank\tsource\tlicense\treviewStatus\tnotes\twikipediaFrequency",
    ...rankedRows.map((row) =>
      [
        row.word,
        row.romanized,
        row.domain,
        row.frequency,
        row.frequencyBand,
        row.dictionaryRank,
        row.source,
        row.license,
        row.reviewStatus,
        row.notes,
        row.wikipediaFrequency
      ].join("\t")
    )
  ].join("\n") + "\n"
);
writeFileSync(
  jsonlOutputPath,
  rankedRows.map((row) =>
    JSON.stringify({
      id: `dictionary-ne:${row.dictionaryRank}:${row.word}`,
      word: row.word,
      romanizations: [row.romanized],
      domains: [row.domain],
      frequency: row.frequency,
      frequencyBand: row.frequencyBand,
      rank: row.dictionaryRank,
      source: "dictionary-ne",
      license: row.license,
      reviewStatus: row.reviewStatus,
      addedAt: new Date().toISOString().slice(0, 10),
      notes: row.notes,
      wikipediaFrequency: row.wikipediaFrequency
    })
  ).join("\n") + "\n"
);
writeFileSync(
  provenanceOutputPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "dictionary-ne",
    license: "LGPL-2.1",
    dictionaryBaseForms: dictionaryWords.length,
    rankedRows: rankedRows.length,
    frequencyPath,
    frequencyTokens: frequencyByWord.size,
    frequencyPolicy: existsSync(frequencyPath)
      ? "Local frequency artifact used as research input only; raw Wikipedia corpus is not bundled."
      : "No local frequency artifact found; deterministic fallback ordering used.",
    outputPath,
    jsonlOutputPath,
    seedMutation: applyToSeed
  }, null, 2)}\n`
);

if (applyToSeed) {
  const merged = new Map<string, WordRow>();
  for (const row of existingRows) {
    merged.set(normalizeNepaliText(row.word), row);
  }
  for (const row of rankedRows) {
    const key = normalizeNepaliText(row.word);
    const existing = merged.get(key);
    if (existing && !isRankedDictionarySource(existing.source)) continue;
    merged.set(key, {
      word: row.word,
      romanized: row.romanized,
      frequency: row.frequency,
      domain: row.domain,
      source: row.source
    });
  }

  const nextRows = Array.from(merged.values())
    .sort((a, b) => b.frequency - a.frequency || domainPriority(b.domain) - domainPriority(a.domain) || a.word.localeCompare(b.word, "ne"))
    .map((row) => [row.word, row.romanized, row.frequency, row.domain, row.source].join("\t"));
  writeFileSync(wordlistPath, `${header}\n${nextRows.join("\n")}\n`);
}

console.log(
  [
    `Extracted ${dictionaryWords.length} dictionary-ne base forms.`,
    `Ranked ${rankedRows.length} rows using ${frequencyByWord.size} local frequency tokens from ${frequencyPath}.`,
    `Wrote ranked TSV to ${outputPath}.`,
    `Wrote ranked JSONL to ${jsonlOutputPath}.`,
    `Wrote provenance report to ${provenanceOutputPath}.`,
    applyToSeed ? `Applied new dictionary-ne rows to ${wordlistPath}.` : "Seed wordlist was not modified; pass --apply to update it."
  ].join("\n")
);

function extractDictionaryWords(dic: string): string[] {
  const [, ...lines] = dic.split(/\r?\n/);
  return Array.from(
    new Set(
      lines
        .map((line) => normalizeNepaliText(line.split("/")[0]?.trim() ?? ""))
        .filter((word) => /^[\u0900-\u097F]{2,32}$/.test(word))
        .filter((word) => !/^[०-९]+$/.test(word))
    )
  );
}

function rankDictionaryWords(
  words: string[],
  frequencyByWord: Map<string, number>,
  existingByWord: Map<string, WordRow>
): RankedHunspellRow[] {
  return words
    .map((word) => {
      const wikipediaFrequency = frequencyByWord.get(word) ?? 0;
      return {
        word,
        romanized: choosePrimaryRomanized(word),
        frequency: scoreFrequency(word, wikipediaFrequency, existingByWord),
        domain: classifyDomain(word),
        source: rankedSource,
        wikipediaFrequency,
        dictionaryRank: 0,
        frequencyBand: frequencyBandForScore(wikipediaFrequency),
        reviewStatus: "imported-unreviewed" as const,
        license: "LGPL-2.1" as const,
        notes: "Generated by rank-hunspell-by-frequency.ts from dictionary-ne base form; ranking may use local frequency artifact when present."
      };
    })
    .filter((row) => /^[a-z][a-z0-9-]{1,48}$/.test(row.romanized))
    .sort((a, b) => b.wikipediaFrequency - a.wikipediaFrequency || b.frequency - a.frequency || a.word.localeCompare(b.word, "ne"))
    .map((row, index) => ({ ...row, dictionaryRank: index + 1 }));
}

function frequencyBandForScore(wikipediaFrequency: number): RankedHunspellRow["frequencyBand"] {
  if (wikipediaFrequency <= 0) return "unknown";
  if (wikipediaFrequency >= 1000) return "very-common";
  if (wikipediaFrequency >= 100) return "common";
  if (wikipediaFrequency >= 10) return "medium";
  return "rare";
}

function scoreFrequency(word: string, wikipediaFrequency: number, existingByWord: Map<string, WordRow>): number {
  const existing = existingByWord.get(word);
  if (existing) return existing.frequency;
  const corpusScore = Math.min(170, Math.floor(Math.log2(wikipediaFrequency + 1) * 18));
  const shapeScore = scoreWordShape(word);
  return Math.max(120, 690 + corpusScore + shapeScore);
}

function scoreWordShape(word: string): number {
  let score = 0;
  if (/्/.test(word)) score += 16;
  if (/(क्ष|त्र|ज्ञ|श्र|द्ध|द्द|त्त|द्य|प्र|क्र|ग्र|न्म|म्प|र्क|न्त्र|स्थ|ष्ट|ञ्च)/.test(word)) score += 12;
  if (/[ािीुूृेैोौंँ]/.test(word)) score += 6;
  if (word.length >= 6) score += 4;
  return score;
}

function choosePrimaryRomanized(word: string): string {
  const aliases = friendlyAliases(word);
  return aliases.sort((a, b) => aliasScore(a) - aliasScore(b) || a.length - b.length || a.localeCompare(b))[0] ?? "";
}

function friendlyAliases(word: string): string[] {
  const seed = devanagariToRomanizedAliases(word);
  const variants = new Set<string>();
  for (const alias of seed) {
    addAliasVariants(alias, variants);
  }
  return Array.from(variants).filter((alias) => alias.length >= 2 && /^[a-z]+$/.test(alias));
}

function addAliasVariants(alias: string, variants: Set<string>) {
  const normalized = alias.toLowerCase();
  const queue = new Set<string>([
    normalized,
    normalized.replace(/aa/g, "a"),
    normalized.replace(/ii/g, "i"),
    normalized.replace(/ee/g, "i"),
    normalized.replace(/v/g, "b"),
    normalized.replace(/ph/g, "f"),
    normalized.replace(/sh/g, "s")
  ]);

  for (const item of Array.from(queue)) {
    queue.add(item.replace(/aa/g, "a").replace(/ii/g, "i").replace(/ee/g, "i"));
  }

  for (const item of queue) variants.add(item);
}

function aliasScore(alias: string): number {
  let score = 0;
  if (/aa|ii|ee/.test(alias)) score += 8;
  if (/sh/.test(alias)) score += 2;
  if (alias.length <= 3) score += 4;
  return score;
}

function classifyDomain(word: string): SuggestionDomain {
  if (/(प्रशासन|कार्यालय|नागरिक|वडा|पालिका|मन्त्रालय|संसद|मन्त्रि|राज्य|राष्ट्रिय|सरकार|विभाग|अधिकारी|सूचना|सार्वजनिक|संघ|प्रदेश|जिल्ला)/.test(word)) return "government";
  if (/(विद्यालय|शिक्षा|विद्यार्थी|शिक्षक|कक्षा|परीक्षा|पुस्तक|पाठ्य|अभिभावक|छात्र|प्राध्यापक)/.test(word)) return "education";
  if (/(कानुन|मुद्दा|अदालत|प्रमाण|न्याय|करार|वकिल|फैसला|नियम|ऐन|संविधान|अधिकार|उजुरी)/.test(word)) return "legal";
  if (/(फाइल|दर्ता|हाजिरी|बैठक|सम्पर्क|विवरण|पत्र|मिति|हस्ताक्षर|प्रतिवेदन|चलानी|सूची|रसिद)/.test(word)) return "office";
  return "common";
}

function readFrequencyRows(raw: string): Map<string, number> {
  const rows = new Map<string, number>();
  for (const line of raw.trim().split(/\r?\n/).slice(1)) {
    const [word, frequencyRaw] = line.split("\t");
    const normalized = normalizeNepaliText(word ?? "");
    const frequency = Number(frequencyRaw);
    if (/^[\u0900-\u097F]{2,40}$/.test(normalized) && Number.isFinite(frequency)) {
      rows.set(normalized, frequency);
    }
  }
  return rows;
}

function parseWordRows(raw: string): WordRow[] {
  const [first, ...rows] = raw.trim().split(/\r?\n/);
  if (first !== header) throw new Error(`Unexpected wordlist header: ${first}`);
  return rows.map((line) => {
    const [word, romanized, frequency, domain, source] = line.split("\t");
    return { word, romanized, frequency: Number(frequency), domain: domain as SuggestionDomain, source };
  });
}

function isRankedDictionarySource(source: string): boolean {
  return source === rankedSource || source.includes("dictionary-ne@2.0.0:ranked-hunspell");
}

function domainPriority(domain: SuggestionDomain) {
  return {
    names: 7,
    places: 6,
    government: 5,
    legal: 4,
    office: 3,
    education: 2,
    common: 1
  }[domain];
}

function parseArgs(argv: string[]) {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    if (arg === "--apply") {
      parsed.apply = "true";
      continue;
    }
    parsed[arg.slice(2)] = argv[index + 1];
    index += 1;
  }
  return parsed;
}
