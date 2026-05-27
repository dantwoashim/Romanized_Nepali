# Next-Word Prediction Contract

Generated: 2026-05-27

Prompt 1 defines the next-word prediction contract without implementing a statistical language model.

## Field

`CommitResult.followupCandidates` is the output location for next-word predictions.

It is generated after a successful commit and may contain candidates with types:

- `phrase`
- `completion`
- `personal`
- `dictionary`

## Behavior

Follow-up candidates:

- are based on the committed word and left context;
- may use domain hints and local memory once implemented;
- must stay local-first;
- must not use network calls;
- must not auto-insert text;
- should be shown immediately only if enabled and confidence is high;
- otherwise become context boosts when the user starts the next word.

## Prompt 1 Implementation

Prompt 1 returns an empty list by default.

This is intentional because no reviewed bigram or phrase-continuation source has been promoted into the keyboard hot path yet.

## Prompt 2 Direction

Prompt 2 may populate this field from:

- curated phrase continuations;
- office/government phrase packs;
- personal memory;
- context-limited dictionary completions.

## Safety Rules

- Never insert a next-word prediction without explicit user action.
- Do not learn from secure/password/code fields.
- Do not let memory override protected spans.
- Keep follow-up candidate count bounded.

## Metrics

Future typing-session benchmarks should report:

- top-3 next-word inclusion;
- acceptance rate;
- ignored/rejected rate;
- keystrokes saved when accepted.
