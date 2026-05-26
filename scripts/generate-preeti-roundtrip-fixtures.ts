import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convertPreetiToUnicode } from "../src/core/preeti/convertPreetiToUnicode";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const outputPath = join(root, "bench/fixtures/preeti/generated/roundtrip-fixtures.json");

const GOLD_UNICODE = [
  "ज्ञान",
  "विज्ञान",
  "प्रविधि",
  "उच्चतम्",
  "विकाससँगै",
  "सौर्यमण्डल",
  "दुष्परिणामहरू",
  "लक्ष्यहरू",
  "दायित्वबोध",
  "क्षुद्र",
  "ठूलो",
  "अनिवार्य",
  "अपरिहार्य",
  "कृषि क्षेत्रमा ठुलो ह्रास",
  "कार्यालयमा दर्ता भयो।"
];

export function generatePreetiRoundtripFixtures() {
  const fixtures = GOLD_UNICODE.map((expected, index) => {
    const input = unicodeToPreeti(expected);
    const decoded = normalizeNepaliText(convertPreetiToUnicode(input).normalizedOutput);
    return {
      id: `preeti-roundtrip-${index + 1}`,
      type: "generated-roundtrip",
      input,
      expected: normalizeNepaliText(expected),
      decoded,
      source: "reviewed-unicode-gold-project-inverse-map",
      passedAtGeneration: decoded === normalizeNepaliText(expected)
    };
  });
  assertNonEmptySuite("preeti roundtrip fixtures", fixtures.length);
  return fixtures;
}

if (process.env.LEKH_SCRIPT === "generate-preeti-roundtrip-fixtures") {
  const fixtures = generatePreetiRoundtripFixtures();
  mkdirSync(join(root, "bench/fixtures/preeti/generated"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(fixtures, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, fixtureCount: fixtures.length }, null, 2));
}
