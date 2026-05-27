# First-Run Onboarding Defaults

Generated: 2026-05-27

These defaults define the first-run behavior for the future Lekh Keyboard product.

## Mode Choice

Ask the user to choose:

- Romanized typing;
- Traditional typing;
- Both.

If the user skips:

- default to Romanized for general new users;
- default to Traditional/LTK-compatible only for an LTK migration flow after the layout audit confirms compatibility.

## Proofread

- Default: conservative.
- Show hints rather than auto-rewriting names or ambiguous words.
- Let users disable proofread hints.

## Local Memory

- Default: on.
- Explain that memory is local.
- Provide reset/export controls.
- Disable memory in secure/password/code fields.

## Network And Telemetry

- Network telemetry: off / none.
- Typed text is not uploaded.
- Crash diagnostics must not include typed content unless the user explicitly exports a diagnostic bundle.

## Dictionary

- Word existence, spelling variants, Romanized aliases, and domain tags are allowed from reviewed sources.
- Meanings are disabled until a safe licensed source exists.

## Candidate Behavior

- Auto-commit on Space is conservative.
- In Prompt 1 browser lab, Space keeps composition so phrase candidates can be measured.
- Future native pilots may enable Space auto-commit only for high-confidence Romanized candidates after undo/acceptance metrics support it.

## Labels

- Romanized labels are off by default in Traditional mode.
- Romanized labels are available in settings for learning/debugging.

## Secure Fields

In password, secure, or code fields:

- suggestions disabled;
- proof hints disabled;
- memory disabled;
- raw input preserved.
