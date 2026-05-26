# Engine Safety Foundation

Status: Prompt 1 safety layer implemented for local validation. This document describes the reusable facade and safety boundaries added before deeper Romanized, Preeti, dictionary, and desktop work.

## Scope

Lekh is treated as a local-first Nepali input engine, not only a one-off converter. Phase 1 adds engine contracts, input classification, protected spans, mixed/strict wrappers, diagnostics, and benchmark hooks around the existing converters.

This phase does not rewrite the Romanized parser, replace the Preeti baseline, expand Hunspell data, add new external corpora, add desktop/native keyboard features, or claim superiority over other tools.

## Public Engine API

The facade lives under `src/engine` and exports:

- `convert(input, options)`
- `classifyDocument(input, options)`
- `extractProtectedSpans(input, mode)`
- `restoreProtectedSpans(text, spans)`
- `convertRomanized(input, options)`
- `convertPreeti(input, options)`

Existing converter modules remain in place:

- `src/core/transliteration/transliterateRomanized.ts`
- `src/core/preeti/convertPreetiToUnicode.ts`

The engine wrappers call those modules internally and add classification, protection, diagnostics, warnings, trace metadata, and optional timing.

## Modes

Phase 1 defines stable mode names for future work:

- `auto`
- `romanized-strict`
- `romanized-mixed`
- `romanized-government`
- `romanized-legal`
- `romanized-education`
- `romanized-health`
- `romanized-name-heavy`
- `preeti-strict`
- `preeti-mixed`
- `legacy-profile`
- `unicode-passthrough`
- `proofread-only`
- `unknown-diagnostic`

`romanized-health` is a reserved mode name only. It currently downgrades to mixed Romanized behavior because no reviewed health terminology pack exists.

## Classification

The classifier is conservative. It uses:

- Devanagari ratio
- Latin ratio
- digit/symbol ratio
- protected token count
- Preeti glyph coverage
- Preeti sequence and punctuation likelihood
- English/digital token likelihood
- Romanized Nepali cue likelihood
- office-document pattern likelihood

Plain ASCII is not treated as Preeti only because it is mappable. Phase 1 requires stronger Preeti evidence such as known Preeti sequences or legacy punctuation patterns before recommending Preeti mode.

## Protected Spans

Protected spans prevent corruption of byte-sensitive document content:

- emails
- URLs
- phone numbers
- structured IDs and dates
- file names
- all-caps acronyms
- office labels such as `Form No.` and `Ward No.`
- quoted examples
- mixed-document English terms and phrases such as `online form`, `record system`, and `final output`

Loanwords are not protected span kinds. They are routing/ranking candidates for future engine phases.

`ask-user` routing exists in the type system but degrades to warning/metadata in Phase 1. There is no interactive disambiguation UI in this pass.

## Sentinel Safety

The protected-span engine supports a safe sentinel bridge using Private Use Area markers with a per-call salt and span index. The wrappers currently use token nodes so protected text is not sent through the legacy converter hot path. Restoration still verifies:

- each placeholder appears exactly once
- missing placeholders throw `EngineCorruption`
- duplicate placeholders throw `EngineCorruption`
- leftover sentinels throw `EngineCorruption`
- hard-protected originals survive byte-exactly

## Strict vs Mixed Preeti

`preeti-strict` preserves existing behavior and calls the current Preeti converter directly. If English/digital protected-like spans are detected, strict mode emits a warning recommending mixed mode.

`preeti-mixed` shields protected spans first, converts only unprotected legacy-font text, then restores protected originals byte-exactly.

## Verification

New phase-1 checks:

- `npm run check:engine-local`
- `npm run check:engine-no-dom`
- `npm run benchmark:protected`
- `npm run bench:perf`
- `npm run verify:engine`

`npm run verify` includes `verify:engine`; `bench:perf` remains a separate performance skeleton command and fails only on gross slowdowns over 10x the initial gate.

## Data and Privacy

No new external data was added in this phase. The protected-span fixtures are project-owned hostile examples and do not contain real user documents.

The `src/engine` layer contains no network calls and no DOM/browser hot-path dependency. Typed text, converted text, protected spans, spell tokens, and benchmark content remain local.
