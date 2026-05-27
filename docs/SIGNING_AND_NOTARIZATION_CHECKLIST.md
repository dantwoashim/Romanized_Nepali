# Signing and Notarization Checklist

Generated: 2026-05-28

## Windows

- Status: `blocked-external`.
- Required: code-signing certificate.
- Sign:
  - TSF DLL.
  - daemon executable.
  - companion executable.
  - MSI installer.
- Verify:
  - signature timestamp.
  - SmartScreen reputation plan.
  - install/uninstall under standard user.
  - crash dumps and logs are local/redacted.

## macOS

- Status: `blocked-external`.
- Required: Apple Developer ID Application certificate and notarization access.
- Sign:
  - companion app.
  - `.inputmethod` bundle.
  - XPC service.
  - daemon/helper.
- Enable hardened runtime.
- Notarize and staple.
- Verify:
  - `spctl --assess`.
  - first launch without quarantine warnings.
  - input method enablement after install.
  - uninstall cleanup.

## Owner / Action

| Item | Owner | Status | Next action |
| --- | --- | --- | --- |
| Windows cert | release/product | blocked-external | Purchase or provision certificate. |
| Apple Developer ID | release/product | blocked-external | Enroll or grant team certificate access. |
| Signed artifact validation | QA/release | pending | Run after native artifacts exist. |
