# Validation Report

## Current Decision

Status: ready for controlled web/PWA user testing.

Decision: continue controlled user testing for the web/PWA. Do not start Tauri desktop preview until real-user Preeti and Romanized failures are collected, triaged, and fixed inside the web product first.

## Evidence To Collect

| Signal | Target | Current |
| --- | ---: | --- |
| Qualified users tried demo | 10 | 0 |
| Specific feedback submissions | 5 | 0 |
| Desktop beta requests | 3 | 0 |
| Real Preeti/Unicode workflows mentioned | 2 | 0 |
| Domain vocabulary requests | 1 | 0 |
| Consented real Preeti documents collected | 30 | 0 |

## Automated Gates

Latest local run: 2026-05-26.

| Gate | Result |
| --- | --- |
| `npm run verify` | Pass: test suite, production build, privacy guard, offline cache gate, runtime benchmark-data exclusion gate |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |
| `npm run benchmark` | Preeti 10,225 fixtures: generated/manual/held-out/competitor exact 1.0000, CER 0, WER 0; Romanized 6,700 fixtures: generated/manual/competitor top-1 1.0000, hostile held-out top-1 0.7155, overall top-1 0.9533 |
| `npm run report:quality` | 5,000 Romanized fixtures: top-1 1.0, top-3 1.0, top-5 1.0, MRR 1.0, suggestion hit@5 0.9932, p95 latency about 0.107 ms |
| `npm run report:preeti` | 10,005 Preeti fixtures: 80 manual, 9,920 generated, 5 held-out, 0 user-submitted; exact match 1.0, CER 0, WER 0, p95 latency about 0.014 ms |
| `npm run dictionary:review` | Generated 5,645 `dictionary-ne` alias review rows under ignored `reports/` |

These metrics are internal fixture metrics, not public superiority claims and not real-user document validation.

Benchmark fixture mix:

| Engine | Generated | Manual | Held-out | Competitor probes | User submitted |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | 9,920 | 200 | 55 | 50 | 0 |
| Romanized | 5,000 | 500 | 1,100 | 100 | 0 |

Benchmark scores by bucket:

| Engine | Bucket | Fixtures | Score |
| --- | --- | ---: | --- |
| Preeti | generated | 9,920 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | manual | 200 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | held-out | 55 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | competitor | 50 | exact `1.0000`, CER `0`, WER `0` |
| Romanized | generated | 5,000 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | manual | 500 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | held-out | 1,100 | top-1/top-3/top-5 `0.7155`, MRR `0.7155` |
| Romanized | competitor | 100 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |

Top failure categories:

| Category | Count | Severity mix |
| --- | ---: | --- |
| `missing-candidate` | 313 | P0: 18, P1: 295 |

The production bundle lazy-loads `dictionary-ne`/`nspell` for local spell validation. Previous static bundle output was main JS 1,421.41 kB minified / 288.26 kB gzip. Latest output is initial JS 553.27 kB minified / 128.13 kB gzip, plus lazy Hunspell chunk 956.45 kB minified / 176.58 kB gzip.

## Remaining Failure Categories

- Real Preeti documents: no consented user documents are in the fixture set yet.
- Preeti mixed-English preservation: the current project-owned cases pass, but real documents can still contain unseen English tokens embedded in Preeti text.
- Preeti punctuation: `?` remains inherently ambiguous in legacy Preeti because it can represent either punctuation or `रु`; current postrules are fixture-driven, not proof of perfect handling.
- Romanized held-out: the redesigned hostile pack now exposes 313 missing-candidate failures, mostly OOV compounds, unusual name romanizations, and five-plus-word mixed English/Nepali sentences.
- Romanized ranking: phrase/alias coverage is strong on current fixtures; user correction memory still needs real beta examples.
- Font variants: Kantipur/Sagarmatha-style profiles still need the same clean-room treatment before claims.
- Spell UX: first Hunspell use is local and lazy-loaded, but still a large chunk.

## Launch Checklist

- App renders and tools are above the fold.
- Tests pass.
- Build passes.
- PWA shell is registered and hashed assets are precached.
- No typed text is sent automatically.
- Claims avoid official authority, perfect conversion, and native keyboard support.
- Real Preeti document claims remain blocked until consented document intake is populated.
