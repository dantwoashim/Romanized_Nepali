# Validation Report

## Current Decision

Status: controlled web/PWA testing only. Not ready for broad public demo positioning or comparative quality claims.

Decision: continue controlled user testing for the web/PWA. Do not start Tauri desktop preview until real-user Preeti and Romanized failures are collected, triaged, and fixed inside the web product first.

## Evidence To Collect

| Signal | Target | Current |
| --- | ---: | --- |
| Qualified users tried demo | 10 | 0 |
| Specific feedback submissions | 5 | 0 |
| Desktop preview requests | 3 | 0 |
| Real Preeti/Unicode workflows mentioned | 2 | 0 |
| Domain vocabulary requests | 1 | 0 |
| Consented real Preeti documents collected | 30 | 0 |

## Automated Gates

Latest local run: 2026-05-27.

| Gate | Result |
| --- | --- |
| `npm run verify` | Pass: TypeScript typecheck, test suite, production build, privacy guard, offline cache gate, runtime benchmark-data exclusion gate, user-data gate, benchmark disjointness, proofread benchmark, competitor probe benchmark, engine local/no-DOM/protected-span gates |
| `npm audit --audit-level=moderate` | Pass: 0 vulnerabilities |
| `npm run benchmark` | Preeti 10,225 fixtures: generated/manual/held-out/competitor exact 1.0000, CER 0, WER 0; Romanized 6,756 fixtures: generated/manual/regression/hostile/hard-hostile/competitor top-1/top-3/top-5/MRR 1.0000 |
| `npm run audit:preeti-source` | Pass: 12 source-audit fixtures; 11 conversion-scored, 3 historical converter-bug cases now matching, 0 ambiguous source encodings, 1 style-normalization |
| `npm run benchmark:preeti:fuzz` | Pass: 26 fuzz fixtures; legal exact `1.0000`, illegal safety `1.0000` |
| `npm run benchmark:preeti:roundtrip` | Pass: 15 roundtrip oracle fixtures; exact `1.0000` |
| `npm run alias:romanized` | Pass: 76,193 weighted alias variants, 70,201 unique alias keys, 40,138 outputs |
| `npm run check:alias-collisions` | Pass/report: 4,499 alias collisions; 262 expected ambiguous; 4,237 review-needed |
| `npm run benchmark:romanized:self` | Pass: 2,130 facade self-consistency cases; NFC stability, selected-output candidate representation, hard candidate caps, and protected preservation all `1.0000` |
| `npm run check:engine-local` | Pass: no `fetch`, `XMLHttpRequest`, `WebSocket`, Node `http`, Node `https`, or request primitives in `src/engine` |
| `npm run check:engine-no-dom` | Pass: no DOM/browser hot-path APIs such as `window`, `document.*`, `HTMLElement`, `localStorage`, `DOMParser`, or `navigator` in `src/engine` |
| `npm run benchmark:protected` | Pass: 12/12 protected-span hostile cases preserve expected protected spans; 0 missing, corrupted, or altered spans |
| `npm run benchmark:proofread` | Pass: 9/9 curated proofread fixtures, auto-fix precision proxy `1.0000` |
| `npm run benchmark:competitor` | Pass: 10 local Lekh probe checks, protected failures `0`, competitor collection pending manually |
| `npm run check:user-data` | Pass: no tracked raw/private files, missing consent references, or obvious fixture PII found |
| `npm run check:benchmark-disjointness` | Pass: generated and contaminated suites are reported; `romanized-held-out` is quarantined as `regression-contaminated` and excluded from public proof |
| `npm run scorecard:engine` | Pass: writes `bench/reports/engine-scorecard.json` and updates `docs/ENGINE_QUALITY_SCORECARD.md` |
| `npm run bench:perf` | Pass: reports p95 16 ms for hostile Romanized mixed input and p95 173 ms for 5KB mixed Preeti paragraph; no gross slowdown, but 5KB Preeti remains above the initial 100 ms target |
| `npm run report:quality` | 5,000 Romanized fixtures: top-1 1.0, top-3 1.0, top-5 1.0, MRR 1.0, suggestion hit@5 0.9856, p95 latency about 0.171 ms |
| `npm run report:preeti` | 10,005 Preeti fixtures: 80 manual, 9,920 generated, 5 held-out, 0 user-submitted; exact match 1.0, CER 0, WER 0, p95 latency about 0.025 ms |
| `npm run dictionary:review` | Generated 5,645 `dictionary-ne` alias review rows under ignored `reports/` |

