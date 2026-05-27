# Installer and Uninstaller Checklist

Generated: 2026-05-28

## Install

- Install companion app.
- Install per-user daemon/service.
- Install native input method:
  - Windows: register TSF language profile.
  - macOS: copy `.inputmethod` bundle and XPC service.
- Create local data directory:
  - Windows: `%APPDATA%/Lekh Keyboard/`
  - macOS: `~/Library/Application Support/Lekh Keyboard/`
- Show privacy policy and local-first data explanation.
- Do not enable hidden telemetry.

## Update

- Preserve settings, personal dictionary, and memory.
- Apply migrations before daemon start.
- Roll back if daemon or input method fails health check.
- Keep previous installer available for rollback.

## Uninstall

- Unregister native input method.
- Stop daemon/service.
- Remove startup entries.
- Remove companion app.
- Ask before deleting personal dictionary, memory, and settings.
- Remove logs only after export option is offered.

## Required Evidence Before Release

- Clean install.
- Update install.
- Repair install.
- Uninstall with data preserved.
- Uninstall with data deleted.
- Standard user install.
- Crash during update recovery.
