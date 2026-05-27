# Verification Stability Report

Generated: 2026-05-27

Prompt 1 production-foundation work reset default verification around stable smoke checks and fresh-report scorecards. Full benchmarks remain available, but the default path now avoids long-running recomputation.

## Baseline Problems

| Problem | Baseline behavior | Root cause |
| --- | --- | --- |
| Heavy default verification | `npm run verify` passed but took about 96s. | Default verification included heavy benchmark work and a scorecard that recomputed suites. |
| Scorecard recomputation | `scorecard:engine` passed but spent time rerunning benchmark logic. | Scorecard generation was coupled to benchmark execution instead of reading reports. |
| Stale-report ambiguity | Some benchmark reports lacked `command`, `suite`, `mode`, `durationMs`, or fixture count metadata. | Report schemas differed by script. |
| Candidate UI instability | Duplicate candidate text and shortcut gaps could appear after multi-source generation. | Dedupe happened too late or not consistently after source merging. |
| Tooling install hiccup | Local Vite install missed `dist/client/client.mjs` after `npm ci`. | Local package cache/install artifact was incomplete; repaired with cache clean and reinstall. |

## Script Changes

| Script | New behavior |
| --- | --- |
| `test` | Uses bounded Vitest forks: `--pool=forks --minWorkers=1 --maxWorkers=2`. |
| `benchmark:romanized:smoke` | Runs a reduced but non-empty Romanized suite and writes `bench/reports/romanized-report.json`. |
| `benchmark:romanized:full` | Alias for the full Romanized benchmark. |
| `benchmark:romanized:self:smoke` | Runs bounded self-consistency cases and writes the standard self-consistency report. |
| `benchmark:romanized:self:full` | Alias for full self-consistency. |
| `bench:perf:smoke` | Runs hot-path perf smoke iterations with real p95 metrics. |
| `bench:perf:full` | Runs the larger perf profile manually. |
| `bench:perf` | Defaults to `bench:perf:smoke`. |
| `scorecard:engine` | Reads existing report files from `bench/reports` and does not recompute heavy suites. |
| `verify` | Runs typecheck, tests, build, privacy/offline/runtime checks, disjointness, typing-session, Romanized smoke, self-smoke, proofread, competitor probe, perf smoke, scorecard, and engine smoke. |
| `verify:full` | Keeps the larger benchmark path available for manual/full release runs. |

## Required Report Freshness

The scorecard requires fresh non-empty reports for:

- `bench/reports/romanized-report.json`
- `bench/reports/romanized-self-consistency-report.json`
- `bench/reports/typing-session-report.json`
- `bench/reports/proofread-report.json`
- `bench/reports/perf-report.json`
- `bench/reports/benchmark-disjointness-report.json`

Required reports fail the scorecard if missing, stale, zero-fixture, or schema-weak. Optional reports, such as Preeti, mixed-span mutation, and alias collision reports, are shown honestly but do not fail the smoke scorecard when stale.

## Smoke Command Results After Reset

| Command | Result | Current evidence |
| --- | --- | --- |
| `npm run typecheck` | pass | Compile passed after scorecard and candidate changes. |
| `npm run test -- src/engine/keyboard/keyboardEngine.test.ts` | pass | 13 keyboard tests passed. |
| `npm run benchmark:romanized:smoke` | pass | 776 fixtures, mode `smoke`, duration about 3.89s. |
| `npm run benchmark:romanized:self:smoke` | pass | 390 fixtures, 0 failures, duration about 0.41s. |
| `npm run benchmark:proofread` | pass | 9 fixtures, duration about 0.06s. |
| `npm run benchmark:typing-session` | pass | 33 fixtures, p95 update about 6ms. |
| `npm run check:benchmark-disjointness` | pass | 17,001 fixture comparison entries; no hard failure suites. |
| `npm run bench:perf:smoke` | pass | 12 measured perf cases; no gross slowdowns. |
| `npm run scorecard:engine` | pass | Required reports fresh; hard failure count 0. |

## Smoke Performance Snapshot

| Case | p95 ms | Gate ms | Status |
| --- | ---: | ---: | --- |
| Romanized hostile mixed sentence | 15 | 30 | pass |
| 5KB mixed Preeti paragraph | 476 | 100 | smoke reports slow but not grossly slow |
| KeyboardEngine warm startup | 1 | 500 | pass |
| Partial warm timeout | 0 | 50 | pass |
| Keyboard Romanized live update | 7 | 20 | pass |
| Candidate count cap | 8 | 20 | pass |
| Traditional Unicode suggestion | 6 | 20 | pass |
| Proofread hint update | 1 | 40 | pass |
| Dictionary lookup | 10 | 30 | pass |
| Memory ranking update | 3 | 10 | pass |
| Candidate commit | 3 | 10 | pass |
| Native IPC JSON envelope simulation | 0 | 10 | pass |

## How To Run Full Benchmarks

Use these commands outside the default development loop:

```sh
npm run verify:full
npm run benchmark:romanized:full
npm run benchmark:romanized:self:full
npm run bench:perf:full
```

Full runs are for release preparation and deep regression checks. Smoke runs are the default verification guardrail.

## Final Stability Status

- `npm run test` terminates reliably in baseline and focused reruns.
- `bench:perf` now maps to the smoke path.
- `benchmark:romanized:self:smoke` exists and is used by default verification.
- `scorecard:engine` reads reports and exposes stale/missing/zero-fixture status.
- Required smoke scorecard reports are fresh and non-empty.
- Optional stale reports remain visible, not hidden.
