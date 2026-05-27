# Keyboard Readiness Gate

Status values: `complete`, `partial`, `blocked-external`, `blocked-human`, `blocked-native-environment`, `pending`.

## Engineering Foundation Gate

| Requirement | Status |
| --- | --- |
| KeyboardEngine API implemented | complete |
| session lifecycle works | complete |
| typing-session benchmark passes | complete |
| Keyboard Lab works | complete |
| no-DOM/no-network checks pass | complete |

## Intelligence Gate

| Requirement | Status |
| --- | --- |
| Romanized live typing works | complete |
| Romanized helper suggestions | complete |
| Traditional physical layout | blocked-human |
| Traditional Unicode suggestions | complete |
| proofread/dictionary/memory | complete |
| latency measured | complete |

## Native Feasibility Gate

| Requirement | Status |
| --- | --- |
| Windows TSF skeleton/docs | complete |
| macOS IMK skeleton/docs | complete |
| IPC contract | complete |
| daemon lifecycle | complete |
| fallback behavior | complete |
| native implementation tested | blocked-native-environment |

## Release Gate

| Requirement | Status |
| --- | --- |
| real Windows/macOS native testing | blocked-native-environment |
| signing/notarization | blocked-external |
| installer tested | pending |
| pilot feedback collected | blocked-human |
| privacy review complete | pending |
| crash handling tested | pending |
| update/uninstall tested | pending |

## Final Status

Prompt 1 production-foundation status: partial-complete. The repo has a stable foundation path, smoke/full verification split, native scaffolds, and honest release gates. Native production release is not complete and remains blocked by platform testing, signing/notarization, verified Traditional layout data, and pilot feedback.

## Evidence Required Before Public Release

- final audited Traditional layout or explicit Romanized-first release scope;
- native TSF/IMK proof spikes passing on real host apps;
- daemon timeout/pass-through tests;
- signed Windows installer;
- notarized macOS package;
- privacy review;
- consented private pilot feedback;
- final scorecard with fresh full benchmark reports.
