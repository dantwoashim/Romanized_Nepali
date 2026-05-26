# Validation Report

## Current Decision

Status: controlled web/PWA testing only. Not ready for broad public demo positioning or comparative quality claims.

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
| `npm run verify` | Pass: TypeScript typecheck, test suite, production build, privacy guard, offline cache gate, runtime benchmark-data exclusion gate, user-data gate, benchmark disjointness, proofread benchmark, competitor probe benchmark, engine local/no-DOM/protected-span gates |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |
| `npm run benchmark` | Preeti 10,225 fixtures: generated/manual/held-out/competitor exact 1.0000, CER 0, WER 0; Romanized 6,730 fixtures: generated/manual/regression/hostile/competitor top-1/top-3/top-5/MRR 1.0000 |
| `npm run check:engine-local` | Pass: no `fetch`, `XMLHttpRequest`, `WebSocket`, Node `http`, Node `https`, or request primitives in `src/engine` |
| `npm run check:engine-no-dom` | Pass: no DOM/browser hot-path APIs such as `window`, `document.*`, `HTMLElement`, `localStorage`, `DOMParser`, or `navigator` in `src/engine` |
| `npm run benchmark:protected` | Pass: 12/12 protected-span hostile cases preserve expected protected spans; 0 missing, corrupted, or altered spans |
| `npm run benchmark:proofread` | Pass: 9/9 curated proofread fixtures, auto-fix precision proxy `1.0000` |
| `npm run benchmark:competitor` | Pass: 10 local Lekh probe checks, protected failures `0`, competitor collection pending manually |
| `npm run check:user-data` | Pass: no tracked raw/private files, missing consent references, or obvious fixture PII found |
| `npm run check:benchmark-disjointness` | Pass: generated and contaminated suites are reported; `romanized-held-out` is quarantined as `regression-contaminated` and excluded from public proof |
| `npm run scorecard:engine` | Pass: writes `bench/reports/engine-scorecard.json` and updates `docs/ENGINE_QUALITY_SCORECARD.md` |
| `npm run bench:perf` | Pass: phase-1 skeleton reports p95 7 ms observed for hostile Romanized mixed input and p95 17 ms for 5KB mixed Preeti paragraph; no gross slowdown |
| `npm run report:quality` | 5,000 Romanized fixtures: top-1 1.0, top-3 1.0, top-5 1.0, MRR 1.0, suggestion hit@5 0.9856, p95 latency about 0.171 ms |
| `npm run report:preeti` | 10,005 Preeti fixtures: 80 manual, 9,920 generated, 5 held-out, 0 user-submitted; exact match 1.0, CER 0, WER 0, p95 latency about 0.025 ms |
| `npm run dictionary:review` | Generated 5,645 `dictionary-ne` alias review rows under ignored `reports/` |

These metrics are internal fixture metrics, not public superiority claims and not real-user document validation.

Benchmark fixture mix:

| Engine | Generated | Manual | Held-out | Competitor probes | User submitted |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | 9,920 | 200 | 55 | 50 | 0 |
| Romanized | 5,000 | 500 manual plus 100 contaminated regression | 1,030 hostile cases; contaminated former held-out excluded from public proof | 100 | 0 |
| Protected spans | 0 | 12 | 0 | 0 | 0 |

Benchmark scores by bucket:

| Engine | Bucket | Fixtures | Score |
| --- | --- | ---: | --- |
| Preeti | generated | 9,920 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | manual | 200 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | held-out | 55 | exact `1.0000`, CER `0`, WER `0` |
| Preeti | competitor | 50 | exact `1.0000`, CER `0`, WER `0` |
| Romanized | generated | 5,000 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | manual | 500 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | contaminated regression | 100 | top-1/top-3/top-5 `1.0000`, MRR `1.0000`; excluded from public proof |
| Romanized | hostile | 1,030 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | competitor | 100 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Protected spans | manual hostile | 12 | preservation `1.0000`, missing/corrupted/altered spans `0` |
| Proofread | manual/hostile | 9 | exact `1.0000`, auto-fix precision proxy `1.0000` |
| Competitor probes | manual templates | 10 | Lekh expected-pass `10/10`, competitor outputs pending |

Top failure categories:

| Category | Count | Severity mix |
| --- | ---: | --- |
| None in current benchmark | 0 | P0: 0, P1: 0, P2: 0 |

The production bundle lazy-loads `dictionary-ne`/`nspell` for local spell validation. The expanded local lexicon increases the main JS to 2,774.06 kB minified / 490.82 kB gzip, plus a lazy Hunspell chunk of 956.45 kB minified / 176.58 kB gzip. This is acceptable for controlled testing but should be split or compacted before a broad public launch.

## Remaining Failure Categories

- Real Preeti documents: no consented user documents are in the fixture set yet.
- Preeti mixed-English preservation: the current project-owned cases pass, but real documents can still contain unseen English tokens embedded in Preeti text.
- Preeti punctuation: `?` remains inherently ambiguous in legacy Preeti because it can represent either punctuation or `रु`; current postrules are fixture-driven, not proof of perfect handling.
- Romanized benchmark: current generated/manual/regression/hostile/competitor fixtures pass, but the score is still internal and fixture-driven until manually filled competitor probes and real beta phrases are added. The former `romanized-held-out` suite is contaminated by phrase-pack overlap and is not public proof.
- Romanized ranking: phrase/alias coverage is strong on current fixtures; user correction memory still needs real beta examples.
- Engine facade: Prompt 1 wraps existing converters and protects mixed-document spans. Prompt 2 adds lexical authority, Hunspell ranking artifacts, expanded aliases, loanword/preserve dictionaries, sliding-window phrase matching, and starter domain packs. Prompt 3 adds optional proofread, memory migration/scoring foundation, legacy profile diagnostics, real-document protocol, competitor probes, and scorecards.
- Protected span coverage: current hostile cases cover common admin/digital spans, but real mixed Preeti documents can still expose unseen labels or typography.
- Runtime size: the expanded local wordlist is useful for quality but too large to leave permanently in the initial JS without further compaction or lazy-loading.
- Font variants: Kantipur/Sagarmatha/Himali are planned diagnostics only until verified bundle-safe maps exist.
- Spell UX: first Hunspell use is local, lazy-loaded, and debounced, but still a large chunk.
- Legal notices: third-party notices are available in the app shell at `/THIRD_PARTY_NOTICES.txt`.

## Launch Checklist

- App renders and tools are above the fold.
- Tests pass.
- Build passes.
- PWA shell is registered and hashed assets are precached.
- No typed text is sent automatically.
- Claims avoid official authority, perfect conversion, and native keyboard support.
- Real Preeti document claims remain blocked until consented document intake is populated.
