# UI Engine Routing

Checked: 2026-05-26

## Before Prompt 1

- `PreetiConverter.tsx` called `convertPreetiToUnicode` directly from `src/core/preeti`.
- `RomanizedEditor.tsx` called `transliterateRomanized` directly from `src/core/transliteration`.

That meant the actual user path could bypass engine-level classification, protected-span handling, diagnostics, and future confidence gates.

## After Prompt 1

- `PreetiConverter.tsx` calls `convertPreeti` from `src/engine`.
- `RomanizedEditor.tsx` calls `convertRomanized` from `src/engine`.
- `CandidateBar.tsx` reads engine `Candidate` objects.
- `TransliterationTrace.tsx` renders engine `ConversionTrace` steps.

`rg` check for direct core converter imports in `src/features` and `src/app` returns no matches.

## Remaining Compatibility

The UI still uses existing suggestion, spell-hint, and local correction helpers. That is acceptable for Prompt 1 because those helpers are not the primary conversion mutation path. Prompt 3 should continue moving correction memory and spell/proof behavior behind stable engine contracts.

