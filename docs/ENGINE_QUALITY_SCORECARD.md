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
| Preeti held-out paragraphs | `benchmarks/preeti/held-out-paragraphs.json` | Office/school/admin paragraph cases with acronyms, numbers, punctuation, and line breaks | No |
| Preeti competitor probes | `benchmarks/preeti/competitor-probes.json` | Frozen manual black-box comparison set with blank competitor output fields | No |
| Preeti user-submitted | `benchmarks/preeti/user-submitted.json` | Explicit submissions only after review | No |
| Romanized generated | `src/data/fixtures/romanized-fixtures.json` | Broad regression coverage | No app runtime import |
| Romanized manual | `benchmarks/romanized/manual-high-value.json` | High-value phrases, aliases, names, admin/legal/office cases | No |
| Romanized held-out | `benchmarks/romanized/held-out.json` | Manually authored misspellings, admin phrases, names, mixed English, and OOV-like cases not generated from phrase/alias TSVs | No |
| Romanized hostile held-out | `benchmarks/romanized/hostile-manual-v1.json` | 1,000 manually designed domain-matrix cases for common/admin/legal/education/name/place/mixed workflows | No |
| Romanized competitor | `benchmarks/romanized/competitor/romanized_competitor_probe_v1.json` | Frozen manual black-box comparison set with blank competitor output fields | No |

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
- failure taxonomy: category, severity, top failure categories

## Current Gate

Run:

```bash
npm run benchmark
```

The report should stay clear about which data is generated, manually curated, held out, competitor-probe, or user-submitted. Any user-submitted case must have explicit permission and must not include private raw documents.

Latest local benchmark, 2026-05-25:

| Engine | Fixtures | Headline result |
| --- | ---: | --- |
| Preeti | 10,225 | generated/manual/held-out/competitor exact match `1.0000`, CER `0`, WER `0`, English preservation `1.0000`, line-break preservation `1.0000` |
| Romanized | 6,700 | generated/manual/held-out/competitor top-1/top-3/top-5/MRR `1.0000`, mixed-English corruption `0`, suggestion hit@5 `0.9972` |

Top failure categories from the latest benchmark:

| Category | Count | Severity mix |
| --- | ---: | --- |
| none | 0 | n/a |

These scores are only for the current internal fixture and benchmark sets. They do not replace controlled testing on consented real documents or named-tool comparative evaluation. The competitor-probe fields are frozen and manually fillable; they do not yet prove superiority over Google-style or OS-level tools.

## Release Meaning

- Ready for controlled user testing: automated benchmarks pass, privacy guard passes, and known limitations are documented.
- Ready for public comparative claim: only after named baselines are manually evaluated on frozen inputs and the method is documented.
