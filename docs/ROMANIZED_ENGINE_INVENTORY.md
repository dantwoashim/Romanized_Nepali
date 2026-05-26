# Romanized Engine Inventory

Updated: 2026-05-26

## Preserved Infrastructure

- `src/core/transliteration/transliterateRomanized.ts`: existing lattice-style converter with phrase, dictionary, rule, repair, and local-correction compatibility.
- `src/core/transliteration/devanagariComposer.ts`: greedy Romanized token composer with vowel, vocalic `ri`, cluster, and conjunct handling.
- `src/core/transliteration/phraseRanker.ts`: sliding-window phrase matcher.
- `src/core/transliteration/localCorrectionMemory.ts`: legacy local-correction compatibility.
- `src/engine/romanized/index.ts`: facade wrapper used by the UI.
- `src/engine/protected`: protected-span safety layer.
- `src/engine/lexicon`: lexical authority loader for seed words, aliases, phrases, loanwords, and preserve terms.

## Correctness Additions

- `tokenizer.ts`: explicit word/number/protected/punctuation tokenizer.
- `maxMatch.ts`: reusable max-match trie.
- `clusters.ts`: exported max-match rule inventory and high-value generic conjunct pairs.
- `syllables.ts` and `phonetic.ts`: bounded syllable candidate generation.
- `numbers.ts`: mode-aware number policy.
- `loanwords.ts`: loanword candidate policy backed by lexical authority.
- `confidence.ts`: no-silent-corruption confidence gate.
- `aliasFactory.ts`, `aliasTrie.ts`, `aliasGraph.ts`: weighted alias variant generation, lookup, and collision reporting.

## Current User Path

The UI calls `convertRomanized` from `src/engine`. The facade now:

1. classifies input,
2. extracts protected spans for mixed mode,
3. allows phrase-first full-text conversion only if protected originals survive byte-exactly,
4. merges core candidates, local correction memory, loanword candidates, and syllable candidates,
5. caps candidates,
6. runs confidence diagnostics,
7. attaches proofread output when requested.

## Not Replaced

The core converter was not deleted or rewritten. The current work adds an auditable correctness shell behind the engine facade and leaves the existing core path available.
