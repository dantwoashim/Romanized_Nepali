# Input Surface Strategy

Checked: 2026-05-26

Do not start native input surfaces before the engine has real-user evidence. Browser/PWA remains the validation surface.

## Browser / PWA

Role:

- engine validation
- demo
- document conversion
- benchmark-facing UX
- feedback capture with explicit user action

Status: implemented web/PWA prototype.

## Tauri Companion App

Role:

- desktop shell
- settings
- local storage
- document conversion
- dictionary management
- correction memory review

Not a true IME by itself. Do not treat Tauri as native typing support.

Status: future technical preview only.

## Keyman / Provider Keyboard Path

Role:

- possible traditional layout experiment
- possible fast typing-surface validation
- shell around selected behavior

It must not replace Lekh's core engine or become the system of record for ranking/proofread/memory.

Status: research path only.

## Windows TSF

Role:

- long-term true Windows IME
- candidate UI and composition lifecycle
- display attributes and OS integration

Status: high-complexity future native work.

## macOS InputMethodKit

Role:

- long-term true macOS input method
- candidate window and input mode integration

Status: high-complexity future native work.

## Responsibility Split

OS adapter:

- keystrokes
- focus/composition lifecycle
- candidate window plumbing
- display attributes
- platform integration

Lekh core:

- classification
- protected spans
- conversion
- ranking
- proofread
- memory
- benchmark parity

Recommendation: validate engine in browser/PWA, use Tauri only as a desktop utility companion, explore provider shells only after engine demand is proven, and defer TSF/IMK until quality and demand justify platform cost.
