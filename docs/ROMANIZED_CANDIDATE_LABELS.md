# Romanized Candidate Labels

Prompt 2 status: implemented for known strong candidates and Keyboard Lab diagnostics.

Romanized labels are optional explanatory text attached to Unicode candidates. They help a learner or reviewer understand why a candidate appeared, for example:

| Candidate | Label |
| --- | --- |
| स्वास्थ्य कार्यालय | swasthya karyalaya |
| नागरिकता प्रमाणपत्र | nagarikta pramanpatra |
| जिल्ला प्रशासन | jilla prashasan |
| राजनीतिज्ञ | raajanitigya |

## Rules

- Labels are shown only when `TypingContext.showRomanizedLabels` is true.
- Labels come from candidate trace, curated phrase aliases, dictionary aliases, or local memory.
- Labels are optional. Unknown candidates may omit labels.
- Labels are not dedupe keys and must not create fake uniqueness.
- Low-confidence guessed labels are not generated.

## UI

Keyboard Lab exposes a Romanized label toggle and shows labels on candidate chips. Normal users can keep labels off; diagnostic mode can keep them on.

## Limits

Prompt 2 does not complete native IME UI. Native TSF/IMK candidate windows in Prompt 3 must decide how much label text can fit without clutter.
