# Prompt 1 Completion Report

Completed: 2026-05-26

## 1. Executive Summary

Prompt 1 established a truthful conversion-correctness foundation. Verification scripts now run real cases, benchmark suites cannot silently pass empty, the UI conversion paths route through `src/engine`, the six targeted bugs were fixed or rejected with source proof, and scorecards now report benchmark disjointness.

Intentionally not touched: full Preeti atom decoder rewrite, full Romanized rewrite, alias factory, Preeti fuzz/oracle factory, native keyboard work, external dataset ingestion, scraping, real-user documents, and public superiority claims.

Repo status: safe for Prompt 2. The remaining Prompt 2/3 work is engine depth, not verification repair.

## 2. Existing Infrastructure Preserved

- Engine facade: preserved and used by UI.
- Protected spans: preserved and still passing hostile preservation benchmark.
- Classifier: preserved.
- Proofread: preserved.
- Memory: preserved.
- UI components: preserved with routing changes only.
- Core converters: preserved; no wholesale replacement.

## 3. Six Targeted Fixes

| Fix | Files changed | Test added | Before | After | Caveat |
| --- | --- | --- | --- | --- | --- |
| Preeti `R` / `उच्चतम्` | `src/core/preeti/convertPreetiToUnicode.test.ts` | Source-truth regression for `pRtd\` and `pRrtd\` | Stress prompt assumed `pRtd\` should be `उच्चतम्` | Verified current safe maps encode `pRtd\` as `उच्तम्`; `pRrtd\` encodes `उच्चतम्` | Rejected global patch because it would corrupt source-truth mapping |
| Preeti `?` / `हरू` boundary | `src/core/preeti/convertPreetiToUnicode.ts`, test | Boundary `h?` fixtures and `सुरु` regression | Terminal `h?` leaked `?` or produced `हरु`; literal question handling was ambiguous | `x?` boundary maps to `हरू`; `'?'` in `सुरु` maps to `रु`; ordinary question punctuation remains `?` | Preeti `?` is inherently ambiguous; rules are source-context limited |
| Romanized `ri` → `ृ` | `src/core/transliteration/devanagariComposer.ts`, phonology tests | `kri`, `krishi`, `driDha`, `atibrishTi`, `anaabrishTi`, `khaNDabrishTi` | `kri` became `क्रि` through cluster precedence | Vocalic-R matra is tried before `kr/dr` cluster swallowing | `shri` and similar names still need Prompt 3 candidate intelligence |
| Generic conjunct pairs | `src/core/transliteration/devanagariComposer.ts`, phonology tests | `rsh`, `sw`, `kt` | Some rule-only clusters lacked virama behavior | Confirmed rule-only conjuncts compose without dictionary rescue | Full broad-cluster mode remains Prompt 3 work |
| Mode-aware digits | `src/core/transliteration/transliterateRomanized.ts`, `src/engine/romanized/index.ts`, tests | Government-mode digit conversion plus protected IDs | Digits were always ASCII | Government/legal/education modes can convert prose digits; protected IDs remain ASCII | `Bi.Sam.` abbreviation itself is not yet normalized to `वि.सं.` |
| Hunspell reverse aliases | `scripts/lib/devanagariAlias.ts`, `scripts/rank-hunspell-by-frequency.ts`, tests | `swasthya`, `vikas`, `vishwa/bishwa`, `samachar` | Generated aliases overfavored `sv/b` and final schwa | `स्व` yields reachable `sw`; `व` favors `v`; final schwa stripping added | Collision review remains Prompt 3 |

## 4. Verification Truth Fixes

- Added `scripts/lib/cli.ts` for import-safe/direct benchmark execution.
- Added no-empty-suite assertions to benchmark scripts.
- Fixed `benchmark:preeti` silent success by using explicit `LEKH_BENCHMARK_CLI=1`.
- Added `scripts/check-benchmark-disjointness.ts`.
- Integrated `check:benchmark-disjointness` into `npm run verify`.
- `scorecard:engine` now regenerates current benchmark data and includes disjointness.
- `romanized-held-out` is quarantined as `regression-contaminated` and excluded from public proof.

## 5. UI Engine Routing

Before:

- Preeti UI imported `src/core/preeti/convertPreetiToUnicode` directly.
- Romanized UI imported `src/core/transliteration/transliterateRomanized` directly.

After:

- Preeti UI calls `convertPreeti` from `src/engine`.
- Romanized UI calls `convertRomanized` from `src/engine`.
- Candidate and trace UI now consume engine candidate/trace types.
- No direct core converter import remains in user-facing `src/features` or `src/app`.

## 6. Diagnostic Fingerprint

`DiagnosticFingerprint` is defined in `src/engine/legacy/profile.ts` with:

- `glyphRatios`
- `sequenceRatios`
- `coverageRange`
- `minAutoSelectScore`
- optional `negativeSignals`
- optional `notes`

Profile JSON files now use this schema. Ratios are provisional diagnostics, not proof of full non-Preeti profile support.

## 7. Benchmark Contamination Report

- Contaminated: `romanized-held-out`.
- Clean held-out: Preeti held-out paragraphs.
- Generated suites: excluded from public proof.
- Regression suites: usable for regression control, not market claims.
- Report path: `bench/reports/benchmark-disjointness-report.json`.

Next cleanup: author a new truly disjoint Romanized held-out set and keep it separate from phrase/alias source rows.

## 8. Scorecard And Claim Hygiene

Removed or avoided:

- 100% accuracy as a public claim.
- best/SOTA/government-ready language.
- hidden reliance on contaminated held-out data.

Retained:

- local-first prototype.
- benchmark-driven engine architecture.
- protected-span preservation under tested fixtures.
- conversion correctness work in progress.

## 9. Command Results

| Command | Status |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run test` | Pass: 19 files, 115 tests |
| `npm run build` | Pass: initial JS `2,801.18 kB` / gzip `500.41 kB`; lazy Hunspell `956.45 kB` / gzip `176.58 kB` |
| `npm run check:privacy` | Pass |
| `npm run check:engine-local` | Pass |
| `npm run check:engine-no-dom` | Pass |
| `npm run check:user-data` | Pass |
| `npm run check:benchmark-disjointness` | Pass: `romanized-held-out` contaminated/excluded, no hard failures |
| `npm run benchmark:protected` | Pass: 12/12 protected preservation |
| `npm run benchmark:preeti` | Pass: 10,225 fixtures, exact 1.0000, CER 0, WER 0 |
| `npm run benchmark:romanized` | Pass: 6,730 fixtures, top-1/top-3/top-5/MRR 1.0000 |
| `npm run benchmark:proofread` | Pass: 9/9 |
| `npm run benchmark:competitor` | Pass: 10 local checks, competitor collection pending |
| `npm run benchmark` | Pass |
| `npm run bench:perf` | Pass: Romanized p95 7 ms, Preeti 5KB p95 17 ms |
| `npm run scorecard:engine` | Pass |
| `npm run verify` | Pass |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |

## 10. Remaining Work For Prompt 2

- Preeti semantic profile map upgrade.
- Preeti greedy tokenizer.
- LegacyAtom parser/assembler path.
- Preeti verifier.
- Preeti oracle/fuzz generator.
- Source-text audit layer.

## 11. Remaining Work For Prompt 3

- Romanized candidate engine completion.
- Weighted alias factory.
- Alias collision report.
- Phrase/context ranking.
- Confidence gate.
- Local correction memory.
- Final public scorecard gates.

