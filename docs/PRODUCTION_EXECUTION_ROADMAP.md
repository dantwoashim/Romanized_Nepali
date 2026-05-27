# Production Execution Roadmap

Generated: 2026-05-27

## Phase 0: Verification Stabilization And Repo Truth

Objective: make default verification reliable and honest.

Deliverables: smoke/full split, fresh-report scorecard, baseline audit, no-hang test path.

Acceptance: `npm run test`, `npm run scorecard:engine`, and `npm run verify` exit cleanly.

Tests: typecheck, unit tests, smoke benchmarks, scorecard freshness.

Risks: stale reports and long benchmarks hiding in default verification.

Do not: hide missing reports or skip hard fixtures.

## Phase 1: KeyboardEngine Hardening And Candidate Cleanup

Objective: stabilize native/browser API.

Deliverables: required `processKeyStroke`, safe unknown sessions, range semantics, candidate dedupe, sequential shortcuts.

Acceptance: keyboard tests pass and candidate UI has no duplicate text or shortcut gaps.

Tests: KeyboardEngine unit tests, typing-session benchmark.

Risks: native bridge ambiguity.

Do not: bypass `src/engine`.

## Phase 2: Traditional Layout Audit

Objective: produce verified Traditional source-of-truth.

Deliverables: LTK capture, standard layout review, diff, fixture file, decision doc.

Acceptance: final layout JSON has provenance, fixture coverage, and human review.

Tests: layout audit validator and key-event fixtures.

Risks: unverified mappings.

Do not: fake keymaps.

## Phase 3: Romanized Keyboard Polish

Objective: make Romanized typing feel native.

Deliverables: candidate quality, helper suggestions, labels, prefix caching, protected-token behavior.

Acceptance: typing-session top-k and latency targets hold.

Tests: Romanized benchmark, typing-session benchmark, perf smoke.

Risks: candidate explosion or English corruption.

Do not: add latency as a linguistic ranking penalty.

## Phase 4: Traditional Keyboard Implementation

Objective: implement Traditional physical typing after audit.

Deliverables: keymap composer, matra/halanta handling, layout preview.

Acceptance: audited fixtures pass.

Tests: Traditional key-event fixtures.

Risks: layout mismatch for LTK users.

Do not: ship pending files as truth.

## Phase 5: Proofread, Dictionary, And Memory Integration

Objective: improve assistive typing without hidden mutation.

Deliverables: conservative proof hints, safe dictionary lookup, local correction memory.

Acceptance: secure fields disable recording and suggestions as required.

Tests: proofread benchmark, dictionary lookup fixtures, memory tests.

Risks: aggressive autocorrect.

Do not: scrape meanings or collect typed text.

## Phase 6: Companion App MVP

Objective: build settings and diagnostics around the daemon.

Deliverables: settings, privacy, dictionary, memory, layout preview, diagnostics, Preeti side utility.

Acceptance: companion controls daemon but is not the IME.

Tests: UI smoke, settings persistence, privacy checks.

Risks: global-hook shortcut temptation.

Do not: call companion app the keyboard.

## Phase 7: Windows TSF Proof Spike

Objective: prove Windows native input path.

Deliverables: TSF skeleton, dummy candidate, static commit, named pipe fallback.

Acceptance: tested in target Windows apps.

Tests: Notepad, Word, Chrome, Edge, VS Code.

Risks: registration/signing issues.

Do not: claim production without signing and host-app matrix.

## Phase 8: macOS IMK Proof Spike

Objective: prove macOS native input path.

Deliverables: IMK skeleton, marked text, dummy candidate, XPC fallback.

Acceptance: tested in target macOS apps.

Tests: TextEdit, Safari, Chrome, Pages, VS Code.

Risks: sandbox/XPC/notarization constraints.

Do not: use vague local IPC in place of XPC.

## Phase 9: Daemon And IPC Implementation

Objective: connect native shells to engine.

Deliverables: daemon runtime, IPC server, session TTL, diagnostics, fail-open policy.

Acceptance: hot path timeout under 50 ms.

Tests: IPC harness, daemon crash test, pass-through test.

Risks: host app freezes.

Do not: block host apps while starting daemon.

## Phase 10: Native Beta Integration

Objective: integrate real engine into native shells.

Deliverables: Romanized/native candidate flow, Traditional flow if audited, companion settings.

Acceptance: private beta install works.

Tests: native app matrix.

Risks: candidate UI differences by host app.

Do not: expand scope to mobile/cloud.

## Phase 11: Performance Hardening

Objective: optimize hot path.

Deliverables: lazy loading, bounded caches, IPC timing, bundle review.

Acceptance: p95 targets hold under beta workloads.

Tests: perf smoke/full, native timing.

Risks: heavy dictionary/proofread in hot path.

Do not: lower linguistic quality through latency penalty.

## Phase 12: Private Pilot

Objective: collect consented human feedback.

Deliverables: pilot packet, redacted bug reports, triage board.

Acceptance: feedback is consented and actionable.

Tests: pilot workflows.

Risks: accidental real-document collection.

Do not: invent consent metadata.

## Phase 13: Public Beta

Objective: release to a wider audience with support path.

Deliverables: signed installers, update channel, known limitations, support docs.

Acceptance: install/update/uninstall works.

Tests: release checklist.

Risks: unsupported native environments.

Do not: claim stable release yet.

## Phase 14: Stable Release

Objective: ship only after evidence.

Deliverables: stable installers, privacy review, pilot fixes, support and update process.

Acceptance: release gate complete.

Tests: full verification, native matrix, installer tests.

Risks: overclaiming.

Do not: claim best/100%/government-ready.
