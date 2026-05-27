# Keyboard Candidate Ranking

Updated: 2026-05-27

Keyboard ranking is a bounded hot-path policy layered on top of the existing Romanized, dictionary, proofread, and memory modules.

## Priority Order

1. Protected structured tokens.
2. Local correction memory.
3. Exact keyboard phrase and office vocabulary rows.
4. Local dictionary and phrase prefix suggestions.
5. Existing Romanized engine candidates.
6. Raw Romanized helper candidate.
7. Romanized helper completions.

Traditional Unicode suggestions use explicit phrase completions first, then local dictionary prefix matches.

## Ranking Factors

- exact phrase match;
- prefix match;
- alias and dictionary validity;
- domain relevance;
- user memory boost;
- protected token safety;
- ambiguity and collision penalty;
- English corruption prevention.

## Caps

- maximum displayed candidates: 8;
- raw hot-path candidates are bounded before helper suggestions are appended;
- helper suggestions reserve a small tail slot and do not dominate primary Unicode candidates.

## Latency

Latency is not a linguistic ranking feature. Performance is handled with caps, caching, lazy loading, and benchmarks.

## Safety

High-collision or low-confidence cases should remain candidates, not forced auto-commit. Protected spans always win.
## Prompt 2 Production Update

Prompt 2 preserves the Prompt 1 candidate pipeline: generate, normalize, protect, dedupe, merge reasons, score, sort, cap, and assign sequential shortcuts. Typing-session benchmarks now report duplicate candidate count and shortcut sequence validity.

Current fixture result: duplicate candidate count is 0 and shortcut sequence validity is 1.0. Latency is not used as a linguistic ranking factor.
