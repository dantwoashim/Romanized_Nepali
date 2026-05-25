# Engine Quality Scorecard

Checked: 2026-05-25

This scorecard defines how Lekh Assistant measures engine quality. Internal fixture scores are regression signals, not public superiority claims.

## Benchmark Buckets

| Bucket | Location | Purpose | Runtime bundled? |
| --- | --- | --- | --- |
| Preeti generated | `src/data/fixtures/preeti-fixtures.json` | Large round-trip coverage from verified-safe sources | No app runtime import |
| Preeti manual | `src/data/fixtures/preeti-fixtures.json` | Project-owned audited hard cases | No app runtime import |
| Preeti held-out | `benchmarks/preeti/held-out.json` and `src/data/fixtures/preeti-heldout-fixtures.json` | Separate hard cases for score reporting | No |
| Preeti user-submitted | `benchmarks/preeti/user-submitted.json` | Explicit submissions only after review | No |
| Romanized generated | `src/data/fixtures/romanized-fixtures.json` | Broad regression coverage | No app runtime import |
| Romanized manual | `benchmarks/romanized/manual-high-value.json` | High-value phrases, aliases, names, admin/legal/office cases | No |
| Romanized competitor | `benchmarks/romanized/competitor-probes.json` | Small manual black-box comparison set | No |

## Metrics

Preeti:

- exact match
- character error rate
- word error rate
- matra error count
- reph error count
- English/acronym preservation rate
- line break preservation rate
- warning quality: unknown glyphs, uncertain mappings, preserved English tokens

Romanized:

- top-1 accuracy
- top-3 accuracy
- top-5 accuracy
- mean reciprocal rank
- phrase accuracy
- name accuracy
- mixed-English corruption rate
- out-of-vocabulary recovery rate
- suggestion hit@5

## Current Gate

Run:

```bash
npm run benchmark
```

The report should stay clear about which data is generated, manually curated, held out, competitor-probe, or user-submitted. Any user-submitted case must have explicit permission and must not include private raw documents.

## Release Meaning

- Ready for controlled user testing: automated benchmarks pass, privacy guard passes, and known limitations are documented.
- Ready for public comparative claim: only after named baselines are manually evaluated on frozen inputs and the method is documented.
