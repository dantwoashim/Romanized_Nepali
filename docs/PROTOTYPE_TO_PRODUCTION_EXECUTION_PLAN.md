# Prototype To Production Execution Plan

Generated: 2026-05-27

## Principle

The browser Keyboard Lab proves engine behavior. It is not the product. Production requires native TSF/IMK integration, a per-user daemon, signed installers, privacy controls, and pilot feedback.

## Stage 1: Stabilize Repo Truth

Deliverables:

- stable default verification;
- smoke/full benchmark split;
- fresh-report scorecard;
- candidate dedupe and shortcut cleanup;
- KeyboardEngine API hardening;
- production documentation.

Acceptance:

- `npm run test` exits;
- `npm run verify` exits;
- scorecard fails on missing/stale required reports;
- no fake production claims.

## Stage 2: Keyboard Intelligence

Deliverables:

- Romanized live typing polish;
- Romanized helper suggestions and labels;
- Traditional physical layout if audit data exists;
- Traditional Unicode suggestions and proofread;
- dictionary and local memory improvements;
- next-word baseline;
- Keyboard Lab polish.

Acceptance:

- typing-session benchmarks remain non-empty;
- candidates are unique with sequential shortcuts;
- secure input disables memory/suggestions;
- Traditional placeholder remains honest if audit is pending.

## Stage 3: Native Proof Spikes

Deliverables:

- Windows TSF proof spike;
- macOS IMK proof spike;
- daemon IPC harness;
- pass-through fallback tests;
- native diagnostics.

Acceptance:

- key events received in native shell;
- static Unicode commit works;
- daemon unavailable path passes through;
- no host app freezes.

## Stage 4: Companion And Storage

Deliverables:

- companion MVP shell;
- settings pages;
- memory/dictionary controls;
- privacy diagnostics;
- native storage adapters.

Acceptance:

- companion is not the IME;
- settings update the daemon safely;
- local data can be reset/exported/imported.

## Stage 5: Release Hardening

Deliverables:

- signed Windows installer;
- notarized macOS installer;
- update/uninstall path;
- crash reporting policy without typed text;
- private pilot;
- public beta gate.

Acceptance:

- native testing on real Windows/macOS;
- signing/notarization complete;
- pilot feedback addressed;
- public claims remain scoped to evidence.
