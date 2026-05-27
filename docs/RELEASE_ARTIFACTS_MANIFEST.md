# Release Artifacts Manifest

Generated: 2026-05-28

## Internal Dev Build

- Web/lab build from `npm run build`.
- TypeScript daemon dispatcher validation from `npm run build:daemon`.
- Native proof-spike source under `native/windows-tsf` and `native/macos-imk`.
- Scorecards and benchmark reports under `bench/reports`.

## Windows Release Artifacts

Status: blocked until native Windows validation and signing.

- signed TSF DLL.
- signed daemon executable.
- signed companion executable.
- signed MSI installer.
- release notes.
- privacy policy.
- checksum manifest.

## macOS Release Artifacts

Status: blocked until IMK/XPC validation, Developer ID, and notarization.

- signed companion app.
- signed `.inputmethod` bundle.
- signed XPC service.
- signed daemon/helper.
- notarized installer or disk image.
- release notes.
- privacy policy.
- checksum manifest.

## Public Claim Gate

Do not claim production Windows/macOS release until the platform artifacts above exist and pass install, update, uninstall, and host-app typing validation.
