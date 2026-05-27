# Romanized Keyboard Mode

Updated: 2026-05-27

Romanized keyboard mode is the primary live typing path for general users. It runs through `KeyboardEngine`, not the document converter UI.

## Behavior

- `compositionText` keeps the raw Romanized buffer, such as `swasthya`.
- `displayText` previews the highest-ranked Unicode candidate, such as `स्वास्थ्य`.
- Candidates update on every `updateComposition` or `processKeyStroke`.
- Protected office tokens such as `NID`, `Form No. 2079-080`, `ward-05`, URLs, emails, and phone numbers are preserved.
- Secure, password, and code fields disable suggestions and memory.

## Current Covered Examples

- `swas` -> `स्वास्थ्य`, `स्वस्थ`, helper completions.
- `swasthya` -> `स्वास्थ्य`.
- `swasthya karyalaya` -> `स्वास्थ्य कार्यालय`.
- `jilla pra` -> `जिल्ला प्रशासन`, `जिल्ला प्रशासन कार्यालय`.
- `nagarikta pr` -> `नागरिकता प्रमाणपत्र`, `नागरिकता प्रमाण पत्र`.
- `shiksha mantralaya` -> `शिक्षा मन्त्रालय`.
- `rajaniti` -> `राजनीति`.
- `raajanitigya` -> `राजनीतिज्ञ`.
- `mero NID form` preserves `NID form`.

## Limits

This mode is validated in the browser Keyboard Lab and typing-session benchmark. It is not yet a production Windows/macOS input method; native integration is Prompt 3 scope.
## Prompt 2 Production Update

Romanized live typing now has expanded per-keystroke coverage for health, office, government, civil-registration, and protected mixed-input cases. Required examples such as `swas`, `swasthya karyalaya`, `jilla pra`, `jilla prashasan karyalaya`, `nagarikta pr`, `janma dar`, `mrityu dar`, `rajaswa shakha`, `kar karyalaya`, `sankalpa`, and `driDha` are covered by keyboard tests or typing-session fixtures.

The mode still uses the existing Romanized engine and keyboard wrapper. It does not create a second transliteration engine, does not use network services, and does not claim native IME completion.
