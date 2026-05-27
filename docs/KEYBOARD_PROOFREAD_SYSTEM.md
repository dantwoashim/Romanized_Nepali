# Keyboard Proofread System

Prompt 2 status: proofread hints are wired into live keyboard sessions.

The keyboard proofread path scans active Unicode composition and recent text window through `KeyboardEngine.getProofHints()` and `CandidateUpdate.proofHints`.

## Hint Types

- spelling
- postposition
- normalization
- matra
- halanta
- compound
- name variant

Each hint includes range, original text, suggestion, type, confidence, action, and explanation.

## Current Covered Examples

| Input | Hint |
| --- | --- |
| सवस्थ्य | स्वास्थ्य |
| प्रनलि | प्रणाली |
| राजनितिज्ञ | राजनीतिज्ञ |
| हरु | हरू |
| विद्यालय को | विद्यालयको |
| मन्त्रालय ले | मन्त्रालयले |

## Safety

- No destructive autocorrect in Prompt 2.
- Protected tokens are skipped.
- Secure input disables proofread.
- Ambiguous names remain hint-only or ask.
- Personal dictionary and memory controls can suppress unwanted suggestions where supported.

## UI

Keyboard Lab shows proof hints beside candidates and warnings. The lab is a validation surface, not the final native keyboard UI.
