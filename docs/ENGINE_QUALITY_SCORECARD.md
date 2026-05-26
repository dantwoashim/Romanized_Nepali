# Engine Quality Scorecard

Generated: 2026-05-26T07:36:23.312Z

This scorecard is internal validation evidence. It is not a public superiority claim.

## Benchmark Breakdown

| Engine | Generated | Manual | Hostile / Held-out | Competitor probes | User submitted / real docs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | 9920 | 200 | 55 | 50 | 0 |
| Romanized | 5000 | 500 | 1130 | 100 | 0 |
| Proofread | 0 | 9 | included above | 0 | 0 |
| Competitor probes | 0 | 0 | 0 | 10 | 0 |

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
| suggestion hit@5 | 0.9872 |

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
