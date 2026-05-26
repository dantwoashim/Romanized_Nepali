# Prompt 3 Baseline Audit

Checked: 2026-05-26

This audit was taken before Prompt 3 implementation edits. It verifies the Prompt 1 safety foundation and Prompt 2 lexical/phrase layer, and identifies the repo-executable gaps Prompt 3 must close.

## Scripts Found

| Script | Status |
| --- | --- |
| `test` | Present, passes |
| `build` | Present, passes |
| `check:privacy` | Present, passes |
| `check:engine-local` | Present, passes |
| `check:engine-no-dom` | Present, passes |
| `benchmark:protected` | Present, passes |
| `benchmark:romanized` | Present, passes |
| `benchmark` | Present, passes |
| `bench:perf` | Present, passes |
| `verify` | Present, passes |
| `lexicon:rank-hunspell` | Present |
| `lexicon:merge` | Present |

## Scripts Missing Before Prompt 3

| Script | Prompt 3 action |
| --- | --- |
| `check:user-data` | Add user-data safety gate |
| `benchmark:proofread` | Add proofread benchmark |
| `benchmark:competitor` | Add legal manual competitor probe benchmark |
| `scorecard:engine` | Add final engine scorecard generator |

## Prompt 1 Completeness

| Item | Baseline status |
| --- | --- |
| `src/engine` facade | Present |
| Stable engine types | Present |
| Input classifier | Present with tests |
| Protected span engine | Present with tests |
| Strict/mixed wrappers | Present |
| Protected-span hostile fixtures | Present |
| `benchmark:protected` | Present, passing |
| `bench:perf` | Present, passing |
| `check:engine-local` | Present, passing |
| `check:engine-no-dom` | Present, passing |
| Safety docs | Present |

## Prompt 2 Completeness

| Item | Baseline status |
| --- | --- |
| Lexical Authority Layer | Present |
| Hunspell ranking script | Present |
| Lexicon merge/load path | Present |
| Generated ranked lexicon artifact | Present |
| Alias and name/surname expansion | Present |
| Loanword dictionary | Present |
| English-preserve dictionary | Present |
| Place/province/admin starter pack | Present |
| Sliding-window phrase matcher | Present |
| Domain phrase packs | Present |
| Ranking improvements | Present |
| `benchmark:romanized` | Present, passing |
| Failure taxonomy | Present |
| Hostile Romanized fixtures | Present |
| Lexical/phrase/name docs | Present |

## Baseline Command Results

| Command | Baseline result |
| --- | --- |
| `npm run test` | Pass: 15 files, 95 tests |
| `npm run build` | Pass: main JS 2,774.06 kB min / 490.82 kB gzip; lazy Hunspell 956.45 kB min / 176.58 kB gzip |
| `npm run check:privacy` | Pass |
| `npm run check:engine-local` | Pass |
| `npm run check:engine-no-dom` | Pass |
| `npm run benchmark:protected` | Pass: 12/12 protected spans preserved |
| `npm run benchmark:romanized` | Pass: 6,730 fixtures; top-1/top-3/top-5/MRR all 1.0000 |
| `npm run benchmark` | Pass: Preeti 10,225 exact 1.0000; Romanized 6,730 top-1/top-3/top-5/MRR 1.0000 |
| `npm run bench:perf` | Pass: Romanized p95 7 ms; 5KB Preeti p95 18 ms |
| `npm run verify` | Pass |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |

## Prompt 3 Blockers/Gaps To Close

- Proofread/spell-hint engine is not yet exposed through `src/engine/proofread`.
- Correction memory still needs a pure migration/storage abstraction under `src/engine/memory`.
- Legacy profile abstraction needs typed profiles and unknown-font diagnostics.
- Real user document intake needs a consent schema, gitignored raw folders, and safety gate.
- Competitor probes need a legal manual-only benchmark and protocol.
- Final scorecard generation is not yet a package script.
- Desktop/input-surface strategy, public claims policy, and final gap closure docs need consolidation.

No baseline failure required weakening Prompt 1 or Prompt 2 behavior.
