# Prompt 1 Production Baseline Audit

Generated: 2026-05-27

Plan source read before execution:

- File: `/Users/rohanbasnet14/Downloads/LEKH_KEYBOARD_PRODUCTION_READY_UNIFIED_MASTER_PLAN.md`
- Lines: 2,438
- Words: 8,387
- Bytes: 57,665
- SHA-256: `21d226d7c34c14a546c1749faee86e7f640d9939b4fcc35bd472b11c0799dfbc`

This audit records the repository state before Prompt 1 production-foundation edits. It does not claim production keyboard readiness.

## Repo Structure Summary

- `src/engine`: local-first conversion, keyboard, proofread, lexicon, memory, protected-span, and legacy font logic.
- `src/engine/keyboard`: KeyboardEngine session API, live candidate pipeline, proof hints, dictionary lookup, memory integration, storage contracts, range helpers, warming, and commit behavior.
- `src/engine/traditional`: Traditional mode placeholder and Unicode suggestion path; physical layout remains source-of-truth pending.
- `src/features/keyboard`: browser Keyboard Lab validation surface.
- `scripts`: verification checks, benchmark runners, scorecard generation, fixture tools, and safety audits.
- `bench/fixtures`: locked and generated benchmark fixtures.
- `bench/reports`: generated benchmark and scorecard reports.
- `native`: repo-executable native scaffolds for IPC, daemon, Windows TSF, macOS IMK, storage, diagnostics, and companion architecture.
- `docs`: product scope, keyboard API, native feasibility, privacy, packaging, scorecards, readiness gates, and completion reports.

## Current Product Status

| Area | Baseline status |
| --- | --- |
| Product scope | Keyboard-first direction exists; Preeti remains side utility. |
| KeyboardEngine API | Present, including `processKeyStroke`, `updateComposition`, `CandidateUpdate`, `CommitResult`, and `WarmResult`. |
| Romanized mode | Live typing and candidate generation exist through KeyboardEngine. |
| Romanized helpers | Helper surface exists but needed dedupe/shortcut cleanup. |
| Traditional mode | Unicode suggestion path exists; physical keymap remains pending manual source-of-truth audit. |
| Proofread | Proof hints are integrated into keyboard sessions. |
| Dictionary | Local dictionary lookup exists without unsafe meaning data. |
| Memory | Local correction memory exists and respects secure input. |
| Keyboard Lab | Browser validation surface exists and is not final native product. |
| Native scaffolds | Windows TSF, macOS IMK, daemon, IPC, companion, and storage scaffolds exist. |
| Companion app | Architecture scaffold exists; full desktop app is not implemented. |

## Baseline Command Results

Logs are in `/tmp/lekh_prod_p1_baseline_1779901577`.

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | pass | Installed 171 packages; 0 vulnerabilities. |
| `npm run typecheck` | pass | TypeScript project build completed. |
| `npm run test` | pass | 27 files, 163 tests, about 24.35s. |
| `npm run build` | pass | Built in about 2.05s; service worker written. |
| `npm run check:privacy` | pass | No text telemetry payloads found. |
| `npm run check:engine-local` | pass | No network primitives found in `src/engine`. |
| `npm run check:engine-no-dom` | pass | No DOM/browser hot-path APIs found in `src/engine`. |
| `npm run check:user-data` | pass | No tracked raw/private files or obvious fixture PII found. |
| `npm run check:benchmark-disjointness` | pass | Contamination is reported; no hard failure suites. |
| `npm run benchmark:typing-session` | pass | 33 typing sessions in baseline report. |
| `npm run benchmark:romanized` | pass | Full benchmark passed but took about 39s. |
| `npm run benchmark:romanized:self` | pass | 2,130 cases, 0 failures. |
| `npm run benchmark:proofread` | pass | 9 fixtures, exact match rate 1.0. |
| `npm run benchmark` | pass | Full summary ran but is too heavy for default verify. |
| `npm run bench:perf` | pass | Full perf ran but should be split from smoke verify. |
| `npm run scorecard:engine` | pass | Passed, but recomputed too much instead of reading fresh reports. |
| `npm run verify` | pass | Passed but took about 96s and included heavy work. |
| `npm audit --audit-level=moderate` | pass | 0 vulnerabilities. |

## Baseline Benchmark Status

- Romanized benchmark reported perfect top-k scores on the current locked suites.
- Romanized self-consistency reported 2,130 cases and 0 failures.
- Typing-session benchmark reported 33 sessions and no failures.
- Proofread benchmark reported 9 fixtures and exact match rate 1.0.
- Performance benchmark measured keyboard warm, live update, proofread, dictionary, memory, commit, and IPC JSON envelope paths.

## Baseline Build And Bundle Status

Baseline build output included:

- `dist/assets/KeyboardLab-*.js`: about 33.32 kB minified, 9.59 kB gzip.
- `dist/assets/index-*.js`: about 55.45 kB, 201.02 kB, and 2,603.75 kB minified chunks.
- `dist/assets/nepaliHunspell-*.js`: about 956.48 kB minified, 176.60 kB gzip.

Vite warned about chunks larger than 500 kB. This is a bundle/performance risk to track, not a Prompt 1 blocker.

## Current Verification Blockers And Risks

- Default `verify` was passing but too heavy and vulnerable to long-running benchmark regressions.
- `scorecard:engine` passed but recomputed expensive suites and could hide stale report behavior.
- Several report files lacked consistent `command`, `suite`, `mode`, `durationMs`, and `fixtureCount` metadata.
- Candidate lists could show duplicate text and shortcut gaps after multi-source generation.
- Traditional physical layout remained pending human/manual audit.
- Native scaffolds were present but must remain explicitly non-production until real TSF/IMK tests, signing, notarization, and pilot feedback exist.

## Install Tooling Note

After the baseline `npm ci`, the local Vite package was missing `node_modules/vite/dist/client/client.mjs`, which caused a smoke runner to fail at import time. `npm pack vite@7.3.2 --dry-run` confirmed the package tarball includes that file. The local install was repaired with `npm cache clean --force`, removal of the bad `node_modules/vite`, and `npm install`. The benchmark scripts remain on `vite-node` because several repo runners depend on Vite raw imports.

## What Prompt 1 Must Fix

- Split smoke/full verification paths.
- Keep `npm run test` terminating reliably.
- Add smoke scripts for perf and Romanized self-consistency.
- Refactor scorecard to read fresh existing reports and fail on missing/stale required reports.
- Add consistent report metadata to smoke/default report generators.
- Deduplicate keyboard candidates before shortcut assignment.
- Merge candidate reasons/sources when duplicate text is produced.
- Harden KeyboardEngine unknown-session and malformed-key behavior.
- Keep Traditional layout honest and pending until source-of-truth data exists.
- Keep native proof-spike scaffolds actionable but non-production.
- Create production architecture, privacy/security, performance baseline, roadmap, and completion documentation.
