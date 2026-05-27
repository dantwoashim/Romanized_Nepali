# Next-Word Prediction

Prompt 2 status: conservative local baseline implemented.

The next-word baseline returns `CommitResult.followupCandidates` after a committed candidate. It uses local phrase continuations and memory-compatible ranking only. It is not a language model and does not use network calls.

## Current Examples

| Committed word | Followups |
| --- | --- |
| जिल्ला | प्रशासन, कार्यालय |
| नेपाल | सरकार |
| स्वास्थ्य | कार्यालय, सेवा, मन्त्रालय |
| शिक्षा | मन्त्रालय |
| नागरिकता | प्रमाणपत्र, प्रमाण पत्र |
| जन्म | दर्ता |
| मृत्यु | दर्ता |

## Safety

- Disabled in secure input.
- Conservative confidence only.
- No silent insertion. Followups are candidates, not automatic text.
- No typed-text telemetry or remote prediction.

## Measurement

`npm run benchmark:typing-session` reports `nextWordSuccessRate` and KSR baseline. Prompt 2 expanded next-word fixtures for government and civil-registration phrases.

## Prompt 3 Work

Prompt 3 may connect native shells and daemon IPC to the same followup result contract. It must not claim production native prediction until TSF/IMK candidate UI is tested on real apps.
