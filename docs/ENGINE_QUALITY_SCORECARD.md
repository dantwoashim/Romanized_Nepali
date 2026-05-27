# Engine Quality Scorecard

Updated: 2026-05-27T10:01:00.214Z

This scorecard is internal validation evidence. It is not a public superiority claim.

## Benchmark Breakdown

| Engine | Generated | Manual | Hostile / Held-out | Competitor probes | User submitted / real docs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | 9920 | 200 | 55 | 50 | 0 |
| Romanized | 5000 | 500 | 1054 | 100 | 0 |
| Proofread | 0 | 9 | included above | 0 | 0 |
| Competitor probes | 0 | 0 | 0 | 10 | 0 |
| Mixed span mutations | 0 | 25 | 11 | 0 | 0 |
| Typing sessions | 0 | 11 | 0 | 0 | 0 |

## Benchmark Disjointness

Generated from `npm run check:benchmark-disjointness`.

| Status | Value |
| --- | --- |
| contaminated suites | romanized-held-out |
| held-out hard failures | none |
| public proof policy | Contaminated suites are internal regression evidence, not public superiority proof. |

## Romanized Metrics

| Metric | Value |
| --- | ---: |
| top-1 | 1.0000 |
| top-3 | 1.0000 |
| top-5 | 1.0000 |
| MRR | 1.0000 |
| missing-candidate count | 0 |
| ranking-failure count | 0 |
| phrase accuracy | 1.0000 |
| name accuracy | 1.0000 |
| mixed-English corruption | 0.0000 |
| suggestion hit@5 | 0.9832 |

## Romanized Hard Hostile Prose

This section is intentionally separate from generated/internal fixtures. It is the long-form stress suite used to prevent polished-looking aggregate scores from hiding prose failures.

| Metric | Value |
| --- | ---: |
| fixtures | 24 |
| top-1 | 1.0000 |
| top-3 | 1.0000 |
| top-5 | 1.0000 |
| MRR | 1.0000 |

## Romanized Correctness Layer

| Metric | Value |
| --- | ---: |
| self-consistency fixtures | 2130 |
| NFC stability | 1.0000 |
| output in top candidates | 1.0000 |
| hard candidate cap honored | 1.0000 |
| protected preservation in self-check | 1.0000 |
| self-consistency failures | 0 |
| weighted alias variants | 76193 |
| unique alias keys | 70201 |
| alias outputs | 40138 |
| alias collisions | 4499 |
| alias collisions needing review | 4237 |

## Universal Span Routing And Mutation Suites

These suites are separate from generated Romanized and Preeti fixtures. They measure mixed Unicode, Preeti legacy islands, protected tokens, English suffixes, and silent-corruption behavior.

| Metric | Value |
| --- | ---: |
| fixtures | 25 |
| exact output rate | 1.0000 |
| action match rate | 1.0000 |
| protected preservation | 1.0000 |
| silent corruption rate | 0.0000 |
| failures | 0 |

## Keyboard Typing Sessions

This Prompt 1 benchmark measures the new `KeyboardEngine` session API. Traditional sessions are reported as placeholders until the source-of-truth layout audit is complete.

| Metric | Value |
| --- | ---: |
| total fixtures | 11 |
| Romanized sessions | 9 |
| Romanized top-1 hit rate | 1.0000 |
| Romanized top-3 hit rate | 1.0000 |
| Traditional placeholder sessions | 2 |
| candidate p50 ms | 2.00 |
| candidate p95 ms | 3.00 |
| update p95 ms | 3.00 |
| commit p95 ms | 0.00 |
| mean KSR baseline | 0.0840 |
| failed sessions | 0 |

## Preeti Metrics

| Metric | Value |
| --- | ---: |
| exact match | 1.0000 |
| CER | 0.0000 |
| WER | 0.0000 |
| matra errors | 0 |
| reph errors | 0 |
| English preservation | 1.0000 |
| line-break preservation | 1.0000 |
| unknown glyph warnings | 26 |

## Preeti Deterministic Decoder Suites

These suites validate the verifier-gated atom decoder beside the baseline converter. Generated/oracle suites are regression pressure, not real-document proof.

| Suite | Count | Metric |
| --- | ---: | ---: |
| source-audit fixtures | 12 | 11 conversion-scored |
| source-audit converter bugs | 3 | 0 source-ambiguous |
| fuzz legal/illegal | 26 | 0 failures |
| fuzz legal exact | 26 | 1.0000 |
| fuzz illegal safety | 26 | 1.0000 |
| roundtrip oracle | 15 | 1.0000 |

## Proofread Metrics

| Metric | Value |
| --- | ---: |
| fixtures | 9 |
| exact match | 1.0000 |
| auto-fix precision proxy | 1.0000 |
| hints generated | 4 |
| fixes applied in benchmark | 22 |

## Competitor Probe Status

| Metric | Value |
| --- | --- |
| probe fixtures | 10 |
| Lekh expected-pass count | 10 |
| protected-span failures | 0 |
| competitor collection | pending manual collection |

## Public Claim Status

Allowed if phrased honestly:

- local-first prototype
- mixed-document protected-span support
- benchmark-driven engine architecture
- early Romanized/Preeti engine under active validation

Forbidden until external evidence exists:

- best Nepali converter
- beats Google or Microsoft
- government-ready
- 99% accurate
- production-grade legal/health tool
- full Kantipur/Sagarmatha/Himali support

## Remaining Evidence Gaps

- No consented real-user documents are committed.
- Competitor outputs are still pending manual collection.
- Health terms are a tiny reviewed starter only.
- Kantipur/Sagarmatha/Himali profiles are planned diagnostics, not supported conversion profiles.
- Desktop/native input surfaces are strategy docs only.
