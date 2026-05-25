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

Latest local run: 2026-05-25.

| Gate | Result |
| --- | --- |
| `npm run verify` | Pass: 61 tests, production build, privacy guard, offline cache gate |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |
| `npm run report:quality` | 5,000 Romanized fixtures: top-1 1.0, top-3 1.0, top-5 1.0, MRR 1.0, suggestion hit@5 0.9932, p95 latency about 0.107 ms |
| `npm run report:preeti` | 10,005 Preeti fixtures: 80 manual, 9,920 generated, 5 held-out, 0 user-submitted; exact match 1.0, CER 0, WER 0, p95 latency about 0.014 ms |
| `npm run dictionary:review` | Generated 5,645 `dictionary-ne` alias review rows under ignored `reports/` |

These metrics are internal fixture metrics, not public superiority claims and not real-user document validation.

The production bundle lazy-loads `dictionary-ne`/`nspell` for local spell validation. Previous static bundle output was main JS 1,421.41 kB minified / 288.26 kB gzip. Latest output is initial JS 468.84 kB minified / 113.13 kB gzip, plus lazy Hunspell chunk 956.45 kB minified / 176.58 kB gzip.

## Remaining Failure Categories

- Real Preeti documents: no consented user documents are in the fixture set yet.
- Font variants: Kantipur/Sagarmatha-style profiles still need the same clean-room treatment before claims.
- Romanized ranking: current high scores are internal fixtures; user correction memory and phrase aliases need real beta examples.
- Spell UX: first Hunspell use is local and lazy-loaded, but still a large chunk.

## Launch Checklist

- App renders and tools are above the fold.
- Tests pass.
- Build passes.
- PWA shell is registered and hashed assets are precached.
- No typed text is sent automatically.
- Claims avoid official authority, perfect conversion, and native keyboard support.
- Real Preeti document claims remain blocked until consented document intake is populated.
