# macOS IMK Feasibility Spike

Status: scaffolded, not production.

Files:

- `native/macos-imk/README.md`
- `native/macos-imk/feasibility/README.md`
- `native/macos-imk/skeleton/LekhInputController.placeholder.swift`
- `native/macos-imk/skeleton/Package.swift`
- `native/macos-imk/skeleton/lekh_imk_contract.md`

## Feasibility Goal

Prove a macOS InputMethodKit input method can:

- receive key events,
- set marked text,
- show a dummy candidate,
- commit static Unicode,
- pass through when XPC is unavailable,
- install and uninstall clearly.

## Components

- `IMKInputController`
- `IMKCandidates`
- marked text
- commit text
- input source registration
- bundle under `~/Library/Input Methods/`
- XPC service for engine access
- App Group/shared container if needed

## Skeleton Behavior

- Test key `k` can emit dummy candidate `क`.
- Enter commits.
- Escape cancels.
- XPC failure passes through.
- Native `IMKCandidates` is the first candidate UI path.
- Custom `NSPanel` candidate UI is later.

## IPC

macOS uses XPC, not a vague local IPC channel. The XPC service hosts the engine or bridges to the daemon and must fail open on timeout.

## Test Matrix

- TextEdit
- Safari
- Chrome
- Pages
- VS Code
- Notes

## Production Blockers

- Apple Developer ID.
- Notarization.
- XPC and sandbox validation.
- Real macOS app test matrix.
- Pilot feedback.
