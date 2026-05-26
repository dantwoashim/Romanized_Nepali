# UI Engine Routing

Checked: 2026-05-26

## Previous Routing

- `PreetiConverter.tsx` called `convertPreetiToUnicode` directly from `src/core/preeti`.
- `RomanizedEditor.tsx` called `transliterateRomanized` directly from `src/core/transliteration`.

That meant the actual user path could bypass engine-level classification, protected-span handling, diagnostics, and future confidence gates.

## Current Routing

- `PreetiConverter.tsx` calls `convertPreeti` from `src/engine`.
- `RomanizedEditor.tsx` calls `convertRomanized` from `src/engine`.
- `CandidateBar.tsx` reads engine `Candidate` objects.
- `TransliterationTrace.tsx` renders engine `ConversionTrace` steps.

`rg` check for direct core converter imports in `src/features` and `src/app` returns no matches.

## Remaining Compatibility

The UI still uses existing suggestion, spell-hint, and local correction helpers. That is acceptable because those helpers are not the primary conversion mutation path. Correction memory and spell/proof behavior should continue moving behind stable engine contracts as product work matures.
