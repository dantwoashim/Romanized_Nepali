# Traditional Suggestions And Proofread

Updated: 2026-05-27

Traditional suggestions work over Unicode text windows. They do not require a finalized physical keymap.

## Suggestions

The keyboard suggestion path uses local dictionary and phrase data to complete Devanagari prefixes.

Covered examples:

- `स्वा` -> `स्वास्थ्य`, `स्वास्थ्य कार्यालय`, `स्वास्थ्य बीमा`.
- `कार्या` -> `कार्यालय`.
- `जिल्ला प्रशा` -> `जिल्ला प्रशासन`, `जिल्ला प्रशासन कार्यालय`.

## Proof Hints

Proof hints are sourced from the existing proofread engine and are conservative.

Covered examples:

- `सवस्थ्य` -> `स्वास्थ्य`.
- `विद्यालय को` -> `विद्यालयको`.

## Safety

- Secure/password/code fields return no suggestions or proof hints.
- Hints do not rewrite committed text without user action.
- Name and style-sensitive cases should remain hint-only or ask-first.

## Pending

Physical key-to-Unicode Traditional typing waits for the layout audit artifacts.
## Prompt 2 Production Update

Traditional Unicode suggestions and proofread work without depending on a guessed physical layout. The physical keymap remains blocked by human/source-of-truth validation, while Unicode input can still receive prefix completions, proof hints, and Romanized labels where known.
