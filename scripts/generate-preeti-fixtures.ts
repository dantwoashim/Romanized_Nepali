import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(root, "src/data/fixtures/preeti-fixtures.json");

interface PreetiFixture {
  name: string;
  category: string;
  input: string;
  expected: string;
  warningCode?: string;
  generatedFrom?: string;
}

interface Fragment {
  input: string;
  expected: string;
  warningCode?: string;
}

const rawFixtures = JSON.parse(readFileSync(fixturePath, "utf8")) as PreetiFixture[];
const seedFixtures = rawFixtures.filter((fixture) => !fixture.generatedFrom);
const byName = new Map(seedFixtures.map((fixture) => [fixture.name, fixture]));

const words = [
  atom("word-karyalaya"),
  atom("word-sewa"),
  atom("word-vidyalaya"),
  atom("word-vidyarthi"),
  atom("word-bishwavidyalaya"),
  atom("word-adhikari"),
  atom("word-rastriya"),
  atom("word-parichayapatra"),
  atom("word-rajaswa"),
  atom("namaste")
];

const compounds = [
  atom("phrase-office"),
  atom("paragraph-validation"),
  atom("multiline-office")
];

const ambiguous = [
  atom("conjunct-gya"),
  atom("conjunct-dda"),
  atom("conjunct-ddha"),
  atom("conjunct-shra"),
  atom("conjunct-ksha-half"),
  atom("ra-reph"),
  atom("vocalic-r-matra")
];

const forms = [
  { input: "gfd", expected: "नाम" },
  { input: "sf]", expected: "को" },
  { input: "NID", expected: "NID" },
  { input: "PDF", expected: "PDF" },
  { input: "Word", expected: "Word" },
  { input: "Excel", expected: "Excel" },
  { input: "form", expected: "form" },
  { input: "field", expected: "field" },
  { input: "date", expected: "date" },
  { input: "Phone", expected: "Phone" }
];

const output: PreetiFixture[] = [...seedFixtures];
const seenInputs = new Set(seedFixtures.map((fixture) => fixture.input));

generateParagraphs(2200);
generateTables(1700);
generateForms(1800);
generateNameDates(1500);
generateAmbiguousCases(1700);
generateMixedEnglish(900);
generateMultilineDocuments(1120);

if (output.length < 10000) {
  throw new Error(`Only generated ${output.length} Preeti fixtures; 10000 required.`);
}

writeFileSync(fixturePath, `${JSON.stringify(output.slice(0, 10000), null, 2)}\n`);
console.log(`Wrote ${Math.min(output.length, 10000)} Preeti fixtures to ${fixturePath}`);

function generateParagraphs(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = words[(index + 3) % words.length];
    const third = words[(index + 6) % words.length];
    add({
      name: `generated-paragraph-${index + 1}`,
      category: "paragraph-generated",
      ...combine(
        [first, preetiText(" / ", " र "), second, text("\n"), third, preetiText(" sf] gfd\n", " को नाम\n"), forms[2], text(" form "), numberFragment(10000 + index)]
      )
    });
  }
}

function generateTables(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = words[(index + 1) % words.length];
    add({
      name: `generated-table-${index + 1}`,
      category: "table-generated",
      ...combine([
        preetiText("NID\tgfd\t", "NID नाम "), forms[index % forms.length], text("\n"),
        numberFragment(20000 + index), text("\t"), first, text("\t"), second
      ])
    });
  }
}

function generateForms(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = words[(index + 2) % words.length];
    add({
      name: `generated-form-${index + 1}`,
      category: "form-generated",
      ...combine([
        text("NID form\n"),
        preetiText("gfd ", "नाम "), first, text("\n"),
        text("field "), second, text("\n"),
        text("date "), dateFragment(2080 + (index % 5), (index % 12) + 1, (index % 28) + 1),
        text("\nNo "), numberFragment(30000 + index)
      ])
    });
  }
}

function generateNameDates(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = compounds[index % compounds.length];
    add({
      name: `generated-name-date-${index + 1}`,
      category: "name-date-generated",
      ...combine([
        preetiText("gfd ", "नाम "), first, text("\n"),
        preetiText("sf] ", "को "), second, text("\n"),
        text("date "), dateFragment(2079 + (index % 7), (index % 12) + 1, (index % 28) + 1),
        text("\nNo "), numberFragment(40000 + index)
      ])
    });
  }
}

