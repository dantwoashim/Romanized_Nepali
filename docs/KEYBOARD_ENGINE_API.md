# Keyboard Engine API

Generated: 2026-05-27

The `KeyboardEngine` API is the repo-executable contract for Lekh Keyboard. It is implemented in `src/engine/keyboard` and sits above the existing conversion, proofread, dictionary, and memory modules.

## Scope

This API supports:

- browser/web-lab typing simulation;
- future Windows TSF bridge;
- future macOS InputMethodKit bridge;
- session lifecycle;
- composition update;
- key-stroke processing;
- candidate commit;
- raw commit;
- cancellation;
- proof hints;
- dictionary lookup;
- warm startup reporting.

It does not implement production TSF, production IMK, final Traditional layout conversion, or the Tauri companion app.

## Important Types

- `SessionId`: opaque string session key.
- `KeyboardMode`: `romanized`, `traditional`, `unicode-proofread`, `dictionary-lookup`, or `diagnostic`.
- `KeyboardKeyEvent`: native/web normalized key event. `processKeyStroke` requires this shape and is not optional.
- `TypingContext`: app, field, locale, mode, layout, domain, secure-input, and surface policy.
- `CandidateUpdate`: per-update composition, display preview, candidates, proof hints, warnings, confidence, and latency.
- `CommitResult`: committed text plus consumed/replacement ranges and follow-up candidates.
- `WarmResult`: readiness, partial state, loaded modules, unavailable modules, warm time, and warnings.

## `compositionText` vs `displayText`

`compositionText` is the raw active buffer.

Examples:

- Romanized mode: `swas`
- Traditional placeholder mode: `abc`

`displayText` is the Unicode preview intended for OS marked/composition display.

Examples:

- `swasthya` -> `स्वास्थ्य`
- Traditional placeholder keeps `abc` until audited mapping exists.

Native integrations must treat these as separate values. The raw buffer is not always the preview.

## Native Range Semantics

All public ranges use UTF-16 code units at the native boundary.

- `Candidate.replaceRange`: range in active composition buffer that a candidate replaces.
- `CommitResult.consumedRange`: range in active composition buffer consumed by the commit.
- `CommitResult.replacementRange`: range inside already committed surrounding context, mainly for proofread corrections.

If both `replacementRange` and `consumedRange` appear, the bridge applies `replacementRange` first, then clears/consumes `consumedRange`.

Helpers live in `src/engine/keyboard/ranges.ts`:

- `validateRange`
- `clampRange`
- `sliceByUtf16Range`
- `replaceByUtf16Range`
- `insertAtCaret`
- `deleteBeforeCaret`
- `deleteAfterCaret`

## Browser/Web-Lab Path

Use `updateComposition(sessionId, input, cursor)`.

The caller sends the full active composition string. This is the simplest path for React input events and local testing.

## Native IME Path

Use `processKeyStroke(sessionId, key)`.

The caller sends one normalized key event at a time. This path is required for Windows TSF and macOS InputMethodKit bridges.

Prompt 1 implements:

- printable character append;
- Backspace;
- Delete;
- Enter;
- Tab;
- Escape;
- Space as conservative composition insertion in the browser/web-lab foundation;
- modifier shortcut pass-through warning.

Prompt 2 and native bridge policy may add user-configurable Space auto-commit once acceptance and undo behavior are measured.

## Prompt 2 Intelligence Layer

Prompt 2 adds live keyboard behavior behind the same API:

- Romanized candidates update per keystroke.
- Romanized helper suggestions are available as secondary candidates.
- Candidate labels can show Romanized forms when `showRomanizedLabels` is true.
- Traditional physical key mapping remains placeholder-safe, while Unicode Traditional suggestions work.
- Proof hints populate `CandidateUpdate.proofHints`.
- Dictionary lookup returns local `DictionaryResult` rows without unsafe meanings.
- `commitCandidate` records local correction memory outside secure contexts.
- `CommitResult.followupCandidates` returns conservative phrase continuations.

## Secure Fields

If `TypingContext.secureInput` is true, or field type is `password` or `code`:

- candidates are empty;
- proof hints are empty;
- memory is not recorded;
- display text remains raw;
- warnings explain raw pass-through behavior.

## Traditional Placeholder

Traditional mode currently preserves raw composition and emits a warning:

`Traditional layout mapping pending source-of-truth audit; preserving composition.`

This is intentional. Final Traditional mapping must wait for the audit artifacts.

## Warm Startup

`warm(options?: WarmOptions)` must not block forever.

- `warm()` returns full readiness for lightweight modules.
- `warm({ timeoutMs })` may return `partial: true`.
- Partial warm still leaves the basic typing path usable.

## Ranking And Latency

Candidate linguistic ranking does not include a latency-cost penalty. Performance is controlled through:

- candidate caps;
- bounded lookups;
- caching;
- lazy loading;
- performance benchmarks.

Latency is reported in `CandidateUpdate.latencyMs` and benchmark reports, not mixed into linguistic score.
