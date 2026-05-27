# Prompt 3 Production Baseline Audit

Generated: 2026-05-28 18:16 NPT

Prompt: Prompt 3 of 3 from the Lekh Keyboard Production-Ready Master Plan.

## Executive Status

The repository begins Prompt 3 with the Prompt 1 foundation and Prompt 2 keyboard intelligence intact. The baseline verification loop completed without hangs or failures. The repo is not launch-ready as a signed native Windows/macOS keyboard because production TSF/IMK validation, platform signing/notarization, real Windows native testing, and human Traditional layout validation are external/native/human blockers.

The repo-executable engine path is healthy:

- TypeScript typecheck, tests, build, privacy checks, no-DOM/no-network checks, benchmark disjointness, typing-session benchmark, Romanized benchmarks, proofread benchmark, performance smoke, scorecard, verification, and npm audit all passed.
- Typing-session fixtures are non-zero and currently include 58 cases.
- Candidate duplicate count is 0.
- Shortcut sequence validity is 1.
- Keyboard hot-path latency is within the current JavaScript/web-lab targets.

## Repository State

- App stack: Vite + React + TypeScript.
- Engine root: `src/engine`.
- Keyboard engine: `src/engine/keyboard`.
- Keyboard validation UI: `src/features/keyboard`.
- Companion shell: `src/features/companion`.
- Native scaffold root: `native`.
- Benchmark fixtures: `bench/fixtures`.
- Benchmark reports: `bench/reports`.
- Scorecard output: `docs/ENGINE_QUALITY_SCORECARD.md`.

The baseline run refreshed these report files:

- `bench/reports/benchmark-disjointness-report.json`
- `bench/reports/engine-scorecard.json`
- `bench/reports/perf-report.json`
- `bench/reports/proofread-report.json`
- `bench/reports/romanized-report.json`
- `bench/reports/romanized-self-consistency-report.json`
- `bench/reports/typing-session-report.json`
- `docs/ENGINE_QUALITY_SCORECARD.md`

## Prompt 1 Completion Status

Status: complete for repo-executable foundation.

Evidence:

- Verification stabilization is present through smoke/full benchmark split scripts.
- `npm run verify` completed successfully in the baseline.
- Candidate dedupe and sequential shortcut behavior are covered by typing-session benchmark metrics.
- `KeyboardEngine` API exists with session, composition, commit, cancel, warm, secure input, and range behavior.
- Traditional physical layout remains honestly blocked pending source-of-truth/human LTK validation.
- Native Windows/macOS scaffolds exist and do not break normal JS verification.
- Production architecture, privacy, IPC, daemon, readiness, and performance baseline docs exist.

## Prompt 2 Completion Status

Status: complete for repo-executable keyboard intelligence.

Evidence:

- Romanized live typing is implemented through `KeyboardEngine`.
- Romanized helper suggestions and Romanized labels are represented in the keyboard candidate model and Keyboard Lab.
- Phrase completions, next-word baseline, memory boost, proofread hints, dictionary lookup, and protected-token behavior are present.
- Traditional Unicode suggestions/proofread work while physical Traditional layout stays blocked-human.
- Keyboard Lab exposes validation controls and warnings.
- Companion shell exists but remains partial relative to the final production desktop companion target.
- Expanded typing-session benchmark passes with 58 fixtures and 0 failures.

## Verification Results

Log directory: `/tmp/lekh_prod_p3_baseline_1779905801`

