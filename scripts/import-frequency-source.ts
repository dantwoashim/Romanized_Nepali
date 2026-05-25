import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";

type SourceStatus = "bundle-safe" | "reference-only" | "blocked" | "local-research-only";

const SOURCE_STATUS: Record<string, SourceStatus> = {
  "lekh-manual": "bundle-safe",
  "dictionary-ne": "bundle-safe",
  "brihat-sabdakosh-json": "blocked",
  "kaggle-nepali-unigrams": "blocked",
  "nagarik-setopati-corpus": "local-research-only"
};

const args = parseArgs(process.argv.slice(2));
const source = args.source;
const inputPath = args.input;
const requestedOutputPath = args.output;

if (!source || !inputPath) {
  throw new Error("Usage: npm run import:frequency -- --source <source-id> --input <path> [--output <path>]");
}

const status = SOURCE_STATUS[source];
if (!status) throw new Error(`Unknown source "${source}". Add it to SOURCE_STATUS after license review.`);
if (status === "blocked") throw new Error(`Source "${source}" is blocked and must not be imported.`);

const rows = buildFrequencyRows(readFileSync(inputPath, "utf8"));
if (rows.length === 0) throw new Error(`No valid Devanagari tokens found in ${inputPath}.`);

const outputPath =
  status === "bundle-safe"
    ? requestedOutputPath ?? join(process.cwd(), "src/data/wordlists", `${source}-frequency.tsv`)
    : join(process.cwd(), "data/generated/frequency", `${source}-${basename(inputPath)}.tsv`);

if (status !== "bundle-safe") {
  console.warn(`Source "${source}" is ${status}; writing only to ignored local artifact ${outputPath}.`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, ["word\tfrequency\tdomain\tsource", ...rows.map((row) => `${row.word}\t${row.frequency}\tcommon\t${source}`)].join("\n") + "\n");
console.log(`Wrote ${rows.length} validated frequency rows to ${outputPath}`);

function buildFrequencyRows(input: string) {
  const counts = new Map<string, number>();
  for (const token of input.match(/[\u0900-\u097F]+/g) ?? []) {
    const normalized = normalizeNepaliText(token);
    if (!isValidDevanagariToken(normalized)) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, frequency]) => ({ word, frequency }))
    .sort((a, b) => b.frequency - a.frequency || a.word.localeCompare(b.word));
}

function isValidDevanagariToken(token: string): boolean {
  if (token.length < 2 || token.length > 40) return false;
  if (!/^[\u0900-\u097F]+$/.test(token)) return false;
  if (/^[०-९]+$/.test(token)) return false;
  return normalizeNepaliText(token) === token;
}

function parseArgs(argv: string[]) {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    parsed[arg.slice(2)] = argv[index + 1];
    index += 1;
  }
  return parsed;
}
