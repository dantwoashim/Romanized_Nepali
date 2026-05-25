import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(root, "src/data/wordlists/ne-seed.tsv");
const fixtureDir = join(root, "src/data/fixtures");

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

const romanizedFixturePath = join(fixtureDir, "romanized-fixtures.json");
const splitPaths = {
  lexical: join(fixtureDir, "romanized-lexical-fixtures.json"),
  generatedPhrase: join(fixtureDir, "romanized-generated-phrase-fixtures.json"),
  namesPlaces: join(fixtureDir, "romanized-names-places-fixtures.json"),
  adminLegal: join(fixtureDir, "romanized-admin-legal-fixtures.json"),
  mixedEnglish: join(fixtureDir, "romanized-mixed-english-fixtures.json"),
  malformedSpacing: join(fixtureDir, "romanized-malformed-spacing-fixtures.json"),
  regressions: join(fixtureDir, "romanized-regression-fixtures.json"),
  ruleOnly: join(fixtureDir, "romanized-rule-fixtures.json")
};

const englishPreserved = [
  "NID",
  "PDF",
  "Excel",
  "Word",
  "file",
  "folder",
  "form",
  "field",
  "report",
  "office",
  "system",
  "record",
  "data",
  "print",
  "save",
  "format",
  "table",
  "sheet",
  "document",
  "doc",
  "docx",
  "ID",
  "number",
  "phone",
  "mobile",
  "passport",
  "date",
  "email",
  "URL"
];

const rows = readFileSync(seedPath, "utf8").trim().split(/\n/);
const entries: SeedEntry[] = rows.slice(1).map((line) => {
  const [word, romanized, frequency, domain, source] = line.split("\t");
  return { word, romanized, frequency: Number(frequency), domain, source };
});

const preservedRomanized = new Set(englishPreserved.map((token) => token.toLowerCase()));
const sortedEntries = uniqueByRomanized([...entries]
  .filter((entry) => !preservedRomanized.has(entry.romanized.toLowerCase()))
  .sort((a, b) => b.frequency - a.frequency || a.romanized.localeCompare(b.romanized)));
const baseEntries = sortedEntries.filter((entry) => !entry.source.includes("derived"));
const namesPlacesEntries = sortedEntries.filter((entry) => entry.domain === "names" || entry.domain === "places");
const adminLegalEntries = sortedEntries.filter((entry) => ["government", "office", "legal"].includes(entry.domain));

const lexical = uniqueByInput(
  baseEntries.map((entry) => ({
    category: `lexical:${entry.domain}`,
    input: entry.romanized,
    expected: entry.word
  }))
);

const namesPlaces = uniqueByInput(
  namesPlacesEntries.map((entry) => ({
    category: `names-places:${entry.domain}`,
    input: entry.romanized,
    expected: entry.word
  }))
).slice(0, 900);

const adminLegal = uniqueByInput(
  adminLegalEntries.map((entry) => ({
    category: `admin-legal:${entry.domain}`,
    input: entry.romanized,
    expected: entry.word
  }))
).slice(0, 900);

const generatedPhrase = uniqueByInput(generatePhrases([...baseEntries, ...sortedEntries])).slice(0, 1700);
const mixedEnglish = uniqueByInput(generateMixedEnglish(sortedEntries)).slice(0, 800);
const malformedSpacing = uniqueByInput(generateMalformedSpacing(baseEntries)).slice(0, 700);
const regressions = uniqueByInput(generateRegressions(sortedEntries)).slice(0, 174);
const ruleOnly = generateRuleOnlyFixtures();

const aggregate = takeUnique(
  [
    ...lexical,
    ...namesPlaces,
    ...adminLegal,
    ...generatedPhrase,
    ...mixedEnglish,
    ...malformedSpacing,
    ...regressions
  ],
  5000
);

writeJson(romanizedFixturePath, aggregate);
writeJson(splitPaths.lexical, lexical);
writeJson(splitPaths.namesPlaces, namesPlaces);
writeJson(splitPaths.adminLegal, adminLegal);
writeJson(splitPaths.generatedPhrase, generatedPhrase);
writeJson(splitPaths.mixedEnglish, mixedEnglish);
writeJson(splitPaths.malformedSpacing, malformedSpacing);
writeJson(splitPaths.regressions, regressions);
writeJson(splitPaths.ruleOnly, ruleOnly);

