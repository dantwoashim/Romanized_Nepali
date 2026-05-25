import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";

interface WordRow {
  word: string;
  romanized: string;
  frequency: number;
  domain: string;
  source: string;
}

interface PhraseRow {
  input: string;
  output: string;
  domain: string;
  frequency: number;
  source: string;
}

interface AliasRow {
  word: string;
  romanized: string;
  frequencyBoost: number;
  domain: string;
  source: string;
}

interface RomanizedBenchmark {
  id: string;
  type: "manual" | "competitor" | "user-submitted";
  category: string;
  input: string;
  expected: string;
  source: string;
}

interface PreetiBenchmark {
  id: string;
  type: "manual" | "held-out" | "competitor" | "user-submitted";
  category: string;
  input: string;
  expected: string;
  source: string;
}

const root = process.cwd();
const wordRows = parseWordRows(readFileSync(join(root, "src/data/wordlists/ne-seed.tsv"), "utf8"));
const phraseRows = parsePhraseRows(readFileSync(join(root, "src/data/phrases/romanized-phrases.tsv"), "utf8"));
const aliasRows = parseAliasRows(readFileSync(join(root, "src/data/aliases/romanized-aliases.tsv"), "utf8"));
const preservedRomanized = new Set(["nid", "pdf", "excel", "word", "file", "folder", "form", "field", "report", "office", "system", "record", "data", "print", "save", "format", "table", "sheet", "document", "doc", "docx", "id", "number", "phone", "mobile", "passport", "date", "email", "url"]);

mkdirSync(join(root, "benchmarks/preeti"), { recursive: true });
mkdirSync(join(root, "benchmarks/romanized"), { recursive: true });

writeJson(join(root, "benchmarks/romanized/manual-high-value.json"), buildRomanizedManualCases());
writeJson(join(root, "benchmarks/romanized/competitor-probes.json"), buildRomanizedCompetitorProbes());
writeJson(join(root, "benchmarks/romanized/user-submitted.json"), []);
writeJson(join(root, "benchmarks/preeti/manual-hard.json"), buildPreetiManualCases());
writeJson(join(root, "benchmarks/preeti/competitor-probes.json"), buildPreetiCompetitorProbes());
writeJson(join(root, "benchmarks/preeti/user-submitted.json"), []);

console.log("Wrote benchmark fixtures");

function buildRomanizedManualCases(): RomanizedBenchmark[] {
  const cases: RomanizedBenchmark[] = [];
  for (const phrase of phraseRows) {
    cases.push({
      id: `romanized-phrase-${cases.length + 1}`,
      type: "manual",
      category: `phrase:${phrase.domain}`,
      input: phrase.input,
      expected: phrase.output,
      source: phrase.source
    });
  }

  for (const alias of aliasRows.filter((row) => !isAmbiguousAlias(row))) {
    cases.push({
      id: `romanized-alias-${cases.length + 1}`,
      type: "manual",
      category: `alias:${alias.domain}`,
      input: alias.romanized,
      expected: alias.word,
      source: alias.source
    });
  }

  const highValueRows = wordRows
    .filter((row) => !row.source.includes("derived") && !/^(file|form|report|office|system|data)$/i.test(row.romanized))
    .filter((row) => !preservedRomanized.has(row.romanized.toLowerCase()))
    .sort((a, b) => b.frequency - a.frequency);
  const templates = [
    (row: WordRow) => ({ category: `word:${row.domain}`, input: row.romanized, expected: row.word }),
    (row: WordRow) => ({ category: `postposition:${row.domain}`, input: `${row.romanized} ko`, expected: `${row.word} को` }),
    (row: WordRow) => ({ category: `postposition:${row.domain}`, input: `${row.romanized} ma`, expected: `${row.word} मा` }),
    (row: WordRow) => ({ category: `phrase:${row.domain}`, input: `${row.romanized} ra sewa`, expected: `${row.word} र सेवा` }),
    (row: WordRow) => ({ category: `phrase:${row.domain}`, input: `${row.romanized} ko file`, expected: `${row.word} को file` }),
    (row: WordRow) => ({ category: `mixed:${row.domain}`, input: `${row.romanized} report`, expected: `${row.word} report` }),
    (row: WordRow) => ({ category: `mixed:${row.domain}`, input: `PDF ${row.romanized}`, expected: `PDF ${row.word}` })
  ];

  for (const row of highValueRows) {
    for (const makeCase of templates) {
      const item = makeCase(row);
      cases.push({
        id: `romanized-manual-${cases.length + 1}`,
        type: "manual",
        category: item.category,
        input: item.input,
        expected: item.expected,
        source: row.source
      });
    }
  }

  return dedupeRomanized(cases).slice(0, 500);
}

