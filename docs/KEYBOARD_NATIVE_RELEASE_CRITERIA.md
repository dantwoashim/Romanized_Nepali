# Keyboard Native Release Criteria

Generated: 2026-05-27

## Native Proof-Spike Gate

Windows TSF must prove:

- TSF text service registers and unregisters cleanly;
- key events are received;
- composition starts, updates, commits, and cancels;
- dummy candidate UI can be shown;
- static Unicode commit works;
- daemon unavailable path passes through;
- named pipe IPC timeout is bounded.

macOS IMK must prove:

- input method bundle loads;
- `IMKInputController` receives key events;
- marked text works;
- candidate UI can be shown;
- static Unicode commit works;
- XPC unavailable path passes through;
- install/enable/uninstall path is documented.

## Native Production Gate

Required before production release:

- real Windows and macOS host app testing;
- signed Windows installer;
- Apple Developer ID and notarization;
- no-freeze IPC behavior under daemon crash;
- secure-field pass-through behavior verified;
- local storage migration tested;
- update and uninstall tested;
- privacy review complete;
- pilot feedback collected and triaged.

## Test App Matrix

Windows:

- Notepad;
- Word;
- Chrome;
- Edge;
- VS Code;
- Excel;
- representative government web form.

macOS:

- TextEdit;
- Safari;
- Chrome;
- Pages;
- Notes;
- VS Code.

## Current Status

Repo-executable scaffolds and docs exist. Native production release is blocked by native implementation, platform testing, code signing, notarization, and pilot feedback.
