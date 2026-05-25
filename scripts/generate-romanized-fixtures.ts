import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(root, "src/data/wordlists/ne-seed.tsv");
const fixturePath = join(root, "src/data/fixtures/romanized-fixtures.json");

interface SeedEntry {
  word: string;
  romanized: string;
  frequency: number;
  domain: string;
  source: string;
}

interface Fixture {
  category: string;
  input: string;
  expected: string;
}

const englishPreserved = new Set(["nid", "pdf", "excel", "word", "form", "field", "date", "email", "url"]);

const rows = readFileSync(seedPath, "utf8").trim().split(/\n/);
const entries: SeedEntry[] = rows.slice(1).map((line) => {
  const [word, romanized, frequency, domain, source] = line.split("\t");
  return { word, romanized, frequency: Number(frequency), domain, source };
});

const fixtures: Fixture[] = [
  { category: "everyday", input: "namaste", expected: "नमस्ते" },
  { category: "everyday", input: "mero naam", expected: "मेरो नाम" },
  { category: "government", input: "sarkar", expected: "सरकार" },
  { category: "government", input: "suchana", expected: "सूचना" },
  { category: "education", input: "shiksha", expected: "शिक्षा" },
  { category: "legal", input: "kanun", expected: "कानुन" },
  { category: "names", input: "shrestha", expected: "श्रेष्ठ" },
  { category: "conjuncts", input: "kshamata", expected: "क्षमता" },
  { category: "conjuncts", input: "kshetra", expected: "क्षेत्र" },
  { category: "conjuncts", input: "gyan", expected: "ज्ञान" },
  { category: "conjuncts", input: "bigyan", expected: "विज्ञान" },
  { category: "conjuncts", input: "shram", expected: "श्रम" },
  { category: "conjuncts", input: "patra", expected: "पत्र" },
  { category: "mixed", input: "NID form ko naam field", expected: "NID form को नाम field" },
  { category: "mixed", input: "PDF ma naam", expected: "PDF मा नाम" },
  { category: "mixed", input: "Excel report", expected: "Excel रिपोर्ट" },
  { category: "mixed", input: "Word file", expected: "Word फाइल" },
  { category: "punctuation", input: "namaste, sathi!", expected: "नमस्ते, साथी!" },
  { category: "punctuation", input: "nepal ||", expected: "नेपाल ।" },
  { category: "numerals", input: "nagarikta 123", expected: "नागरिकता 123" },
  { category: "ri", input: "rishi", expected: "ऋषि" },
  { category: "ri", input: "rin", expected: "ऋण" },
  { category: "x", input: "xetra", expected: "क्षेत्र" },
  { category: "ch", input: "chitwan", expected: "चितवन" },
  { category: "chh", input: "chhaina", expected: "छैन" },
  { category: "v-w", input: "vidyalaya", expected: "विद्यालय" },
  { category: "v-w", input: "bikas", expected: "विकास" },
  { category: "v-w", input: "vikas", expected: "विकास" }
];

for (const entry of entries) {
  if (englishPreserved.has(entry.romanized.toLowerCase())) continue;
  fixtures.push({
    category: entry.domain,
    input: entry.romanized,
    expected: entry.word
  });
}

const phraseTemplates = [
  (entry: SeedEntry) => ({
    category: `${entry.domain}-phrase-ko`,
    input: `${entry.romanized} ko`,
    expected: `${entry.word} को`
  }),
  (entry: SeedEntry) => ({
    category: `${entry.domain}-phrase-ma`,
    input: `${entry.romanized} ma`,
    expected: `${entry.word} मा`
  }),
  (entry: SeedEntry) => ({
    category: `${entry.domain}-phrase-mero`,
    input: `mero ${entry.romanized}`,
    expected: `मेरो ${entry.word}`
  }),
  (entry: SeedEntry) => ({
    category: `${entry.domain}-phrase-sewa`,
    input: `${entry.romanized} ra sewa`,
    expected: `${entry.word} र सेवा`
  })
];

for (const entry of entries) {
  if (englishPreserved.has(entry.romanized.toLowerCase())) continue;
  for (const makeFixture of phraseTemplates) {
    fixtures.push(makeFixture(entry));
    if (fixtures.length >= 620) break;
  }
  if (fixtures.length >= 620) break;
}

const uniqueFixtures = Array.from(
  new Map(fixtures.map((fixture) => [fixture.input, fixture])).values()
);

writeFileSync(fixturePath, `${JSON.stringify(uniqueFixtures, null, 2)}\n`);

console.log(`Wrote ${uniqueFixtures.length} romanized fixtures to ${fixturePath}`);
