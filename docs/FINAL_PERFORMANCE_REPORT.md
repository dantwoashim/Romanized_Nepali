# Final Performance Report

Generated: 2026-05-28

Report sources:

- `bench/reports/perf-report.json`
- `bench/reports/typing-session-report.json`
- `bench/reports/typing-session-dictionary-lookup-report.json`
- `bench/reports/typing-session-memory-ranking-memory-controls-report.json`

## Keyboard Hot Path

| Metric | p95 ms | Gate ms | Status |
| --- | ---: | ---: | --- |
| KeyboardEngine warm startup | 1 | 500 | complete |
| KeyboardEngine partial warm timeout | 0 | 50 | complete |
| Romanized live update | 5 | 20 | complete |
| Candidate count cap | 3 | 20 | complete |
| Traditional Unicode suggestion | 3 | 20 | complete |
| Proofread hint update | 0 | 40 | complete |
| Dictionary lookup | 9 | 30 | complete |
| Memory ranking update | 3 | 10 | complete |
| Candidate commit | 4 | 10 | complete |
| Native IPC JSON envelope simulation | 0 | 10 | complete |

## Typing Session Quality

Main typing-session report:

- fixture count: 60.
- failed sessions: 0.
- candidate p50: 5 ms.
- candidate p95: 8 ms.
- update p95: 8 ms.
- commit p95: 1 ms.
- duplicate candidate count: 0.
- shortcut sequence validity: 1.
- proofread hit rate: 1.
- dictionary hit rate: 1.
- memory boost success rate: 1.
- next-word success rate: 1.
- Romanized label hit rate: 1.
- KSR mean baseline: 0.02133169490981017.

Focused reports:

- dictionary fixtures: 5, failed sessions: 0, dictionary hit rate: 1.
- memory fixtures: 4, failed sessions: 0, memory boost success rate: 1, p95 update: 12 ms.

## Bundle and Side-Utility Status

The production build remains functional and benchmark data is not bundled into runtime. The app still emits a large chunk warning because the shared engine/data and Hunspell assets are large. Keyboard surfaces are lazy-loaded enough for validation, but public release should keep chunking on the release checklist.

The 5KB mixed Preeti paragraph p95 is 152 ms against a 100 ms side-utility target. This is not a keyboard hot-path blocker because Preeti is a side utility, but it remains a P2 performance item for the companion document tools.

## Native Performance Status

Native IPC is currently simulated through JSON envelope checks. Real TSF named-pipe and IMK/XPC latency must be measured on target platforms before public release.

Status:

- Windows native latency: blocked-native-environment.
- macOS native latency: blocked-native-environment.
- signing/notarized release latency smoke: blocked-external until credentials exist.

## Production Decision

Keyboard engine hot paths meet current JavaScript/web-lab performance gates. Public native release remains blocked on real native platform latency validation and signing/notarization.