These metrics are internal fixture metrics, not public superiority claims and not real-user document validation.

Benchmark fixture mix:

| Engine | Generated | Manual | Held-out | Competitor probes | User submitted |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | 9,920 | 200 | 55 | 50 | 0 |
| Romanized | 5,000 | 500 manual plus 100 contaminated regression | 1,054 hostile/hard-hostile cases; contaminated former held-out excluded from public proof | 100 | 0 |
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
| Romanized | hard hostile prose | 24 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Romanized | competitor | 100 | top-1/top-3/top-5 `1.0000`, MRR `1.0000` |
| Protected spans | manual hostile | 12 | preservation `1.0000`, missing/corrupted/altered spans `0` |
| Proofread | manual/hostile | 9 | exact `1.0000`, auto-fix precision proxy `1.0000` |
| Competitor probes | manual templates | 10 | Lekh expected-pass `10/10`, competitor outputs pending |

Top failure categories:

| Category | Count | Severity mix |
| --- | ---: | --- |
| None in current benchmark | 0 | P0: 0, P1: 0, P2: 0 |

The production bundle lazy-loads the conversion tools. The first-load app shell is now about 200.52 kB minified / 63.63 kB gzip. Heavy local engine/data code is isolated behind lazy chunks: a shared engine chunk of about 2,532.05 kB minified / 416.34 kB gzip and a lazy Hunspell chunk of about 956.51 kB minified / 176.62 kB gzip. This is acceptable for controlled testing but the shared engine/data chunk should be split or compacted before a broad public launch.

## Remaining Failure Categories

- Real Preeti documents: no consented user documents are in the fixture set yet.
- Preeti mixed-English preservation: the current project-owned cases pass, but real documents can still contain unseen English tokens embedded in Preeti text.
- Preeti punctuation/source truth: `?` remains inherently ambiguous in legacy Preeti because it can represent either punctuation or `रु`; source audit now separates verified conversion bugs, ambiguous source encodings, and style/proofread cases.
- Deterministic Preeti decoder: semantic profile maps, greedy tokenization, typed atoms, verifier, compare/auto/atom modes, and fuzz/roundtrip oracle reports are in place. The baseline converter remains the conservative fallback until cutover is proven on real documents.
- Romanized benchmark: current generated/manual/regression/hostile/competitor fixtures pass, but the score is still internal and fixture-driven until manually filled competitor probes and real preview phrases are added. The former `romanized-held-out` suite is contaminated by phrase-pack overlap and is not public proof.
- Romanized alias collisions: the alias factory intentionally reports thousands of ambiguous keys from imported dictionary-derived aliases. These must be ranked/reviewed, not hidden.
- Romanized ranking: phrase/alias coverage is strong on current fixtures; user correction memory still needs real preview examples.
- Engine facade: existing converters are wrapped and mixed-document spans are protected. Lexical authority, Hunspell ranking artifacts, expanded aliases, loanword/preserve dictionaries, sliding-window phrase matching, starter domain packs, proofread hooks, memory scoring, legacy profile diagnostics, real-document protocol, competitor probes, and scorecards are in place.
- Protected span coverage: current hostile cases cover common admin/digital spans, but real mixed Preeti documents can still expose unseen labels or typography.
- Runtime size: the expanded local wordlist is no longer in the initial app shell, but the lazy shared engine/data chunk should still be split or compacted before broad launch.
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
