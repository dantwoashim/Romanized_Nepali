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
| Keyboard Romanized live update | 8 | 20 | pass |
| Keyboard candidate count cap | 8 | 20 | pass |
| Keyboard Traditional Unicode suggestion | 9 | 20 | pass |
| Keyboard proofread hint update | 1 | 40 | pass |
| Keyboard dictionary lookup | 16 | 30 | pass |
| Keyboard memory ranking update | 7 | 10 | pass |
| Keyboard candidate commit | 5 | 10 | pass |
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

Prompt 2 keyboard hot paths meet the smoke targets in the final verification run. The 5KB Preeti paragraph remains much heavier than keyboard hot-path work, which is acceptable because Preeti conversion is a side utility and not the keyboard core. Prompt 3 should still profile bundle size and lazy-loading before native packaging.

## Bundle Notes

`npm run build` still reports large chunks, especially core index and Hunspell. Prompt 2 did not load benchmark fixtures into production UI. Further chunking/lazy-loading remains Prompt 3 hardening work.
