# Engine Quality Scorecard

Updated: 2026-05-27T18:13:27.499Z

This scorecard reads existing fresh report files from `bench/reports`. It does not recompute the heavy benchmark universe. Missing, stale, zero-fixture, or schema-weak reports are visible below.

## Report Freshness

| Report | Status | Fixtures | Mode | Command | Note |
| --- | --- | ---: | --- | --- | --- |
| Romanized benchmark | fresh | 776 | smoke | npm run benchmark:romanized:smoke |  |
| Romanized self-consistency | fresh | 390 | smoke | npm run benchmark:romanized:self:smoke |  |
| Typing-session benchmark | fresh | 58 | full | npm run benchmark:typing-session |  |
| Proofread benchmark | fresh | 9 | full | npm run benchmark:proofread |  |
| Performance smoke benchmark | fresh | 12 | smoke | npm run bench:perf:smoke |  |
| Benchmark disjointness | fresh | 17001 | full | npm run check:benchmark-disjointness |  |
| Preeti benchmark | stale | 10225 | n/a | missing | A relevant source, fixture, or benchmark script is newer than the report. |
| Mixed span mutations | stale | 25 | n/a | missing | A relevant source, fixture, or benchmark script is newer than the report. |
| Romanized alias collisions | schema-warning | n/a | n/a | missing | Report is missing command, suite, or duration metadata. |

## Keyboard Foundation

| Area | Status |
| --- | --- |
| KeyboardEngine API | implemented |
| processKeyStroke | required and tested |
| updateComposition | browser/lab path |
| candidate dedupe | normalized text dedupe before shortcuts |
| shortcuts | sequential after final sort |
| secure input | memory/proofread/suggestions disabled or reduced |

## Romanized

| Metric | Value |
| --- | ---: |
| fixtures | 776 |
| mode | smoke |
| top-1 | 1.0000 |
| top-3 | 1.0000 |
| top-5 | 1.0000 |
| MRR | 1.0000 |
| self-consistency fixtures | 390 |
| self-consistency failures | 0 |

## Typing Sessions

| Metric | Value |
| --- | ---: |
| fixtures | 58 |
| failed sessions | 0 |
| proof hint hit rate | 1.0000 |
| dictionary hit rate | 1.0000 |
| memory boost success | 1.0000 |
| next-word success | 1.0000 |
| Romanized label hit rate | 1.0000 |
| duplicate candidate count | 0 |
| shortcut sequence validity | 1.0000 |

## Prompt 2 Keyboard Intelligence

| Area | Status |
| --- | --- |
| Romanized live typing | complete |
| Romanized government phrases | complete |
| Romanized helper suggestions | complete |
| Romanized labels | complete |
| candidate dedupe and shortcuts | complete |
| ranking and phrase completion | complete |
| next-word prediction | complete |
| KSR baseline | 0.03392911735923696 |
| Traditional physical layout | blocked-human |
| Traditional Unicode suggestions | complete |
| Traditional proofread | complete |
| proofread while typing | complete |
| dictionary lookup | complete |
| personal memory | complete |
| memory controls | complete |
| Keyboard Lab | complete |
| companion shell | partial |
| typing latency p95 ms | 5 |
| native release readiness | pending |

## Performance

| Case | p95 ms | Gate ms | Status |
| --- | ---: | ---: | --- |
| 50-token hostile Romanized mixed sentence | 30 | 30 | pass |
| 5KB mixed Preeti paragraph | 386 | 100 | pass |
| KeyboardEngine warm startup | 0 | 500 | pass |
| KeyboardEngine partial warm timeout | 1 | 50 | pass |
| Keyboard Romanized live update | 8 | 20 | pass |
| Keyboard candidate count cap | 8 | 20 | pass |
| Keyboard Traditional Unicode suggestion | 9 | 20 | pass |
| Keyboard proofread hint update | 1 | 40 | pass |
| Keyboard dictionary lookup | 16 | 30 | pass |
| Keyboard memory ranking update | 7 | 10 | pass |
| Keyboard candidate commit | 5 | 10 | pass |
| Native IPC JSON envelope simulation | 0 | 10 | pass |

## Native And Release

| Area | Status |
| --- | --- |
| Windows TSF skeleton | present |
| macOS IMK skeleton | present |
| IPC schema | present |
| daemon lifecycle | documented |
| companion scaffold | present |
| release status | blocked until real TSF/IMK implementation, platform tests, signing/notarization, and pilot feedback |

## Public Claim Status

Allowed if phrased honestly:

- local-first keyboard engine prototype
- Romanized live typing prototype
- Traditional layout under source-of-truth audit
- proofread/dictionary/memory prototype
- native architecture/scaffold

Forbidden until evidence exists:

- beats Gboard
- beats Hamro
- 100% accurate
- government-ready
- production Windows IME complete
- production macOS IME complete
- fully signed/notarized release
- complete LTK replacement
