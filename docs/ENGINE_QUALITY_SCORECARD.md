# Engine Quality Scorecard

Checked: 2026-05-25

This scorecard defines how Lekh Assistant measures engine quality. Internal fixture scores are regression signals, not public superiority claims.

## Benchmark Buckets

| Bucket | Location | Purpose | Runtime bundled? |
| --- | --- | --- | --- |
| Preeti generated | `src/data/fixtures/preeti-fixtures.json` | Large round-trip coverage from verified-safe sources | No app runtime import |
| Preeti manual | `src/data/fixtures/preeti-fixtures.json` | Project-owned audited hard cases | No app runtime import |
| Preeti manual hard | `benchmarks/preeti/manual-hard.json` | Separate hard cases for matras, reph, conjuncts, line breaks, and mixed English | No |
| Preeti held-out | `src/data/fixtures/preeti-heldout-fixtures.json` | Separate hard cases for score reporting | No |
| Preeti competitor probes | `benchmarks/preeti/competitor-probes.json` | Small manual black-box comparison set | No |
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

Latest local benchmark, 2026-05-25:

| Engine | Fixtures | Headline result |
| --- | ---: | --- |
| Preeti | 10,132 | exact match `1.0`, CER `0`, WER `0`, matra errors `0`, reph errors `0`, English preservation `1.0`, line-break preservation `1.0` |
| Romanized | 5,508 | top-1/top-3/top-5 `1.0`, MRR `1.0`, phrase accuracy `1.0`, name accuracy `1.0`, mixed-English corruption `0` |

These scores are only for the current internal fixture and benchmark sets. They do not replace controlled testing on consented real documents or named-tool comparative evaluation.

## Release Meaning

- Ready for controlled user testing: automated benchmarks pass, privacy guard passes, and known limitations are documented.
- Ready for public comparative claim: only after named baselines are manually evaluated on frozen inputs and the method is documented.