function buildRomanizedCompetitorProbes(): RomanizedBenchmark[] {
  return [
    ["phrase:government", "jilla prashasan karyalaya", "जिल्ला प्रशासन कार्यालय"],
    ["phrase:office", "janma miti", "जन्म मिति"],
    ["name", "lakshmi", "लक्ष्मी"],
    ["name", "laxmi", "लक्ष्मी"],
    ["mixed", "NID form ko naam field", "NID form को नाम field"],
    ["mixed", "X-ray report", "X-ray report"],
    ["phrase:government", "rastriya parichayapatra", "राष्ट्रिय परिचयपत्र"],
    ["phrase:education", "shiksha mantralaya", "शिक्षा मन्त्रालय"]
  ].map(([category, input, expected], index) => ({
    id: `romanized-competitor-${index + 1}`,
    type: "competitor",
    category,
    input,
    expected,
    source: "manual-black-box-probe"
  }));
}

function buildPreetiManualCases(): PreetiBenchmark[] {
  const expectedTexts = [
    ...phraseRows.map((row) => row.output),
    ...wordRows.filter((row) => !row.source.includes("derived")).slice(0, 90).map((row) => row.word),
    "कार्यालयमा सूचना दर्ता भयो।",
    "जिल्ला प्रशासन कार्यालय",
    "राष्ट्रिय परिचयपत्र",
    "शिक्षा मन्त्रालय",
    "NID form रिपोर्ट 123",
    "PDF file मा नाम",
    "X-ray report"
  ];

  return Array.from(new Set(expectedTexts.map((text) => normalizeNepaliText(text))))
    .slice(0, 120)
    .map((expected, index) => ({
      id: `preeti-manual-${index + 1}`,
      type: "manual",
      category: classifyPreeti(expected),
      input: toPreetiInput(expected),
      expected,
      source: "manual-hard-clean-room"
    }));
}

function buildPreetiCompetitorProbes(): PreetiBenchmark[] {
  return [
    "निर्णय",
    "कर्मचारी",
    "क्षेत्र",
    "प्रार्थना",
    "कार्यालयमा सूचना दर्ता भयो।",
    "NID form रिपोर्ट 123",
    "X-ray report"
  ].map((expected, index) => ({
    id: `preeti-competitor-${index + 1}`,
    type: "competitor",
    category: classifyPreeti(expected),
    input: toPreetiInput(expected),
    expected,
    source: "manual-black-box-probe"
  }));
}

function classifyPreeti(text: string): string {
  if (/[A-Za-z]/.test(text)) return "mixed-english";
  if (/र्/.test(text)) return "reph";
  if (/ि/.test(text)) return "matra";
  if (/्/.test(text)) return "conjunct";
  return "word";
}

function toPreetiInput(expected: string): string {
  return expected
    .split(/(\s+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token)) return token;
      if (/[A-Za-z0-9]/.test(token)) return token;
      return unicodeToPreeti(token);
    })
    .join("");
}

function parseWordRows(raw: string): WordRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [word, romanized, frequency, domain, source] = line.split("\t");
    return { word, romanized, frequency: Number(frequency), domain, source };
  });
}

function parsePhraseRows(raw: string): PhraseRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [input, output, domain, frequency, source] = line.split("\t");
    return { input, output, domain, frequency: Number(frequency), source };
  });
}

function parseAliasRows(raw: string): AliasRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [word, romanized, frequencyBoost, domain, source] = line.split("\t");
    return { word, romanized, frequencyBoost: Number(frequencyBoost), domain, source };
  });
}

function isAmbiguousAlias(alias: AliasRow): boolean {
  return wordRows.some((row) => row.romanized.toLowerCase() === alias.romanized.toLowerCase() && row.word !== alias.word);
}

function dedupeRomanized(cases: RomanizedBenchmark[]): RomanizedBenchmark[] {
  const seen = new Set<string>();
  const deduped: RomanizedBenchmark[] = [];
  for (const item of cases) {
    const key = item.input.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ ...item, id: `romanized-manual-${deduped.length + 1}` });
  }
  return deduped;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