console.log(`Wrote ${aggregate.length} aggregate romanized fixtures`);
console.log(`  lexical: ${lexical.length}`);
console.log(`  names/places: ${namesPlaces.length}`);
console.log(`  admin/legal: ${adminLegal.length}`);
console.log(`  generated phrase: ${generatedPhrase.length}`);
console.log(`  mixed English: ${mixedEnglish.length}`);
console.log(`  malformed spacing: ${malformedSpacing.length}`);
console.log(`  regressions: ${regressions.length}`);
console.log(`  rule-only: ${ruleOnly.length}`);

function generatePhrases(seedEntries: SeedEntry[]): Fixture[] {
  const fixtures: Fixture[] = [];
  const templates = [
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:ko`,
      input: `${entry.romanized} ko`,
      expected: `${entry.word} को`
    }),
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:ma`,
      input: `${entry.romanized} ma`,
      expected: `${entry.word} मा`
    }),
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:mero`,
      input: `mero ${entry.romanized}`,
      expected: `मेरो ${entry.word}`
    }),
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:sewa`,
      input: `${entry.romanized} ra sewa`,
      expected: `${entry.word} र सेवा`
    }),
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:file`,
      input: `${entry.romanized} ko file`,
      expected: `${entry.word} को file`
    }),
    (entry: SeedEntry) => ({
      category: `generated-phrase:${entry.domain}:report`,
      input: `${entry.romanized} report ma`,
      expected: `${entry.word} report मा`
    })
  ];

  for (const entry of seedEntries) {
    for (const makeFixture of templates) fixtures.push(makeFixture(entry));
  }
  return fixtures;
}

function generateMixedEnglish(seedEntries: SeedEntry[]): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let index = 0; index < seedEntries.length; index += 1) {
    const entry = seedEntries[index];
    const english = englishPreserved[index % englishPreserved.length];
    fixtures.push({
      category: `mixed-english:${entry.domain}:prefix`,
      input: `${english} ${entry.romanized}`,
      expected: `${english} ${entry.word}`
    });
    fixtures.push({
      category: `mixed-english:${entry.domain}:postposition`,
      input: `${english} ${entry.romanized} ma`,
      expected: `${english} ${entry.word} मा`
    });
    fixtures.push({
      category: `mixed-english:${entry.domain}:suffix`,
      input: `${entry.romanized} ${english}`,
      expected: `${entry.word} ${english}`
    });
  }
  return fixtures;
}

function generateMalformedSpacing(seedEntries: SeedEntry[]): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let index = 0; index < seedEntries.length; index += 1) {
    const entry = seedEntries[index];
    const next = seedEntries[(index + 1) % seedEntries.length];
    fixtures.push({
      category: `malformed-spacing:${entry.domain}:double-space`,
      input: `${entry.romanized}  ko`,
      expected: `${entry.word} को`
    });
    fixtures.push({
      category: `malformed-spacing:${entry.domain}:tab`,
      input: `${entry.romanized}\tma`,
      expected: `${entry.word} मा`
    });
    fixtures.push({
      category: `malformed-spacing:${entry.domain}:leading`,
      input: `  ${entry.romanized}`,
      expected: ` ${entry.word}`
    });
    fixtures.push({
      category: `malformed-spacing:${entry.domain}:newline`,
      input: `${entry.romanized}\n${next.romanized}`,
      expected: `${entry.word}\n${next.word}`
    });
  }
  return fixtures;
}

function generateRegressions(seedEntries: SeedEntry[]): Fixture[] {
  const handPicked: Fixture[] = [
    { category: "regression:office", input: "karyalaya ko karmachari", expected: "कार्यालय को कर्मचारी" },
    { category: "regression:office", input: "samparka ko report", expected: "सम्पर्क को report" },
    { category: "regression:government", input: "nirnaya ra prastav", expected: "निर्णय र प्रस्ताव" },
    { category: "regression:government", input: "prasashan ko file", expected: "प्रशासन को file" },
    { category: "regression:legal", input: "pramanpatra vitaran", expected: "प्रमाणपत्र वितरण" },
    { category: "regression:legal", input: "kanuni prastav", expected: "कानुनी प्रस्ताव" },
    { category: "regression:mixed", input: "NID form ko naam field", expected: "NID form को नाम field" },
    { category: "regression:mixed", input: "Excel report ma naam", expected: "Excel report मा नाम" },
    { category: "regression:mixed", input: "Word file ko bibaran", expected: "Word file को विवरण" },
    { category: "regression:punctuation", input: "namaste, sathi!", expected: "नमस्ते, साथी!" },
    { category: "regression:punctuation", input: "nepal ||", expected: "नेपाल ।" },
    { category: "regression:numerals", input: "nagarikta 123", expected: "नागरिकता 123" },
    { category: "regression:x-ksh", input: "xetra", expected: "क्षेत्र" },
    { category: "regression:ksh", input: "kshamata", expected: "क्षमता" },
    { category: "regression:gya", input: "gyan", expected: "ज्ञान" },
    { category: "regression:gya", input: "bigyan", expected: "विज्ञान" },
    { category: "regression:shra", input: "shram", expected: "श्रम" },
    { category: "regression:tra", input: "patra", expected: "पत्र" },
    { category: "regression:ri", input: "rishi", expected: "ऋषि" },
    { category: "regression:v-w", input: "vidyalaya", expected: "विद्यालय" },
    { category: "regression:v-w", input: "bikas", expected: "विकास" },
    { category: "regression:v-w", input: "vikas", expected: "विकास" },
    { category: "regression:names", input: "ashim shrestha", expected: "आशिम श्रेष्ठ" },
    { category: "regression:places", input: "kathmandu ma report", expected: "काठमाडौं मा report" }
  ];

  const fixtures = [...handPicked];
  const topAdmin = seedEntries.filter((entry) => ["government", "office", "legal", "education"].includes(entry.domain));
  for (let index = 0; index < topAdmin.length; index += 1) {
    const entry = topAdmin[index];
    const next = topAdmin[(index + 7) % topAdmin.length];
    fixtures.push({
      category: `regression:${entry.domain}:long-phrase`,
      input: `${entry.romanized} ko ${next.romanized} report ma`,
      expected: `${entry.word} को ${next.word} report मा`
    });
  }
  return fixtures;
}

function generateRuleOnlyFixtures(): Fixture[] {
  return [
    { category: "rule-only:cluster", input: "sampark", expected: "सम्पर्क" },
    { category: "rule-only:cluster", input: "samparka", expected: "सम्पर्क" },
    { category: "rule-only:cluster", input: "prastav", expected: "प्रस्तव" },
    { category: "rule-only:cluster", input: "sarkar", expected: "सर्कर" },
    { category: "rule-only:cluster", input: "ark", expected: "अर्क" },
    { category: "rule-only:cluster", input: "arm", expected: "अर्म" },
    { category: "rule-only:cluster", input: "arn", expected: "अर्न" },
    { category: "rule-only:cluster", input: "arya", expected: "अर्य" },
    { category: "rule-only:cluster", input: "alta", expected: "अल्त" },
    { category: "rule-only:cluster", input: "anda", expected: "अन्द" },
    { category: "rule-only:cluster", input: "amba", expected: "अम्ब" },
    { category: "rule-only:cluster", input: "ampa", expected: "अम्प" },
    { category: "rule-only:cluster", input: "anta", expected: "अन्त" },
    { category: "rule-only:cluster", input: "asta", expected: "अस्त" },
    { category: "rule-only:cluster", input: "aska", expected: "अस्क" },
    { category: "rule-only:cluster", input: "aspa", expected: "अस्प" },
    { category: "rule-only:cluster", input: "arta", expected: "अर्त" },
    { category: "rule-only:cluster", input: "arda", expected: "अर्द" },
    { category: "rule-only:cluster", input: "alpa", expected: "अल्प" },
    { category: "rule-only:non-cluster", input: "rimjhim", expected: "रिमझिम" },
    { category: "rule-only:non-cluster", input: "gharbar", expected: "घरबर" },
    { category: "rule-only:english", input: "report", expected: "report" }
  ];
}

function takeUnique(fixtures: Fixture[], target: number): Fixture[] {
  const unique = uniqueByInput(fixtures);
  if (unique.length < target) {
    throw new Error(`Only ${unique.length} unique fixtures available; ${target} required.`);
  }
  return unique.slice(0, target);
}

function uniqueByInput(fixtures: Fixture[]): Fixture[] {
  const seen = new Set<string>();
  const unique: Fixture[] = [];
  for (const fixture of fixtures) {
    if (seen.has(fixture.input)) continue;
    seen.add(fixture.input);
    unique.push(fixture);
  }
  return unique;
}

function uniqueByRomanized(seedEntries: SeedEntry[]): SeedEntry[] {
  const seen = new Set<string>();
  const unique: SeedEntry[] = [];
  for (const entry of seedEntries) {
    const key = entry.romanized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry);
  }
  return unique;
}

function writeJson(path: string, value: Fixture[]) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
