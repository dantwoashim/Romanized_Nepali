# Prompt 1 Reality Audit

Checked: 2026-05-26

## Existing Infrastructure

- `src/engine` exists and is the reusable facade for conversion, classification, protected spans, Romanized wrappers, Preeti/legacy wrappers, lexicon, memory, and proofread.
- `src/core/preeti` contains the existing Preeti converter wrapper around `@nepalibhasha/converter`, local warnings, normalization, and clean-room postrules.
- `src/core/transliteration` contains the current Romanized converter, phrase ranker, candidate ranking, local correction memory compatibility, and phonology tests.
- `src/engine/protected` contains detectors and sentinel restoration for URLs, emails, phones, IDs, acronyms, quoted/code spans, office phrases, and English preserve terms.
- `src/engine/classify` contains conservative document classification.
- `src/engine/proofread` and `src/engine/memory` already exist and must be extended later rather than replaced.
- Benchmark/report scripts exist under `scripts/`, with reports under `bench/reports/`.
- Runtime data guards exist for privacy, engine local-first, no-DOM hot path, user-data safety, offline build, and runtime benchmark-data exclusion.

## User-Facing Paths

- `src/features/preeti/PreetiConverter.tsx` is user-facing and now calls `convertPreeti` from `src/engine`.
- `src/features/romanized/RomanizedEditor.tsx` is user-facing and now calls `convertRomanized` from `src/engine`.
- `src/features/romanized/CandidateBar.tsx` displays engine candidates.
- `src/features/spell-hints/SpellHintPanel.tsx` still uses spell-hint data paths, not direct conversion.

## Dead Or Infrastructure-Only Areas

- `benchmarks/**`, `bench/**`, and `src/data/fixtures/**` are benchmark/test assets and are guarded from production runtime import.
- Competitor probe output fields remain manually fillable. They are not current market evidence.
- Kantipur, Sagarmatha, and Himali profile files are diagnostic placeholders only.

## Previous UI Bypasses

- Preeti UI directly imported `src/core/preeti/convertPreetiToUnicode`.
- Romanized UI directly imported `src/core/transliteration/transliterateRomanized`.
- Both bypasses are fixed in Prompt 1. Direct converter imports in user-facing components are no longer present.

## Benchmark Script Findings

- `benchmark:preeti` previously exited successfully with no output under `vite-node`; this was a CLI guard bug.
- Benchmark scripts now use an explicit `LEKH_BENCHMARK_CLI=1` signal and no-empty-suite assertions.
- `benchmark:romanized`, `benchmark:protected`, `benchmark:proofread`, and `benchmark:competitor` run directly and remain import-safe.
- `scorecard:engine` regenerates current benchmark reports instead of silently relying on stale JSON.

## Benchmark Contamination

- `romanized-held-out` overlaps exact inputs from phrase-pack data. It is now classified as `regression-contaminated` and excluded from public scorecard proof.
- Generated fixtures are also excluded from public proof.
- Preeti held-out paragraphs have no exact source overlap detected by the disjointness script.

## Stale Or Risky Claims

- README and validation docs must not present internal fixture-perfect scores as public superiority evidence.
- Current allowed language: local-first prototype, benchmark-driven engine, protected-span preservation under tested fixtures, conversion correctness work in progress.
- Forbidden language remains: best, SOTA, government-ready, 99% accurate, beats Google/Microsoft/Keyman, production-grade legal/health, full native keyboard support.

