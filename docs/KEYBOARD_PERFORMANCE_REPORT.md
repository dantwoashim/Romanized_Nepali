# Keyboard Performance Report

Generated from `npm run bench:perf` on 2026-05-27.

The benchmark is a local smoke/performance guard. It fails only on gross slowdowns over 10x the gate, but the table below tracks the actual targets used for keyboard readiness.

| Metric | p95 ms | Target | Status |
| --- | ---: | ---: | --- |
| KeyboardEngine warm startup | 0 | 500 | pass |
| KeyboardEngine partial warm timeout | 0 | 50 | pass |
| Romanized keystroke update | 2 | 20 | pass |
| candidate count cap check | 1 | 20 | pass |
| Traditional Unicode suggestion update | 1 | 20 | pass |
| proofread hint update | 0 | 40 | pass |
| dictionary lookup | 4 | 30 | pass |
| memory ranking update | 1 | 10 | pass |
| candidate commit | 1 | 10 | pass |
| native IPC JSON envelope simulation | 0 | 10 | pass |
| 50-token hostile Romanized mixed sentence | 6 | 30 | pass |
| 5KB mixed Preeti paragraph | 75 | 100 | pass |

## Bundle Status

Latest build still shows large lazy engine/data chunks. The first-load app shell is small enough for controlled demo review, but the shared engine and Hunspell chunks need further splitting or compaction before broad public launch.

## Hardening Decisions

- Ranking quality is not penalized by latency.
- Performance is controlled through candidate caps, bounded windows, lazy loading, and benchmark gates.
- Native IPC has a hard keystroke timeout target of 50 ms.
- Native shells must fail open/pass through if the daemon or XPC path misses the timeout.

## Remaining Work

- Measure real TSF and IMK hot path latency on native platforms.
- Measure daemon startup and warm behavior outside the web lab.
- Split large shared engine/data chunks before public launch.
- Add production crash and timeout telemetry that never includes raw typed text.
