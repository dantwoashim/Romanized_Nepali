import { convertPreeti, convertRomanized, createKeyboardEngine } from "../src/engine";

interface PerfCase {
  name: string;
  gateMs: number;
  iterations: number;
  run: () => void | Promise<void>;
}

interface PerfReport {
  name: string;
  iterations: number;
  gateMs: number;
  minMs: number;
  meanMs: number;
  p95Ms: number;
  maxMs: number;
  grosslySlow: boolean;
}

const hostileRomanized = [
  "mero NID form ma naam wrong cha",
  "PDF ma date milena",
  "email address test@example.com ho",
  "phone number 9841000000 ho",
  "ward-05 ko online form submit bhayena",
  "X-ray report upload garna mildaina",
  "Form No. 2079-080 ko record system ma dekhaudaina",
  "user le correct final output herna parcha",
  'phrase detect garna "swasthya" example parcha'
].join(" ");

const preetiChunk = "sfof{no PDF NID email@test.com Form No. 2079-080 ward-05 X-ray report online form\n";
const mixedPreeti5kb = preetiChunk.repeat(Math.ceil(5120 / preetiChunk.length)).slice(0, 5120);

const cases: PerfCase[] = [
  {
    name: "50-token hostile Romanized mixed sentence",
    gateMs: 30,
    iterations: 80,
    run: () => {
      convertRomanized(hostileRomanized, { mode: "romanized-mixed", benchmark: true });
    }
  },
  {
    name: "5KB mixed Preeti paragraph",
    gateMs: 100,
    iterations: 40,
    run: () => {
      convertPreeti(mixedPreeti5kb, { mode: "preeti-mixed", benchmark: true });
    }
  },
  {
    name: "KeyboardEngine warm startup",
    gateMs: 500,
    iterations: 25,
    run: async () => {
      const engine = createKeyboardEngine();
      await engine.warm({ timeoutMs: 50 });
      await engine.shutdown();
    }
  }
];

const reports = [];
for (const perfCase of cases) {
  reports.push(await runPerfCase(perfCase));
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  note: "Performance smoke benchmark. It reports p95 gates and fails only on gross slowdowns over 10x gate.",
  reports
}, null, 2));

if (reports.some((report) => report.grosslySlow)) {
  process.exit(1);
}

async function runPerfCase(perfCase: PerfCase): Promise<PerfReport> {
  const timings: number[] = [];
  for (let index = 0; index < perfCase.iterations; index += 1) {
    const start = Date.now();
    await perfCase.run();
    timings.push(Date.now() - start);
  }
  timings.sort((a, b) => a - b);
  const sum = timings.reduce((total, value) => total + value, 0);
  const p95Index = Math.min(timings.length - 1, Math.ceil(timings.length * 0.95) - 1);
  const p95Ms = timings[p95Index];
  return {
    name: perfCase.name,
    iterations: perfCase.iterations,
    gateMs: perfCase.gateMs,
    minMs: timings[0],
    meanMs: Number((sum / timings.length).toFixed(2)),
    p95Ms,
    maxMs: timings[timings.length - 1],
    grosslySlow: p95Ms > perfCase.gateMs * 10
  };
}