| Command | Status | Duration | Log |
| --- | --- | ---: | --- |
| `npm ci` | pass | 6.125s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_ci.log` |
| `npm run typecheck` | pass | 7.156s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_typecheck.log` |
| `npm run test` | pass | 26.260s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_test.log` |
| `npm run build` | pass | 2.787s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_build.log` |
| `npm run check:privacy` | pass | 0.270s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_check_privacy.log` |
| `npm run check:engine-local` | pass | 0.256s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_check_engine-local.log` |
| `npm run check:engine-no-dom` | pass | 0.256s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_check_engine-no-dom.log` |
| `npm run check:user-data` | pass | 0.263s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_check_user-data.log` |
| `npm run check:benchmark-disjointness` | pass | 0.494s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_check_benchmark-disjointness.log` |
| `npm run benchmark:typing-session` | pass | 2.606s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_typing-session.log` |
| `npm run benchmark:romanized` | pass | 14.382s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_romanized.log` |
| `npm run benchmark:romanized:self:smoke` | pass | 2.126s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_romanized_self_smoke.log` |
| `npm run benchmark:proofread` | pass | 1.639s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_proofread.log` |
| `npm run benchmark` | pass | 16.943s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark.log` |
| `npm run bench:perf:smoke` | pass | 4.019s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_bench_perf_smoke.log` |
| `npm run scorecard:engine` | pass | 0.281s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_scorecard_engine.log` |
| `npm run verify` | pass | 58.567s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_verify.log` |
| `npm audit --audit-level=moderate` | pass | 0.832s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_audit_--audit-level=moderate.log` |
| `npm run test:dictionary` | pass | 5.547s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_test_dictionary.log` |
| `npm run audit:traditional-layout` | pass | 0.283s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_audit_traditional-layout.log` |
| `npm run benchmark:protected` | pass | 2.533s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_protected.log` |
| `npm run benchmark:competitor` | pass | 2.156s | `/tmp/lekh_prod_p3_baseline_1779905801/npm_run_benchmark_competitor.log` |

No baseline command failed. No command hung.

## Benchmark and Performance Snapshot

Typing-session report:

- Fixture count: 58.
- Failed cases: 0.
- Candidate duplicate count: 0.
- Shortcut sequence validity: 1.
- Candidate p50: 2ms.
- Candidate p95: 4ms.
- Update p95: 4ms.
- Commit p95: 0ms.
- Mean KSR baseline: 0.03392911735923696.

Performance smoke report:

- KeyboardEngine warm startup p95: 1ms, target 500ms.
- Partial warm timeout p95: 0ms, target 50ms.
- Romanized live update p95: 5ms, target 20ms.
- Candidate count cap p95: 3ms, target 20ms.
- Traditional Unicode suggestion p95: 3ms, target 20ms.
- Proofread hint p95: 0ms, target 40ms.
- Dictionary lookup p95: 9ms, target 30ms.
- Memory ranking p95: 3ms, target 10ms.
- Candidate commit p95: 4ms, target 10ms.
- Native IPC JSON envelope simulation p95: 0ms, target 10ms.
- Side utility Preeti 5KB paragraph p95: 152ms, target 100ms. This is not a keyboard hot-path blocker, but remains a side-utility performance issue to track separately.

## Stale Report Risk

Current status: no stale report blocker found in the baseline.

The scorecard regenerated from the current report files during this audit. Prompt 3 still needs to keep scorecard freshness explicit in the final production scorecard and final verification report.

## Native State

Current status: scaffold/build-ready documentation, not production native release.

Existing native files include:

- `native/shared/ipc/lekh-keyboard-ipc.schema.json`
- `native/shared/ipc/messages.ts`
- `native/daemon/protocol/README.md`
- `native/windows-tsf/skeleton/CMakeLists.txt`
- `native/windows-tsf/skeleton/LekhTextService.placeholder.cpp`
- `native/macos-imk/skeleton/Package.swift`
- `native/macos-imk/skeleton/LekhInputController.placeholder.swift`

Windows TSF status:

- Strategy: TSF text service plus per-user named pipe IPC.
- Current blocker: Windows native build/test environment and code-signing certificate are unavailable in this repo execution environment.
- Prompt 3 action: make the Windows path build-ready/actionable and document exact commands, fallback, signing, registration, and test matrix.

macOS IMK status:

- Strategy: IMK input method plus XPC service.
- Current blocker: production signing/notarization is unavailable; real installed input-method validation may require manual host-app testing outside JS verification.
- Prompt 3 action: make the IMK/XPC path build-ready/actionable and document exact install, fallback, signing, notarization, and test matrix.

## Companion State

Current status: partial shell/scaffold.

The companion shell exists in `src/features/companion`, but Prompt 3 must turn it into a production-usable settings/diagnostics surface or document an exact external build blocker. It must remain clear that the companion is not the IME and does not globally hook keys.

## Traditional State

Current status: partial with honest human blocker.

Traditional Unicode suggestions and proofread behavior are available. Traditional physical keymap production readiness is blocked until the LTK-compatible layout is manually captured and validated by human Traditional typists or an authoritative source-of-truth.

Prompt 3 must not fake Traditional physical mappings. It must provide the exact capture, validation, fixture, and owner/action path to unblock this.

## Release Blockers

P0 external/native/human blockers:

- Windows TSF production validation requires a real Windows test environment.
- Windows production distribution requires a code-signing certificate.
- macOS production distribution requires Apple Developer ID and notarization.
- Native IMK/XPC production validation requires installed input-method testing on target macOS apps.
- Traditional physical layout production status requires human LTK/source-of-truth validation.
- Dictionary meanings require a licensed safe source; no meanings may be invented or scraped.

P1 repo-executable work remaining at baseline:

- Final production daemon/dev IPC implementation and tests.
- Native storage adapter implementation or exact supported dev/native path.
- Companion production shell hardening.
- Native implementation reports and release build docs.
- Final production scorecard/readiness/gap/demo reports.

P2 tracked work:

- Preeti side-utility 5KB performance smoke exceeds its current side-utility target.
- KSR baseline is measured but still low for premium typing goals; this is quality-improvement work, not a verification blocker.

## Baseline Decision

Proceed with Prompt 3 repo-executable production work. Do not claim stable launch until native platform validation, signing/notarization, and human Traditional layout validation are resolved.
