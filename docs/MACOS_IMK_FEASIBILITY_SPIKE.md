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
- Secure input must pass through or suppress suggestions/memory according to OS policy.

## IPC

macOS uses XPC, not a vague local IPC channel. The XPC service hosts the engine or bridges to the daemon and must fail open on timeout.

## Test Matrix

- TextEdit
- Safari
- Chrome
- Pages
- VS Code
- Notes

## Install And Packaging Notes

- Local proof spike installs under `~/Library/Input Methods/`.
- User must enable the input source in macOS Keyboard settings.
- XPC service must be bundled and signed with the input method.
- Developer ID and notarization are required before external distribution.
- Sparkle or a signed installer can be evaluated after the proof spike.

## Production Blockers

- Apple Developer ID.
- Notarization.
- XPC and sandbox validation.
- Real macOS app test matrix.
- Pilot feedback.
