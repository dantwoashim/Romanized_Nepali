import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createKeyboardEngine, defaultTypingContext } from "../src/engine/keyboard";
import type { CandidateUpdate, KeyboardKeyEvent, KeyboardMode } from "../src/engine/keyboard";
import { nowMs } from "../src/engine/util/time";

interface TypingSessionFixture {
  id: string;
  mode: KeyboardMode;
  keystrokes: string[];
  expectedTopCandidates: string[];
  expectedPrimaryPrefix: string;
  expectedAction: "candidates" | "placeholder";
  notes: string;
}

interface SessionResult {
  id: string;
  mode: KeyboardMode;
  passed: boolean;
  top1Hit: boolean;
  top3Hit: boolean;
  primaryPrefixHit: boolean;
  finalDisplayText: string;
  candidateTexts: string[];
  latencyMs: number[];
  commitLatencyMs: number;
  keystrokeSavingsRatio: number | null;
  warnings: string[];
  failureReason?: string;
}

const FIXTURES = [
  "bench/fixtures/typing-session/romanized-basic.jsonl",
  "bench/fixtures/typing-session/romanized-government.jsonl",
  "bench/fixtures/typing-session/traditional-placeholder.jsonl"
];

const fixtures = FIXTURES.flatMap(readJsonl);
if (fixtures.length === 0) {
  throw new Error("Typing-session benchmark has zero fixtures.");
}

const results = fixtures.map(runFixture);
const romanized = results.filter((result) => result.mode === "romanized");
const traditionalPlaceholder = results.filter((result) => result.mode === "traditional");
const failures = results.filter((result) => !result.passed);
const allLatencies = results.flatMap((result) => result.latencyMs);
const commitLatencies = results.map((result) => result.commitLatencyMs);

const report = {
  generatedAt: new Date().toISOString(),
  fixtureCount: fixtures.length,
  romanized: summarize(romanized),
  traditionalPlaceholder: summarize(traditionalPlaceholder),
  latency: {
    candidateP50Ms: percentile(allLatencies, 0.5),
    candidateP95Ms: percentile(allLatencies, 0.95),
    updateP95Ms: percentile(allLatencies, 0.95),
    commitP95Ms: percentile(commitLatencies, 0.95)
  },
  keystrokeSavingsRatioMean: mean(results.map((result) => result.keystrokeSavingsRatio).filter((value): value is number => value !== null)),
  failedSessions: failures.length,
  warnings: Array.from(new Set(results.flatMap((result) => result.warnings))),
  failures,
  results
};

writeFileSync("bench/reports/typing-session-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

function runFixture(fixture: TypingSessionFixture): SessionResult {
  const engine = createKeyboardEngine();
  const context = defaultTypingContext(fixture.mode);
  const sessionId = engine.beginSession({
    ...context,
    activeDomains: fixture.mode === "romanized" ? ["government"] : [],
    preserveEnglish: true
  });
  let update: CandidateUpdate = engine.updateComposition(sessionId, "", 0);
  const latencyMs: number[] = [];
  for (const stroke of fixture.keystrokes) {
    update = engine.processKeyStroke(sessionId, keyEvent(stroke));
    if (typeof update.latencyMs === "number") latencyMs.push(update.latencyMs);
  }
  const commitStart = nowMs();
  const committed = update.primary ? engine.commitCandidate(sessionId, update.primary.id) : engine.commitRaw(sessionId);
  const commitLatencyMs = nowMs() - commitStart;
  const candidateTexts = update.candidates.map((candidate) => candidate.text);
  const top1Hit = fixture.expectedTopCandidates.length === 0 || fixture.expectedTopCandidates.includes(candidateTexts[0] ?? "");
  const top3Hit = fixture.expectedTopCandidates.length === 0 || candidateTexts.slice(0, 3).some((candidate) => fixture.expectedTopCandidates.includes(candidate));
  const primaryPrefixHit = update.displayText.startsWith(fixture.expectedPrimaryPrefix);
  const placeholderOk = fixture.expectedAction !== "placeholder" || update.warnings.some((warning) => /Traditional layout mapping pending/.test(warning));
  const passed = top1Hit && top3Hit && primaryPrefixHit && placeholderOk;
  return {
    id: fixture.id,
    mode: fixture.mode,
    passed,
    top1Hit,
    top3Hit,
    primaryPrefixHit,
    finalDisplayText: update.displayText,
    candidateTexts,
    latencyMs,
    commitLatencyMs,
    keystrokeSavingsRatio: committed.committedText ? 1 - (fixture.keystrokes.length / Array.from(committed.committedText).length) : null,
    warnings: update.warnings,
    failureReason: passed ? undefined : `Expected one of ${fixture.expectedTopCandidates.join(", ") || "(none)"} and prefix ${fixture.expectedPrimaryPrefix}`
  };
}

function readJsonl(path: string): TypingSessionFixture[] {
  return readFileSync(join(process.cwd(), path), "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TypingSessionFixture);
}

function keyEvent(value: string): KeyboardKeyEvent {
  return {
    key: value,
    code: value === " " ? "Space" : value.length === 1 ? `Key${value.toUpperCase()}` : value,
    modifiers: { shift: /[A-Z]/.test(value), ctrl: false, alt: false, meta: false },
    timestamp: nowMs(),
    platform: "test"
  };
}

function summarize(items: SessionResult[]) {
  return {
    totalSessions: items.length,
    top1HitRate: ratio(items.filter((item) => item.top1Hit).length, items.length),
    top3HitRate: ratio(items.filter((item) => item.top3Hit).length, items.length),
    failedSessions: items.filter((item) => !item.passed).length,
    placeholderSessions: items.filter((item) => item.mode === "traditional").length
  };
}

function ratio(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
