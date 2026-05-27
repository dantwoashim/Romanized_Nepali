# Windows Packaging And Signing

Status: planned; no signed production build exists.

## Packaging Strategy

- Start with signed MSI or installer that can register TSF cleanly.
- Prefer per-user install first.
- Validate MSIX only after TSF registration constraints are proven.

## Required Steps

- Build TSF DLL.
- Register language profile.
- Install and start daemon at user login.
- Configure per-user named pipe permissions.
- Install companion app.
- Add uninstall cleanup for TSF registration, startup task, daemon, and local files.

## Signing

- Windows code-signing certificate required.
- Unsigned production keyboard distribution is blocked.

## Updates

- Companion-managed update flow or signed installer update.
- Daemon restarts must happen outside the keystroke hot path.

## Secure Field Behavior

- Detect password/input scope.
- Disable suggestions and memory.
- Pass through if uncertain.

## External Blockers

- Code-signing certificate.
- Real Windows TSF testing.
- Installer QA.
- Pilot feedback.
