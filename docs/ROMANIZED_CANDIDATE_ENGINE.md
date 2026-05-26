# Romanized Candidate Engine

Updated: 2026-05-26

## Goal

The Romanized engine should not blindly mutate text. It should convert when confidence is justified, expose ranked candidates when ambiguous, and preserve/warn when unsafe.

## Implemented Components

- Tokenizer: separates words, numbers, protected spans, whitespace, punctuation, and unknown tokens.
- Max-match trie: reusable deterministic matcher for Romanized rule inventories.
- Syllable candidates: bounded alternatives from longest-match parsing, broad conjunct parsing, non-conjunct parsing, initial `ri`, and `x`/`ksh` repair.
- Number policy: `preserve-ascii`, `convert-devanagari`, and `context-dependent`.
- Loanword policy: project-owned loanword entries are candidates; mixed mode may preserve English terms.
- Confidence gate: reports Latin residue, low rank gap, and no-candidate cases.
- Memory integration: `correctionMemoryEntries` can boost exact local choices without becoming global lexicon data.
- Phrase-first protected safety: full phrase matches can win before protection only when every protected original survives byte-exactly.

## Candidate Caps

Candidate explosion is controlled by hard caps, not by score penalties:

- max candidates per token: 12
- max raw phonetic candidates per token: 6
- max displayed alternatives: 5
- max phrase window: 5

## No-Silent-Corruption Behavior

The engine returns diagnostics instead of pretending uncertain outputs are definitive. If Latin residue remains outside protected spans, the confidence gate lowers confidence and emits `ROMANIZED_LATIN_RESIDUE`.

## Current Evidence

`npm run benchmark:romanized:self` checks 2,130 facade-level cases:

- normalized stability: 1.0000
- output represented in top candidates: 1.0000
- candidate caps honored: 1.0000
- protected preservation: 1.0000
- failures: 0

This is self-consistency evidence, not competitor proof.
