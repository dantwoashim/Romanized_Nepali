import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { convertPreetiToUnicode } from "../src/core/preeti/convertPreetiToUnicode";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const outputPath = join(root, "bench/fixtures/preeti/generated/boundary-fixtures.json");

const HIGH_RISK_WORDS = [
  "दुष्परिणामहरू",
  "लक्ष्यहरू",
  "किरण",
  "कार्यालय",
  "निर्णय",
  "प्रार्थना",
  "दायित्वबोध",
  "उच्चतम्",
  "क्षुद्र",
  "सौर्यमण्डल"
];

const BOUNDARIES = ["", ",", "।", ":", ")", "\"", "\n", " PDF", " email@test.com"];

export function generatePreetiBoundaryFixtures() {
  const fixtures = HIGH_RISK_WORDS.flatMap((word, wordIndex) => {
    const source = unicodeToPreeti(word);
    return BOUNDARIES.map((boundary, boundaryIndex) => {
      const input = `${source}${boundary}`;
      const expected = `${word}${boundary}`;
      return {
        id: `preeti-boundary-${wordIndex + 1}-${boundaryIndex + 1}`,
        type: "generated-boundary",
        category: boundary.includes("PDF") || boundary.includes("@") ? "protected-boundary" : "boundary",
        input,
        expected,
        source: "project-unicodeToPreeti-boundary-oracle",
        currentOutput: convertPreetiToUnicode(input).normalizedOutput
      };
    });
  });
  assertNonEmptySuite("preeti boundary fixtures", fixtures.length);
  return fixtures;
}

if (process.env.LEKH_SCRIPT === "generate-preeti-boundary-fixtures") {
  const fixtures = generatePreetiBoundaryFixtures();
  mkdirSync(join(root, "bench/fixtures/preeti/generated"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(fixtures, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, fixtureCount: fixtures.length }, null, 2));
}
