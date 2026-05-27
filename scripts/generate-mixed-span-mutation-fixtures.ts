import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDirectCli } from "./lib/cli";

interface MutationFixture {
  id: string;
  suite: "mixed-span-mutations";
  mode: "romanized-mixed-office" | "mixed-unicode-legacy-repair";
  input: string;
  expectedOutput: string;
  expectedAction: "auto" | "candidates" | "warn" | "preserve" | "refuse";
  expectedPreserved: string[];
  source: "generated-mutation";
  notes: string;
}

const fixtures: MutationFixture[] = [
  {
    id: "mixed-mut-001",
    suite: "mixed-span-mutations",
    mode: "romanized-mixed-office",
    input: "PDF English tokenharu ward-05",
    expectedOutput: "PDF English tokenहरू ward-05",
    expectedAction: "auto",
    expectedPreserved: ["PDF", "English", "ward-05"],
    source: "generated-mutation",
    notes: "Protected acronym and ward label around English suffix parse."
  },
  {
    id: "mixed-mut-002",
    suite: "mixed-span-mutations",
    mode: "mixed-unicode-legacy-repair",
    input: "Form No. 2079-080 मा मृत्य' btf{",
    expectedOutput: "Form No. 2079-080 मा मृत्यु दर्ता",
    expectedAction: "auto",
    expectedPreserved: ["Form No. 2079-080"],
    source: "generated-mutation",
    notes: "Structured identifier before mixed Preeti island."
  },
  {
    id: "mixed-mut-003",
    suite: "mixed-span-mutations",
    mode: "romanized-mixed-office",
    input: "email@test.com shabdaharu pani",
    expectedOutput: "email@test.com शब्दहरू पनि",
    expectedAction: "auto",
    expectedPreserved: ["email@test.com"],
    source: "generated-mutation",
    notes: "Email protection plus Nepali phrase morphology."
  },
  {
    id: "mixed-mut-004",
    suite: "mixed-span-mutations",
    mode: "mixed-unicode-legacy-repair",
    input: "\"swasthya\" p\"jL{o bz{gfg';f/",
    expectedOutput: "\"swasthya\" पूर्वीय दर्शनानुसार",
    expectedAction: "auto",
    expectedPreserved: ["\"swasthya\""],
    source: "generated-mutation",
    notes: "Quoted example remains byte-exact before Preeti island."
  },
  {
    id: "mixed-mut-005",
    suite: "mixed-span-mutations",
    mode: "romanized-mixed-office",
    input: "Form No. 2079-080 rakhnuparne kothamaa",
    expectedOutput: "Form No. 2079-080 राख्नुपर्ने कोठामा",
    expectedAction: "auto",
    expectedPreserved: ["Form No. 2079-080"],
    source: "generated-mutation",
    notes: "Form number plus Romanized morphology."
  }
];

export function generateMixedSpanMutationFixtures() {
  const outputDir = join(process.cwd(), "bench/fixtures/mixed-span-mutations");
  mkdirSync(outputDir, { recursive: true });
  const path = join(outputDir, "generated.jsonl");
  const next = fixtures.map((fixture) => JSON.stringify(fixture)).join("\n") + "\n";
  if (!existsSync(path) || readFileSync(path, "utf8") !== next) {
    writeFileSync(path, next);
  }
  return { path, count: fixtures.length };
}

if (isDirectCli(import.meta.url)) {
  console.log(JSON.stringify(generateMixedSpanMutationFixtures(), null, 2));
}
