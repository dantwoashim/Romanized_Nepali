# Keyboard App Prerequisites

Keyboard app work must wait until conversion correctness is stable enough that a native input surface will not hide engine flaws.

## Required Before Native Keyboard Work

- `npm run verify` passes.
- `npm run benchmark:mixed-span-mutations` passes with zero silent corruption.
- Hard Romanized stress suite is included and passing or candidate-gated.
- Preeti selected path passes hard supported-profile fixtures.
- Protected spans pass in mixed Preeti and mixed Romanized modes.
- Scorecards separate generated, manual, hostile, contaminated, competitor, and real-document buckets.
- UI exposes warnings, candidates, protected spans, and decoder/profile state.
- Public claims remain conservative.
- No consented real-user document protocol gaps are hidden.
- Native input surfaces consume span-routed `ConversionResult` metadata rather than calling pure Romanized or pure Preeti converters directly.

## Required Before Public Keyboard Claims

- Consented real Preeti/Romanized documents collected and redacted.
- Manual competitor probes collected legally.
- Alias collision review reduced for common ambiguous names and phrases.
- Native-platform prototype proves composition/candidate-window behavior without bypassing `src/engine`.

## Recommended Sequence

1. Continue web/PWA correctness review.
2. Collect controlled real-user feedback and consented fixtures.
3. Harden candidate and memory behavior from real corrections.
4. Build Tauri companion utility for document conversion and settings.
5. Prototype Keyman/provider shell only if it can call the same engine semantics.
6. Start Windows TSF/macOS InputMethodKit work after engine quality and demand are proven.
