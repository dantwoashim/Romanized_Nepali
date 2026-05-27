# Prompt 3 Keyboard Baseline Audit

Date: 2026-05-27

## Summary

Prompt 1 and Prompt 2 foundations were present before Prompt 3 edits. The repo was on `main`, the worktree was clean, and the KeyboardEngine API, Romanized live typing, Keyboard Lab, typing-session benchmark, and Traditional placeholder/suggestion path were available.

## Command Results Before Prompt 3 Changes

Logs were captured under `/tmp/lekh_prompt3_baseline_1779879339`.

| Command | Status | Notes |
| --- | --- | --- |
| `npm run typecheck` | pass | TypeScript project references passed. |
| `npm run test` | pass | 26 files, 160 tests. |
| `npm run build` | pass | Vite build passed; large engine/Hunspell chunks remain documented. |
| `npm run check:privacy` | pass | No text telemetry payloads found. |
| `npm run check:engine-local` | pass | No network primitives in `src/engine`. |
| `npm run check:engine-no-dom` | pass | No DOM/browser hot-path APIs in `src/engine`. |
| `npm run check:user-data` | pass | No tracked raw/private files or obvious fixture PII. |
| `npm run check:benchmark-disjointness` | pass | Contaminated suites remain quarantined as internal evidence. |
| `npm run benchmark:typing-session` | pass | 33 fixtures, no failed sessions. |
| `npm run benchmark:romanized` | pass | Romanized benchmark completed cleanly. |
| `npm run benchmark:proofread` | pass | Proofread fixtures passed. |
| `npm run benchmark` | pass | Summary plus typing-session benchmark passed. |
| `npm run bench:perf` | pass | Keyboard Romanized p95 2 ms, dictionary p95 5 ms, 5KB Preeti p95 81 ms. |
| `npm run scorecard:engine` | pass | Scorecard regenerated. |
| `npm run verify` | pass | Full verify sequence passed. |
| `npm audit --audit-level=moderate` | pass | 0 vulnerabilities. |

## Prompt 1 Status

- Scope freeze docs exist.
- Engineering MVP vs Product MVP docs exist.
- `src/engine/keyboard/*` exists.
- `processKeyStroke`, `KeyboardKeyEvent`, session lifecycle, composition model, warm result, and range helpers exist.
- Keyboard Lab and typing-session benchmark exist.

## Prompt 2 Status

- Romanized live typing works through `KeyboardEngine`.
- Romanized helper suggestions and labels exist.
- Candidate ranking is bounded.
- Traditional physical keymap remains pending source-of-truth audit, but Unicode Traditional suggestions work.
- Proofread, dictionary lookup, local memory, and next-word baseline exist.
- Keyboard scorecard section exists.

## Native Status Before Prompt 3

Native feasibility docs existed, but there was no native scaffold directory, IPC schema, typed message contract, daemon folder, storage adapter contract, packaging docs, final readiness gate, or final keyboard gap closure.

## External Blockers

- Windows code-signing certificate unavailable.
- Apple Developer ID and notarization credentials unavailable.
- Native Windows/macOS test environment not exercised in this repo run.
- Human pilot feedback unavailable.
- Traditional layout source-of-truth still requires manual capture.
- Safe licensed dictionary meaning source unavailable.

## Prompt 3 Completion Target

Prompt 3 will complete repo-executable scaffolding, schemas, contracts, docs, scorecard readiness, and verification. It will not claim a production native keyboard.
