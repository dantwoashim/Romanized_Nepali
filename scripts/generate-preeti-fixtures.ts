import dictionaryNe from "dictionary-ne";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "../src/core/preeti/convertPreetiToUnicode";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(root, "src/data/fixtures/preeti-fixtures.json");
const TARGET_FIXTURE_COUNT = 10_000;

interface PreetiFixture {
  name: string;
  category: string;
  input: string;
  expected: string;
  source: string;
  warningCode?: string;
}

const existingFixtures = JSON.parse(readFileSync(fixturePath, "utf8")) as Array<Partial<PreetiFixture>>;
const manualFixtures = existingFixtures
  .filter((fixture) =>
    fixture.name &&
    fixture.input &&
    fixture.expected &&
    !fixture.name.startsWith("dictionary-ne-") &&
    !fixture.name.startsWith("generated-") &&
    !fixture.category?.includes("generated")
  )
  .slice(0, 120)
  .map((fixture) => ({
    name: fixture.name!,
    category: fixture.category ?? "manual-audited",
    input: fixture.input!,
    expected: normalizeNepaliText(fixture.expected!),
    source: fixture.source ?? "manual-audited-preeti",
    warningCode: fixture.warningCode
  }));

const dictionaryWords = extractDictionaryWords(dictionaryNe.dic.toString("utf8"));
const fixtures: PreetiFixture[] = [];
const seenInputs = new Set<string>();
const seenExpected = new Set<string>();
const buckets = new Map<string, PreetiFixture[]>();

for (const fixture of manualFixtures) addFixture(fixture, false);

for (const word of dictionaryWords) {
  if (seenExpected.has(word)) continue;

  const input = unicodeToPreeti(word);
  if (input === word || !input || input.length > 80) continue;

  const roundTrip = convertPreetiToUnicode(input).normalizedOutput;
  if (roundTrip !== word) continue;

  const category = classifyWord(word);
  const fixture = {
    name: `dictionary-ne-candidate-${buckets.size + 1}`,
    category,
    input,
    expected: word,
    source: "dictionary-ne@2.0.0-roundtrip"
  };
  const bucket = buckets.get(category) ?? [];
  bucket.push(fixture);
  buckets.set(category, bucket);
}

addBucket("dictionary-ne-reph", 1800);
addBucket("dictionary-ne-conjunct", 2200);
addBucket("dictionary-ne-half-letter", 2200);
addBucket("dictionary-ne-matra-i", 1200);
addBucket("dictionary-ne-long-word", 900);
addBucket("dictionary-ne-word", 1700);

for (const category of ["dictionary-ne-reph", "dictionary-ne-conjunct", "dictionary-ne-half-letter", "dictionary-ne-matra-i", "dictionary-ne-long-word", "dictionary-ne-word"]) {
  addBucket(category, TARGET_FIXTURE_COUNT);
}

if (fixtures.length < TARGET_FIXTURE_COUNT) {
  throw new Error(`Only generated ${fixtures.length} real Preeti round-trip fixtures; ${TARGET_FIXTURE_COUNT} required.`);
}

writeFileSync(fixturePath, `${JSON.stringify(fixtures.slice(0, TARGET_FIXTURE_COUNT), null, 2)}\n`);
console.log(`Wrote ${TARGET_FIXTURE_COUNT} real Preeti round-trip fixtures to ${fixturePath}`);

function extractDictionaryWords(dic: string): string[] {
  const [, ...rows] = dic.split(/\n/);
  const words = rows
    .map((row) => normalizeNepaliText(row.split("/")[0]?.trim() ?? ""))
    .filter((word) => isUsableNepaliWord(word));

  return Array.from(new Set(words)).sort((a, b) => scoreWord(b) - scoreWord(a) || a.localeCompare(b));
}

function isUsableNepaliWord(word: string): boolean {
  if (word.length < 2 || word.length > 28) return false;
  if (!/^[\u0900-\u097F]+$/.test(word)) return false;
  if (/^[०-९]+$/.test(word)) return false;
  return true;
}

function scoreWord(word: string): number {
  let score = 0;
  if (/्/.test(word)) score += 8;
  if (/ि/.test(word)) score += 5;
  if (/र्/.test(word)) score += 5;
  if (/[ािीुूृेैोौंँ]/.test(word)) score += 4;
  if (/(क्ष|त्र|ज्ञ|श्र|द्ध|द्द|त्त|द्य|प्र|क्र|ग्र)/.test(word)) score += 4;
  if (word.length >= 6) score += 2;
  if (word.length >= 10) score += 2;
  return score;
}

function classifyWord(word: string): string {
  if (/र्/.test(word)) return "dictionary-ne-reph";
  if (/(क्ष|त्र|ज्ञ|श्र|द्ध|द्द|त्त|द्य|प्र|क्र|ग्र)/.test(word)) return "dictionary-ne-conjunct";
  if (/ि/.test(word)) return "dictionary-ne-matra-i";
  if (/्/.test(word)) return "dictionary-ne-half-letter";
  if (word.length >= 10) return "dictionary-ne-long-word";
  return "dictionary-ne-word";
}

function addBucket(category: string, limit: number) {
  const bucket = buckets.get(category) ?? [];
  let added = 0;
  for (const fixture of bucket) {
    if (fixtures.length >= TARGET_FIXTURE_COUNT || added >= limit) break;
    if (addFixture({
      ...fixture,
      name: `dictionary-ne-${fixtures.length + 1}`
    })) {
      added += 1;
    }
  }
}

function addFixture(fixture: PreetiFixture, requireUniqueExpected = true): boolean {
  if (seenInputs.has(fixture.input)) return false;
  if (requireUniqueExpected && seenExpected.has(fixture.expected)) return false;
  seenInputs.add(fixture.input);
  seenExpected.add(fixture.expected);
  fixtures.push(fixture);
  return true;
}
