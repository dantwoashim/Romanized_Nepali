# macOS Packaging And Notarization

Status: planned; no signed or notarized production build exists.

## Packaging Strategy

- IMK bundle installed under `~/Library/Input Methods/`.
- XPC service packaged with the companion/daemon.
- Companion app manages status and diagnostics.

## Required Steps

- Build IMK bundle.
- Register input source.
- Install XPC service.
- Configure App Group/shared container if required.
- Provide manual enable steps in macOS Keyboard settings.
- Provide uninstall cleanup.

## Signing And Notarization

- Apple Developer ID required.
- Notarization required for distribution.
- XPC and sandbox restrictions must be validated.

## Updates

- Sparkle or signed installer later.
- Updates must not interrupt active composition.

## Secure Field Behavior

- Detect secure input where available.
- Disable suggestions and memory.
- Pass through if uncertain.

## External Blockers

- Developer ID.
- Notarization credentials.
- Real macOS IMK/XPC testing.
- Pilot feedback.
