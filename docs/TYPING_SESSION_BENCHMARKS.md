# Typing Session Benchmarks

Updated: 2026-05-27

See `docs/KEYBOARD_TYPING_BENCHMARKS.md` for the canonical benchmark description.

This file exists because the keyboard plan refers to `TYPING_SESSION_BENCHMARKS.md`; both names describe the same `npm run benchmark:typing-session` harness.
## Prompt 2 Production Update

Typing-session fixtures expanded to 58 cases across Romanized live typing, government phrases, helper suggestions, protected input, Traditional Unicode suggestions, proofread, dictionary lookup, memory ranking/controls, and next-word prediction.

The report now includes duplicate candidate count, shortcut sequence validity, Romanized label hit rate, proofread hit rate, dictionary hit rate, memory boost success, next-word success, latency p50/p95, commit latency, and KSR baseline.
