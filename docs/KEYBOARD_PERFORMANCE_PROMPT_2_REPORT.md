# Keyboard Performance Prompt 2 Report

Generated: 2026-05-27

Prompt 2 performance is measured through:

- `npm run benchmark:typing-session`
- `npm run bench:perf:smoke`
- `npm run scorecard:engine`

## Current Smoke Metrics

Fresh report source: `bench/reports/perf-report.json`

| Case | Prompt 2 p95 ms | Gate ms | Status |
| --- | ---: | ---: | --- |
| Keyboard Romanized live update | 4 | 20 | pass |
| Keyboard candidate count cap | 3 | 20 | pass |
| Keyboard Traditional Unicode suggestion | 7 | 20 | pass |
| Keyboard proofread hint update | 0 | 40 | pass |
| Keyboard dictionary lookup | 15 | 30 | pass |
| Keyboard memory ranking update | 19 | 10 | over target, below gross-failure threshold |
| Keyboard candidate commit | 10 | 10 | pass at gate |
| KeyboardEngine warm startup | 0 | 500 | pass |
| KeyboardEngine partial warm timeout | 1 | 50 | pass |
| Native IPC JSON envelope simulation | 0 | 10 | pass |

## Typing-Session Metrics

Fresh report source: `bench/reports/typing-session-report.json`

- fixtures: 58
- failed sessions: 0
- update p95: 5 ms
- commit p95: 0 ms
- duplicate candidate count: 0
- shortcut sequence validity: 1.0
- Romanized label hit rate: 1.0
- next-word success: 1.0
- KSR mean baseline: 0.0339

## Bottlenecks

Memory ranking smoke p95 can exceed the aspirational 10 ms target on this run. It remains below the script's gross slowdown failure threshold, but Prompt 3 performance hardening should profile memory lookup and avoid broad scans once native storage adapters are introduced.

## Bundle Notes

`npm run build` still reports large chunks, especially core index and Hunspell. Prompt 2 did not load benchmark fixtures into production UI. Further chunking/lazy-loading remains Prompt 3 hardening work.
