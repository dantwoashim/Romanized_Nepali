import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { convertPreeti } from "../src/engine/legacy";
import { generatePreetiRoundtripFixtures } from "./generate-preeti-roundtrip-fixtures";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const fixturePath = join(root, "bench/fixtures/preeti/generated/roundtrip-fixtures.json");
const reportPath = join(root, "bench/reports/preeti-roundtrip-report.json");

interface RoundtripFixture {
  id: string;
  input: string;
  expected: string;
  source: string;
}

export function runPreetiRoundtripBenchmark() {
  const fixtures = loadFixtures();
  assertNonEmptySuite("preeti roundtrip", fixtures.length);
  const cases = fixtures.map((fixture) => {
    const result = convertPreeti(fixture.input, { mode: "preeti-strict", legacyDecoder: "atom" });
    const actual = normalizeNepaliText(result.normalizedOutput);
    const expected = normalizeNepaliText(fixture.expected);
    return {
      id: fixture.id,
      input: fixture.input,
      expected,
      actual,
      exact: actual === expected,
      verifierStatus: result.diagnostics.find((diagnostic) => diagnostic.code === "LEGACY_DECODER_SELECTION")?.data?.atomVerifierStatus ?? "unknown",
      source: fixture.source
    };
  });
  const failures = cases.filter((item) => !item.exact);
  return {
    generatedAt: new Date().toISOString(),
    fixtureCount: cases.length,
    exactCount: cases.length - failures.length,
    exactRate: (cases.length - failures.length) / cases.length,
    failureCount: failures.length,
    failures
  };
}

function loadFixtures(): RoundtripFixture[] {
  if (!existsSync(fixturePath)) return generatePreetiRoundtripFixtures();
  return JSON.parse(readFileSync(fixturePath, "utf8")) as RoundtripFixture[];
}

if (process.env.LEKH_SCRIPT === "benchmark-preeti-roundtrip") {
  const report = runPreetiRoundtripBenchmark();
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
