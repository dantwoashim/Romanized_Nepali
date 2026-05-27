# Prompt 1 Keyboard Baseline Audit

Generated: 2026-05-27

This audit starts the Lekh Keyboard Prompt 1 implementation. The patched master plan at `/Users/rohanbasnet14/Downloads/LEKH_KEYBOARD_FINAL_UNIFIED_MASTER_PLAN_v2_PATCHED.md` was read in full before edits.

## Repository Structure Summary

- `src/engine` is the local-first engine boundary and already contains classification, protected spans, Romanized conversion, legacy/Preeti conversion, proofread, memory, segmentation, router, lattice, and structural verification modules.
- `src/features` contains the browser prototype surfaces for Preeti, Romanized, Traditional layout reference, feedback, dictionary suggestions, and desktop-interest capture.
- `scripts` contains benchmark, scorecard, privacy, local-first, no-DOM, user-data, alias, Preeti audit, and performance gates.
- `bench/fixtures` and `bench/reports` contain conversion correctness fixtures and generated benchmark reports.
- `docs` already contains conversion correctness, public claims, input-surface, scorecard, and validation documentation from the previous conversion work.

## Existing Engine Modules And Roles

| Module | Current role | Prompt 1 treatment |
|---|---|---|
| `src/engine/index.ts` | Stable conversion facade | Preserve and extend exports only |
| `src/engine/classify` | Document/input classifier | Preserve |
| `src/engine/protected` | Protected span preservation | Preserve, do not weaken |
| `src/engine/romanized` | Romanized conversion/candidates | Reuse through keyboard wrapper |
| `src/engine/legacy` | Preeti/legacy companion conversion | Preserve as side utility |
| `src/engine/lexicon` | Lexical authority/dictionary basis | Reuse where safe |
| `src/engine/proofread` | Proofread hints and auto-fix layer | Reuse through keyboard wrapper |
| `src/engine/memory` | Local correction memory | Keep separate from Prompt 1 storage work |
| `src/engine/segmentation`, `router`, `lattice`, `verify` | Span-routed safety model | Preserve |

## Existing UI Prototype Status

- The browser app currently exposes Preeti, Romanized, and Traditional reference tabs.
- Preeti and Romanized user paths route through `src/engine`.
- Traditional is currently a reference surface, not a real typing engine.
- Prompt 1 will add a Keyboard Lab as a browser/web-lab simulator for the new `KeyboardEngine` API without replacing existing tools.

## Keyboard-Related Gaps Before Prompt 1

- No `src/engine/keyboard` session API.
- No `KeyboardKeyEvent` contract for native TSF/IMK bridges.
- No session lifecycle with composition/candidate/commit/cancel semantics.
- No typing-session benchmark harness.
- Traditional layout source-of-truth audit artifacts are absent.
- Native feasibility docs for Windows TSF, macOS IMK, daemon lifecycle, and IPC are absent.
- No first-run onboarding defaults for keyboard mode, proofread, memory, or secure fields.

## Baseline Command Results

Initial note: an attempted shell loop used `commands`, which is a read-only zsh hash. That attempt did not run the intended baseline commands. The baseline was rerun immediately with a neutral variable name.

| Command | Status | Notes |
|---|---:|---|
| `npm ci` | Pass | 171 packages installed, 0 vulnerabilities |
| `npm run typecheck` | Pass | TypeScript project check clean |
| `npm run test` | Pass | 23 files, 143 tests |
| `npm run build` | Pass | Large chunk warning remains: main engine chunk about 2.66 MB minified / 452 KB gzip |
| `npm run check:privacy` | Pass | No text telemetry payloads found |
| `npm run check:engine-local` | Pass | No network primitives in `src/engine` |
| `npm run check:engine-no-dom` | Pass | No DOM/browser hot-path APIs in `src/engine` |
| `npm run check:user-data` | Pass | No tracked raw/private files or obvious fixture PII |
| `npm run check:benchmark-disjointness` | Pass | `romanized-held-out` remains contaminated and excluded from public proof |
| `npm run audit:preeti-source` | Pass | 12 fixtures; 11 conversion-benchmark eligible |
| `npm run benchmark:protected` | Pass | 12/12 protected span preservation |
| `npm run benchmark:preeti` | Pass | 10,225 fixtures, exact match rate 1.0 by current locked suites |
| `npm run benchmark:preeti:fuzz` | Pass | 26 fixtures; legal exact 1.0, illegal warn/unsafe 1.0 |
| `npm run benchmark:preeti:roundtrip` | Pass | 15/15 exact |
| `npm run benchmark:romanized` | Pass | 6,756 fixtures; hard-hostile 24/24 top-1 under current locked suite |
| `npm run benchmark:romanized:self` | Pass | 2,130 fixtures; no failures |
| `npm run benchmark:proofread` | Pass | 9/9 exact |
| `npm run benchmark:competitor` | Pass | Lekh expected outputs pass; competitor collection pending manual collection |
| `npm run benchmark` | Pass | Summary includes Preeti, Romanized, and mixed-span mutations |
| `npm run bench:perf` | Pass | Romanized p95 10-13 ms in baseline runs; 5 KB Preeti p95 156-184 ms, not grossly slow |
| `npm run scorecard:engine` | Pass | Fresh scorecard generated |
| `npm run verify` | Pass | Full current verification chain passed |
| `npm audit --audit-level=moderate` | Pass | 0 vulnerabilities |

## Current Benchmark Status

- Protected spans: passing.
- Preeti: passing current locked manual/generated/held-out/competitor fixtures.
- Romanized: passing current locked suites; scorecard still separates contaminated held-out status.
- Proofread: passing current proofread fixtures.
- Competitor probes: internal expected Lekh outputs pass; market comparison collection remains pending and cannot support public claims.
- Mixed-span mutations: silent corruption rate 0 on current generated/hostile suites.

## Current Docs Status

- Conversion-correctness docs are present and conservative.
- Keyboard-specific Prompt 1 docs are missing and will be created in this implementation.
- Existing public-claim policy forbids broad claims such as best, 99%, government-ready, or beating competitors.

## Current Bundle And Performance Status

- `vite build` passes.
- Large production chunks remain:
  - `index-CT-LzCLL.js`: about 2,658.99 kB minified / 452.47 kB gzip.
  - Hunspell chunk: about 956.51 kB minified / 176.62 kB gzip.
- `bench:perf` passes the gross slowdown gates.
- Prompt 1 must avoid importing benchmark fixtures or heavy data into the UI/keyboard hot path.

## Preserved In Prompt 1

- Existing `convert`, `convertRomanized`, and `convertPreeti` behavior.
- Protected span behavior and gates.
- No-DOM and no-network engine constraints.
- Preeti as companion utility, not keyboard core.
- Current browser prototype surfaces.

## Not Touched In Prompt 1

- No production Windows TSF implementation.
- No production macOS InputMethodKit implementation.
- No Rust port.
- No monorepo restructuring.
- No final Traditional keymap without source-of-truth audit.
- No new unsafe datasets, scraped data, fabricated real user docs, or invented consent metadata.
