# Traditional Keyboard Mode

Updated: 2026-05-27

Traditional keyboard mode is present in the `KeyboardEngine` API, but physical key mapping remains pending until the layout source-of-truth audit is complete.

## Current Status

- `src/engine/traditional/*` exists.
- Layout artifacts remain marked pending.
- Latin physical key input is preserved and returns a warning.
- No guessed LTK or standard mapping is treated as production truth.

## Why Pending

The Traditional layout must be captured and verified against:

- LTK-compatible behavior.
- A verified Nepali Unicode keyboard standard.
- normal, Shift, AltGr/Option, and relevant modifier states.

Until those artifacts are reviewed, Traditional physical typing stays placeholder-safe.

## Implemented Today

Traditional sessions can still provide Unicode suggestions when the active buffer already contains Devanagari text, such as in the Keyboard Lab.

Examples:

- `स्वा` -> `स्वास्थ्य`.
- `कार्या` -> `कार्यालय`.
- `जिल्ला प्रशा` -> `जिल्ला प्रशासन`.

## Native Scope

Production Windows TSF and macOS IMK integration are not implemented in Prompt 2.
## Prompt 2 Production Update

Traditional physical key mapping remains pending because verified LTK-compatible layout data has not been manually captured. Prompt 2 does not fake a physical keymap.

Unicode-based Traditional suggestions and proofread are active in the Keyboard Lab and typing-session benchmarks. Examples include `स्वा`, `कार्या`, `जिल्ला प्रशा`, `सवस्थ्य`, `विद्यालय को`, and `मन्त्रालय ले`.