function generateAmbiguousCases(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = ambiguous[index % ambiguous.length];
    const second = words[(index + 4) % words.length];
    const third = ambiguous[(index + 2) % ambiguous.length];
    add({
      name: `generated-ambiguous-${index + 1}`,
      category: "ambiguous-generated",
      warningCode: "UNCERTAIN_PREETI_MAPPING",
      ...combine([first, text(" "), second, text(" "), third, text(" "), numberFragment(50000 + index)])
    });
  }
}

function generateMixedEnglish(count: number) {
  const english = ["NID", "PDF", "Word", "Excel", "form", "field", "date", "Phone"];
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = words[(index + 5) % words.length];
    add({
      name: `generated-mixed-english-${index + 1}`,
      category: "mixed-english-generated",
      ...combine([
        text(`${english[index % english.length]} `), first, preetiText(" / ", " र "),
        text(`${english[(index + 3) % english.length]} `), second,
        text(" "), numberFragment(60000 + index)
      ])
    });
  }
}

function generateMultilineDocuments(count: number) {
  for (let index = 0; index < count; index += 1) {
    const first = words[index % words.length];
    const second = words[(index + 2) % words.length];
    const third = words[(index + 4) % words.length];
    add({
      name: `generated-multiline-${index + 1}`,
      category: "multiline-generated",
      ...combine([
        first, text("\n"),
        second, preetiText(" / ", " र "), third, text("\n"),
        text("NID form "), numberFragment(1000 + (index % 9000))
      ])
    });
  }
}

function add(fixture: PreetiFixture) {
  if (output.length >= 10000) return;
  if (seenInputs.has(fixture.input)) return;
  seenInputs.add(fixture.input);
  output.push({
    ...fixture,
    expected: normalizeNepaliText(fixture.expected),
    generatedFrom: "preeti-seed-composition"
  });
}

function combine(fragments: Fragment[]): Omit<PreetiFixture, "name" | "category"> {
  const input = fragments.map((fragment) => fragment.input).join("");
  const expected = fragments.map((fragment) => fragment.expected).join("");
  const warning = fragments.find((fragment) => fragment.warningCode)?.warningCode;
  return warning ? { input, expected, warningCode: warning } : { input, expected };
}

function atom(name: string): Fragment {
  const fixture = byName.get(name);
  if (!fixture) throw new Error(`Missing Preeti seed fixture: ${name}`);
  return {
    input: fixture.input,
    expected: fixture.expected,
    warningCode: fixture.warningCode
  };
}

function text(value: string): Fragment {
  return { input: value, expected: value };
}

function preetiText(input: string, expected: string): Fragment {
  return { input, expected };
}

function numberFragment(value: number): Fragment {
  const digits = String(value).padStart(2, "0");
  return {
    input: Array.from(digits).map((digit) => digitToPreeti(digit)).join(""),
    expected: Array.from(digits).map((digit) => digitToNepali(digit)).join("")
  };
}

function dateFragment(year: number, month: number, day: number): Fragment {
  const yearPart = numberFragment(year);
  const monthPart = numberFragment(month);
  const dayPart = numberFragment(day);
  return {
    input: `${yearPart.input} ${monthPart.input} ${dayPart.input}`,
    expected: `${yearPart.expected} ${monthPart.expected} ${dayPart.expected}`
  };
}

function digitToPreeti(digit: string): string {
  const map: Record<string, string> = {
    "0": ")",
    "1": "!",
    "2": "@",
    "3": "#",
    "4": "$",
    "5": "%",
    "6": "^",
    "7": "&",
    "8": "*",
    "9": "("
  };
  return map[digit] ?? digit;
}

function digitToNepali(digit: string): string {
  const map: Record<string, string> = {
    "0": "०",
    "1": "१",
    "2": "२",
    "3": "३",
    "4": "४",
    "5": "५",
    "6": "६",
    "7": "७",
    "8": "८",
    "9": "९"
  };
  return map[digit] ?? digit;
}
