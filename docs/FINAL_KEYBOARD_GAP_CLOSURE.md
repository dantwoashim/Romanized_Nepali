# Final Keyboard Gap Closure

Date: 2026-05-27

Status values: `complete`, `partial`, `blocked-external`, `blocked-human`, `blocked-native-environment`, `not applicable`.

## Prompt 1

| Item | Status | Notes |
| --- | --- | --- |
| scope freeze | complete | Keyboard-first scope documented. |
| engineering/product MVP split | complete | Browser lab and native product are separated. |
| Traditional layout audit scaffold | complete | Manual key capture remains blocked-human. |
| KeyboardEngine API | complete | API exported and tested. |
| processKeyStroke | complete | Required native path exists. |
| KeyboardKeyEvent | complete | Defined with platform metadata. |
| session lifecycle | complete | Begin/update/commit/cancel/end covered. |
| composition model | complete | Browser and native paths covered. |
| warm result | complete | Timeout/partial semantics exist. |
| range helpers | complete | UTF-16 helpers tested. |
| typing benchmark | complete | Expanded in Prompt 2. |
| Keyboard Lab foundation | complete | Upgraded in Prompt 2. |
| native feasibility docs | complete | Expanded into Prompt 3 scaffolds. |
| onboarding defaults | complete | Local-first defaults documented. |

## Prompt 2

| Item | Status | Notes |
| --- | --- | --- |
| Romanized live typing | complete | Live updates through `KeyboardEngine`. |
| Romanized helper suggestions | complete | Secondary surface exists. |
| candidate labels | complete | Optional Romanized labels exist. |
| ranking upgrades | complete | Bounded and tested through typing sessions. |
| Traditional mode | partial | Unicode suggestion path complete; physical keymap blocked-human pending audit. |
| Traditional suggestions | complete | Unicode prefix suggestions work. |
| proofread while typing | complete | Hints integrated. |
| dictionary lookup | complete | Safe word/alias lookup; meanings pending safe source. |
| local memory | complete | Local memory integrated; secure fields disabled. |
| next-word baseline | complete | Conservative phrase followups. |
| Keyboard Lab upgrade | complete | Candidates, proof, dictionary, memory, warnings visible. |
| typing benchmarks | complete | 33 fixtures, 0 failed sessions in current report. |
| scorecard updates | complete | Keyboard section included. |

## Prompt 3

| Item | Status | Notes |
| --- | --- | --- |
| native repo structure | complete | `native/*` scaffold exists. |
| IPC schema | complete | JSON schema and typed TS messages exist. |
| daemon lifecycle | complete | Lifecycle and failure policy documented. |
| Windows TSF feasibility scaffold | complete | Placeholder C++ and docs exist. |
| macOS IMK feasibility scaffold | complete | Placeholder Swift and docs exist. |
| companion scaffold | complete | `native/companion` and architecture doc exist. |
| storage adapters | complete | Contracts and in-memory adapters exist. |
| performance report | complete | p95 metrics documented. |
| packaging docs | complete | Windows and macOS docs exist. |
| pilot feedback docs | complete | Consent-first plan exists. |
| final scorecard | complete | Native/keyboard sections generated. |
| readiness gate | complete | Gate statuses explicit. |
| release docs | complete | Channels, updates, checklist documented. |

## Blocked Or Partial Items

| Item | Blocker | Category | Next Action |
| --- | --- | --- | --- |
| Traditional physical keymap | source-of-truth manual capture still required | blocked-human | Capture normal/Shift/AltGr/Option output from LTK and authoritative standard, then produce reviewed JSON layout. |
| production Windows keyboard | TSF implementation, signing, Windows test matrix missing | blocked-native-environment / blocked-external | Build TSF spike on Windows, test target apps, obtain code-signing certificate. |
| production macOS keyboard | IMK/XPC implementation, Developer ID, notarization missing | blocked-native-environment / blocked-external | Build IMK spike on macOS, test target apps, notarize signed bundle. |
| dictionary meanings | safe licensed meaning source unavailable | blocked-external | Select licensed source or keep meaning field unavailable. |
| public release | native QA and pilot evidence missing | blocked-human / blocked-native-environment | Run private pilot and platform QA after native implementation. |

## Final Claim

Repo-executable keyboard foundation complete. Native release still requires platform testing, signing/notarization, and pilot feedback.
